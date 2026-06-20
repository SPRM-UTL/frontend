import { Component, afterNextRender, inject, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DynamicChartComponent } from '../../macros/dynamic-char.component';
import { InicioService } from './inicio.service';
import { DevicesService } from '../../dispositivos/devices.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, DynamicChartComponent, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {
  private platformId = inject(PLATFORM_ID);
  public readonly inicioService = inject(InicioService);
  public readonly devicesService = inject(DevicesService);

  readonly stats = this.inicioService.stats;
  readonly acciones = this.inicioService.acciones;
  readonly loading = this.inicioService.loading;
  readonly error = this.inicioService.error;

  readonly displayedDevices = computed(() => {
    return this.devicesService.devices().slice(0, 4);
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

getIconPath(tipo: string | undefined): string {
  if (!tipo) return '/icons/smartphone.svg';

  const iconMap: Record<string, string> = {
    'Bocinas': 'speaker.svg',
    'Audífonos': 'earphones.svg',
    'Luces': 'lightbulb.svg',
    'Ventiladores': 'ventiladores.svg',
    'Cámara': 'camera.svg',
    'TV': 'tv.svg',
    'Cerradura': 'lock.svg'
  };

  return `/icons/${iconMap[tipo] || 'smartphone.svg'}`;
}

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
      const isBrowser = isPlatformBrowser(this.platformId);
      const token = isBrowser ? (localStorage.getItem('token') ?? '') : '';
      const userId = Number(isBrowser ? (localStorage.getItem('userId') ?? '1') : '1');

      if (userId > 0 && token) {
        this.inicioService.loadInicio(userId, token);
      }
    });
  }
}
