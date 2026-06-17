// cuenta.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CuentaService } from './cuenta.service';

@Component({
  selector: 'app-cuenta',
  imports: [CommonModule, FormsModule],
  templateUrl: './cuenta.html',
  styleUrl: './cuenta.css'
})
export class Cuenta implements OnInit {

  ngOnInit(): void {
    this.cuentaService.loadPerfil();
  }

  private cuentaService = inject(CuentaService);

  readonly userName  = this.cuentaService.userName;
  readonly userEmail = this.cuentaService.userEmail;

  editingField: string | null = null;
  editValue = '';

  toastVisible = false;
  private toastTimeout: any;

  onEditAvatar(): void {
    // TODO: conectar file-picker o modal
    console.log('Edit avatar clicked');
  }

  startEdit(field: string, currentValue: string): void {
    this.editingField = field;
    this.editValue = currentValue;
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('.field-input')?.focus();
    }, 50);
  }

  saveField(field: string): void {
    if (!this.editValue.trim() && field !== 'password') return;

    switch (field) {
      case 'nombre':
        this.cuentaService.updateNombre(this.editValue.trim()).subscribe();
        break;
      case 'correo':
        this.cuentaService.updateEmail(this.editValue.trim()).subscribe();
        break;
      case 'password':
        this.cuentaService.updatePassword(this.editValue).subscribe();
        break;
    }

    this.editingField = null;
    this.editValue = '';
    this.showToast();
  }

  cancelEdit(): void {
    this.editingField = null;
    this.editValue = '';
  }

  private showToast(): void {
    clearTimeout(this.toastTimeout);
    this.toastVisible = true;
    this.toastTimeout = setTimeout(() => { this.toastVisible = false; }, 3000);
  }
}