// cuenta.ts

import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideUser,
  LucidePencil,
  LucideChevronRight,
  LucideLock,
  LucideLogOut,
  LucideArrowRight,
  LucideCamera
} from '@lucide/angular';
import { CuentaService } from './cuenta.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideUser,
    LucidePencil,
    LucideChevronRight,
    LucideLock,
    LucideLogOut,
    LucideArrowRight,
    LucideCamera
  ],
  templateUrl: './cuenta.html',
  styleUrl: './cuenta.css'
})
export class Cuenta implements OnInit {

  private cuentaService = inject(CuentaService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly userName  = this.cuentaService.userName;
  readonly userEmail = this.cuentaService.userEmail;
  readonly userImage = this.cuentaService.userImage;

  editingField = signal<string | null>(null);
  editValue = '';
  isSaving = signal(false);

  ngOnInit(): void {
    this.cuentaService.loadPerfil();
  }

  onEditAvatar(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const fileName = file.name;

    this.isSaving.set(true);
    this.toastService.loading('Actualizando ruta de imagen...');

    // Solo guardamos la ruta (el nombre o enlace) en la base de datos
    this.cuentaService.updatePerfil({
      RutaImagen: fileName
    }).subscribe({
      next: () => {
        this.toastService.success('Ruta de imagen actualizada correctamente');

        // Previsualización local inmediata para feedback visual
        const reader = new FileReader();
        reader.onload = () => {
          this.cuentaService.userImage.set(reader.result as string);
        };
        reader.readAsDataURL(file);

        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error al guardar ruta', err);
        this.toastService.error('Error al actualizar la ruta de la imagen');
        this.isSaving.set(false);
      }
    });
  }

  onImageError(): void {
    this.cuentaService.userImage.set('');
  }

  startEdit(field: string, currentValue: string): void {
    this.editingField.set(field);
    this.editValue = currentValue;
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('.info-input')?.focus();
    }, 50);
  }

  saveField(field: string): void {
    if (this.isSaving()) return;

    const trimmedValue = this.editValue.trim();

    // Validaciones de campos vacíos
    if (field !== 'password' && !trimmedValue) {
      this.toastService.warning(`El campo ${field} no puede estar vacío`);
      return;
    }

    // Validaciones específicas
    if (field === 'correo') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedValue)) {
        this.toastService.warning('Ingresa un correo válido');
        return;
      }
    }

    if (field === 'password') {
      if (!trimmedValue) {
        this.toastService.warning('La contraseña no puede estar vacía');
        return;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!passwordRegex.test(trimmedValue)) {
        this.toastService.warning(
          'La contraseña debe tener: mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo (@$!%*?&)'
        );
        return;
      }
    }

    this.isSaving.set(true);
    this.toastService.loading('Guardando cambios...');

    let updateObservable$;

    switch (field) {
      case 'nombre':
        updateObservable$ = this.cuentaService.updateNombre(trimmedValue);
        break;
      case 'correo':
        updateObservable$ = this.cuentaService.updateEmail(trimmedValue);
        break;
      case 'password':
        updateObservable$ = this.cuentaService.updatePassword(this.editValue);
        break;
    }

    if (updateObservable$) {
      updateObservable$.subscribe({
        next: () => {
          this.toastService.success('Cambios guardados correctamente');
          this.editingField.set(null);
          this.editValue = '';
          this.isSaving.set(false);
        },
        error: (err) => {
          console.error('Error saving field', err);
          this.toastService.error('Error al guardar los cambios');
          this.isSaving.set(false);
        }
      });
    } else {
      this.isSaving.set(false);
      this.toastService.hide();
    }
  }

  cancelEdit(): void {
    if (this.isSaving()) return;
    this.editingField.set(null);
    this.editValue = '';
  }

  onLogout(): void {
    this.authService.confirmLogout();
  }
}
