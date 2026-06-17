// cuenta.ts

import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

  readonly userName  = this.cuentaService.userName;
  readonly userEmail = this.cuentaService.userEmail;

  readonly editingField = signal<string | null>(null);
  readonly isSaving = signal(false);
  editValue = '';

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

    let updateObs;
    switch (field) {
      case 'nombre':
        updateObs = this.cuentaService.updateNombre(this.editValue.trim());
        break;
      case 'correo':
        updateObs = this.cuentaService.updateEmail(this.editValue.trim());
        break;
      case 'password':
        updateObs = this.cuentaService.updatePassword(this.editValue);
        break;
    }

    if (updateObs) {
      updateObs.subscribe({
        next: () => {
          this.toastService.success('Cambios guardados correctamente');
          this.editingField.set(null);
          this.editValue = '';
          this.isSaving.set(false);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.toastService.error('Error al guardar los cambios');
          this.isSaving.set(false);
          console.error(err);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.isSaving.set(false);
    }
  }

  cancelEdit(): void {
    this.editingField.set(null);
    this.editValue = '';
  }

  onLogout(): void {
    this.authService.logout();
  }
}
