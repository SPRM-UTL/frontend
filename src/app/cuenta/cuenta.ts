import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cuenta',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './cuenta.html',
  styleUrl: './cuenta.css'
})
export class Cuenta {
  activeNav = 'cuenta';

  // User data — replace with real service calls
  userName = 'JOSUÉ ARMANDO RIVERA HERNÁNDEZ';
  userEmail = 'riverhernan16idgs@gmail.com';

  // Edit state
  editingField: string | null = null;
  editValue = '';

  // Toast
  toastVisible = false;
  private toastTimeout: any;

  setActive(nav: string) {
    this.activeNav = nav;
  }

  onEditAvatar() {
    // Hook up file-picker or modal here
    console.log('Edit avatar clicked');
  }

  startEdit(field: string, currentValue: string) {
    this.editingField = field;
    this.editValue = currentValue;
    // Focus the input after Angular renders it
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('.field-input');
      input?.focus();
    }, 50);
  }

  saveField(field: string) {
    if (!this.editValue.trim() && field !== 'password') return;

    switch (field) {
      case 'nombre':
        this.userName = this.editValue.trim();
        break;
      case 'correo':
        this.userEmail = this.editValue.trim();
        break;
      case 'password':
        // Call your auth service here
        console.log('Password change requested');
        break;
    }

    this.editingField = null;
    this.editValue = '';
    this.showToast();
  }

  cancelEdit() {
    this.editingField = null;
    this.editValue = '';
  }

  private showToast() {
    clearTimeout(this.toastTimeout);
    this.toastVisible = true;
    this.toastTimeout = setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }
}
