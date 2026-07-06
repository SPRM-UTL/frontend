import { Component, signal } from '@angular/core';

import { RouterLink } from '@angular/router';

import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { AuthService } from '../services/auth.service';

import { ToastService } from '../services/toast.service';

import { LoaderService } from '../services/loader.service';

import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import {
  LucideEye,
  LucideEyeOff,
  LucideMail,
  LucideLock
} from '@lucide/angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    CommonModule,
    LucideMail,
    LucideLock,
    LucideEye,
    LucideEyeOff
  ],

  templateUrl: './login.html',

  styleUrl: './login.css'
})

export class Login {
  showPassword = signal(false);

  correo = '';

  contrasenia = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService,
    private loaderService: LoaderService
  ) { }

  togglePassword() {

    this.showPassword.update(v => !v);
  }

  onLogin() {

    if (!this.correo.trim()) {

      this.toastService.warning(
        'Ingresa tu correo'
      );

      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.correo)) {

      this.toastService.warning(
        'Correo inválido'
      );

      return;
    }

    if (!this.contrasenia.trim()) {

      this.toastService.warning(
        'Ingresa tu contraseña'
      );

      return;
    }

    if (this.contrasenia.length < 8) {

      this.toastService.warning(
        'La contraseña debe tener mínimo 8 caracteres'
      );

      return;
    }

    this.loaderService.show(true);

    this.authService.login(
      this.correo,
      this.contrasenia
    )

    .pipe(

      finalize(() => {

        this.loaderService.hide();
      })

    )

    .subscribe({

      next: () => {
        this.toastService.success('Bienvenido', 'hand');

        this.correo = '';
        this.contrasenia = '';

        this.router.navigate(['/dashboard']);
      },

      error: (error) => {

        console.error(error);

        const errorMessage = error?.error?.message
          || error?.error?.data
          || error?.message
          || 'Credenciales incorrectas. Por favor, intenta de nuevo.';

        this.toastService.error(errorMessage);
      }
    });
  }
}

