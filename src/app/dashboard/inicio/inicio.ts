// inicio.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InicioService } from './inicio.service';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit {

  private inicioService = inject(InicioService);

  readonly stats    = this.inicioService.stats;
  readonly acciones = this.inicioService.acciones;
  readonly loading  = this.inicioService.loading;
  readonly error    = this.inicioService.error;

  ngOnInit(): void {
    this.inicioService.loadInicio();
  }
}