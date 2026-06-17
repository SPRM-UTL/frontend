// cuenta.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CuentaService } from './cuenta.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cuenta.html',
  styleUrl: './cuenta.css'
})
export class Cuenta implements OnInit {

  private cuentaService = inject(CuentaService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  readonly userName  = this.cuentaService.userName;
  readonly userEmail = this.cuentaService.userEmail;

  editingField = signal<string | null>(null);
  editValue = '';
  isSaving = signal(false);

  ngOnInit(): void {
    this.cuentaService.loadPerfil();
  }

  onEditAvatar(): void {
    console.log('Edit avatar clicked');
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
    if (!this.editValue.trim() && field !== 'password') return;

    this.isSaving.set(true);
    this.toastService.loading('Guardando cambios...');

    let updateObservable$;
    const trimmedValue = this.editValue.trim();

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
    this.authService.logout();
  }
}
