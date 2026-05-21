import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { LoaderService } from '../services/loader.service';
import { finalize } from 'rxjs/operators';
@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  correo: string = '';
  contrasenia: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService,
    private loaderService: LoaderService
  ) { }

  onLogin() {
    this.loaderService.show();
    this.authService.login(this.correo, this.contrasenia)
     .pipe(

        finalize(() => {
          this.loaderService.hide();
        })

      )
      .subscribe({
        next: (response) => {
          console.log(response);

          localStorage.setItem('token', response.token);

          this.router.navigate(['/dashboard']);
        },

        error: (error) => {
          console.error(error);
          this.toastService.error('Credenciales inválidas');
        }
      });
  }
}