import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  showPassword = signal(false);

  togglePassword() {
    this.showPassword.update(v => !v);
  }
}
