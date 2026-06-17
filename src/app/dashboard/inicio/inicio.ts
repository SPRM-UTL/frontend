import { Component, afterNextRender, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicChartComponent } from '../../macros/dynamic-char.component';
import { InicioService } from './inicio.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, DynamicChartComponent],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {
  public readonly inicioService = inject(InicioService);

  readonly stats = this.inicioService.stats;
  readonly acciones = this.inicioService.acciones;
  readonly loading = this.inicioService.loading;
  readonly error = this.inicioService.error;

  actividadSeries = [{
    name: 'Automatizaciones',
    data: [12, 18, 15, 22, 20, 25, 30]
  }];
  actividadCategorias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  eficienciaSeries = [85];
  eficienciaLabels = ['Eficiencia global'];
  eficienciaColors = ['#2bbfaa'];

  constructor() {
    afterNextRender(() => {
      const token = typeof localStorage !== 'undefined'
        ? localStorage.getItem('token') ?? ''
        : '';
      const userId = Number(typeof localStorage !== 'undefined'
        ? localStorage.getItem('userId') ?? '1'
        : '1');

      if (userId > 0 && token) {
        this.inicioService.loadInicio(userId, token);
      }
    });
  }
}
