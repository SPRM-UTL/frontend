import { GestosService } from './../../gestos/gestos.service';
import { Component, afterNextRender, inject, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DynamicChartComponent } from '../../macros/dynamic-char.component';
import { InicioService } from './inicio.service';
import { DispositivosService } from '../../dispositivos/dispositivos.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, DynamicChartComponent, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {
  private platformId = inject(PLATFORM_ID);
  private gestosService = inject(GestosService)
  public readonly inicioService = inject(InicioService);
  public readonly devicesService = inject(DispositivosService);

  readonly stats = this.inicioService.stats;
  readonly acciones = this.inicioService.acciones;
  readonly loading = this.inicioService.loading;
  readonly error = this.inicioService.error;

  readonly displayedDevices = computed(() => {
    return this.devicesService.devices().slice(0, 4);
  });

  readonly displayedGestos = computed(() => {
    return this.gestosService.gestos().slice(0, 3);
  });


  getChipClass(tipo: string, index: number = 0): string {
    const colorClasses = [
      'device-chip--orange',
      'device-chip--blue',
      'device-chip--violet',
      'device-chip--teal'
    ];
    // Cicla los colores basados en el índice para que sean distintos
    return colorClasses[index % colorClasses.length];
  }

  readonly categoryIconMap: Record<string, string> = {
    'Audífonos': 'headphones',
    'Bocinas': 'speaker',
    'Focos': 'lightbulb',
    'Luces': 'lamp_floor',
    'Ventilador': 'wind',
    'Televisión': 'tv_minimal',
    'Sockets': 'plug',
    'Asistente': 'ic_input_add',
    'Predeterminado': 'ic_default'
  };

getIconPath(tipoOIcono: string | undefined): string {
  if (!tipoOIcono) return '/icons/ic_default.svg';
  const iconName = this.categoryIconMap[tipoOIcono] || tipoOIcono;
  return `/icons/${iconName}.svg`;
}

  actividadSeries = [{
    name: 'acciones',
    data: [12, 18, 15, 22, 20, 25, 30]
  }];
  actividadCategorias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  eficienciaSeries = [85];
  eficienciaLabels = ['Eficiencia global'];
  eficienciaColors = ['#2bbfaa'];

  constructor() {
    afterNextRender(() => {
      const isBrowser = isPlatformBrowser(this.platformId);
      const token = isBrowser ? (localStorage.getItem('token') ?? '') : '';
      const userId = Number(isBrowser ? (localStorage.getItem('userId') ?? '1') : '1');

      if (userId > 0 && token) {
        this.inicioService.loadInicio(userId, token);
      }
    });
  }
}
