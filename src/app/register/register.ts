import { Component, signal, OnInit } from '@angular/core';

import { Router, RouterLink } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { AuthService } from '../services/auth.service';

import { ToastService } from '../services/toast.service';

import { LoaderService } from '../services/loader.service';

import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { SocialAuthService, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import {
  LucideEye,
  LucideEyeOff,
  LucideLock,
  LucideMail,
  LucideUser
} from '@lucide/angular';
@Component({
  selector: 'app-register',

  standalone: true,

  imports: [
    RouterLink,
    FormsModule,
    CommonModule,
    LucideEye,
    LucideEyeOff,
    LucideLock,
    LucideMail,
    LucideUser,
    GoogleSigninButtonModule
  ],

  templateUrl: './register.html',

  styleUrl: './register.css'
})
export class Register implements OnInit {

  showPassword = signal(false);

  nombre = '';

  correo = '';

  contrasenia = '';

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private loaderService: LoaderService,
    private router: Router,
    private socialAuthService: SocialAuthService
  ) { }

  ngOnInit() {
    this.socialAuthService.authState.subscribe((user) => {
      if (user && user.idToken) {
        this.loaderService.show(true);
        this.authService.loginWithGoogle(user.idToken)
        .pipe(
          finalize(() => {
            this.loaderService.hide();
          })
        )
        .subscribe({
          next: () => {
            this.toastService.success('Registro completado', 'hand');
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            console.error(error);
            this.toastService.error('Error al registrarse con Google');
          }
        });
      }
    });
  }

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
