import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideLogIn, LucideShieldAlert } from '@lucide/angular';

@Component({
  selector: 'app-sesion-expirada',
  standalone: true,
  imports: [RouterLink, LucideShieldAlert, LucideLogIn],
  templateUrl: './sesion-expirada.html',
  styleUrl: './sesion-expirada.css'
})
export class SesionExpirada {}
