import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../services/auth.service';

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
    private authService: AuthService
  ) { }

  onLogin() {

    this.authService.login(this.correo, this.contrasenia)
      .subscribe({
        next: (response) => {

          console.log(response);

          localStorage.setItem('token', response.token);

          this.router.navigate(['/dashboard']);
        },

        error: (error) => {
          console.error(error);
          alert('Credenciales inválidas');
        }
      });
  }
}