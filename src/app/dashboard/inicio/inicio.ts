import { Component, afterNextRender, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DynamicChartComponent } from '../../macros/dynamic-char.component';
import { InicioService } from './inicio.service';
import { DevicesService } from '../../dispositivos/devices.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, DynamicChartComponent, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {
  public readonly inicioService = inject(InicioService);
  public readonly devicesService = inject(DevicesService);
  private readonly toastService = inject(ToastService);

  readonly stats = this.inicioService.stats;
  readonly acciones = this.inicioService.acciones;
  readonly loading = this.inicioService.loading;
  readonly error = this.inicioService.error;

  readonly displayedDevices = computed(() => {
    return this.devicesService.devices().slice(0, 3);
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

  getIconPath(tipo: string): string {
    const t = (tipo || '').toLowerCase();
    if (t.includes('bocina') || t.includes('altavoz') || t.includes('audio')) return '/icons/speaker.svg';
    if (t.includes('luz') || t.includes('foco') || t.includes('ilumin')) return '/icons/lightbulb.svg';
    if (t.includes('tv') || t.includes('tele')) return '/icons/tv.svg';
    if (t.includes('cam') || t.includes('segurid')) return '/icons/camera.svg';
    if (t.includes('lock') || t.includes('cerradura') || t.includes('bloqueo')) return '/icons/lock.svg';
    if (t.includes('fan') || t.includes('ventilador') || t.includes('aire')) return '/icons/fan.svg';
    if (t.includes('wifi') || t.includes('red')) return '/icons/wifi.svg';
    if (t.includes('bolt') || t.includes('energ')) return '/icons/bolt.svg';

    return '/icons/smartphone.svg'; // Fallback solicitado
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
