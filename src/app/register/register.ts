import { Component, signal } from '@angular/core';

import { Router, RouterLink } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { AuthService } from '../services/auth.service';

import { ToastService } from '../services/toast.service';

import { LoaderService } from '../services/loader.service';

import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-register',

  standalone: true,

  imports: [
    RouterLink,
    FormsModule,
    CommonModule
  ],

  templateUrl: './register.html',

  styleUrl: './register.css'
})
export class Register {

  showPassword = signal(false);

  nombre = '';

  correo = '';

  contrasenia = '';

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private loaderService: LoaderService,
    private router: Router
  ) { }

  togglePassword() {

    this.showPassword.update(v => !v);
  }

  onRegister() {

    if (!this.nombre.trim()) {

      this.toastService.warning(
        'Ingresa tu nombre'
      );
      const nombreRegex =/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

      if (!nombreRegex.test(this.nombre)) {

        this.toastService.warning(
          'El nombre solo puede contener letras'
        );

        return;
      }
      return;
    }

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

    const usuario = {

      nombre: this.nombre,

      correo: this.correo,

      contrasenia: this.contrasenia
    };

    this.loaderService.show();

    this.authService.register(usuario)

      .pipe(

        finalize(() => {

          this.loaderService.hide();
        })
      )

      .subscribe({

        next: (response) => {

          console.log(response);

          this.toastService.success(
            'Usuario registrado correctamente. Ahora puede iniciar sesión en su cuenta.'
          );

          // limpiar formulario

          this.nombre = '';

          this.correo = '';

          this.contrasenia = '';

          // redireccionar

          this.router.navigate(['/']);
        },

        error: (error) => {

          console.log(error);

          const errorMessage = error?.error?.message 
            || error?.error?.data 
            || error?.message 
            || 'Ocurrió un error al registrarse. Intenta nuevamente.';

          this.toastService.error(errorMessage);
        }
      });
  }
  soloLetras(event: KeyboardEvent) {

    const charCode = event.key;

    const regex =
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/;

    if (!regex.test(charCode)) {

      event.preventDefault();
    }
  }
}