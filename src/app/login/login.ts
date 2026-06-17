import { Component, signal } from '@angular/core';

import { RouterLink } from '@angular/router';

import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { AuthService } from '../services/auth.service';

import { ToastService } from '../services/toast.service';

import { LoaderService } from '../services/loader.service';

import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',

  standalone: true,

  imports: [
    RouterLink,
    FormsModule,
    CommonModule
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

    this.loaderService.show();

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

      next: (response) => {
        const payload = response?.data ?? response;
        const data = payload?.data ?? payload;

        const token = data?.token ?? payload?.token ?? '';
        const nombre = data?.nombre ?? payload?.nombre ?? data?.name ?? payload?.name
          ?? data?.usuario?.nombre ?? payload?.usuario?.nombre
          ?? data?.user?.nombre ?? payload?.user?.nombre
          ?? data?.user?.name ?? payload?.user?.name
          ?? '';
        const userId = data?.id ?? payload?.id ?? data?.userId ?? payload?.userId
          ?? data?.usuario?.id ?? payload?.usuario?.id
          ?? data?.user?.id ?? payload?.user?.id
          ?? data?.user?.userId ?? payload?.user?.userId;

        if (token) {
          localStorage.setItem('token', token);
        }

        if (nombre) {
          localStorage.setItem('nombre', nombre);
        }

        if (userId) {
          localStorage.setItem('userId', String(userId));
        }

        this.toastService.success('¡Bienvenido de nuevo!', 3000, '/icons/hand.svg');

        this.correo = '';
        this.contrasenia = '';

        this.router.navigate(['/dashboard']);
      },

      error: (error) => {

        console.error(error);

        this.toastService.error(
          error.error.data
        );
      }
    });
  }
}
