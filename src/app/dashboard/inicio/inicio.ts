import { GestosService } from './../../gestos/gestos.service';
import { Component, afterNextRender, inject, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DynamicChartComponent } from '../../macros/dynamic-char.component';
import { InicioService } from './inicio.service';
import { DispositivosService } from '../../dispositivos/dispositivos.service';
import { CasasService } from '../../casas/casas.service';

import {
  LucideDynamicIcon,
} from '@lucide/angular';
import { getDeviceIcon, getGestureIcon } from '../../shared/icon-map';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    DynamicChartComponent,
    RouterLink,
    LucideDynamicIcon
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {
  private platformId = inject(PLATFORM_ID);
  private gestosService = inject(GestosService)
  public readonly inicioService = inject(InicioService);
  public readonly devicesService = inject(DispositivosService);
  public readonly casasService = inject(CasasService);

  readonly stats = this.inicioService.stats;
  readonly acciones = this.inicioService.acciones;
  readonly loading = this.inicioService.loading;
  readonly error = this.inicioService.error;

  readonly displayedDevices = computed(() => {
    const devices = this.devicesService.devices();
    const connected = this.connectedDevices();

    return devices
      .filter(device => connected.includes(device.mac_bluetooth || ''))
      .slice(0, 4);
  });

  readonly displayedGestos = computed(() => {
    return this.gestosService.gestos().slice(0, 3);
  });

  readonly displayedCasas = computed(() => {
    return this.casasService.casas().slice(0, 3);
  });

  readonly connectedDevices = this.devicesService.connectedDevices;

  getChipClass(tipo: string, index: number = 0): string {
    const colorClasses = [
      'device-chip--pink',
      'device-chip--violet',
      'device-chip--green',
      'device-chip--orange'
    ];
    // Cicla los colores basados en el índice para que sean distintos
    return colorClasses[index % colorClasses.length];
  }

  getDeviceIcon = getDeviceIcon;
  getGestureIcon = getGestureIcon;

  readonly consumosData = this.inicioService.consumos;

  readonly actividadCategorias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  readonly actividadSeries = computed(() => {
    const data = this.consumosData();
    const dailySum = [0, 0, 0, 0, 0, 0, 0];
    const dailyCount = [0, 0, 0, 0, 0, 0, 0];

    data.forEach(item => {
      const date = new Date(item.fecha_medicion);
      // getDay() retorna 0 para domingo, 1 para lunes, etc.
      // Ajustamos para que Lunes sea 0
      let dayIdx = date.getDay() - 1;
      if (dayIdx === -1) dayIdx = 6; // Domingo

      dailySum[dayIdx] += item.potencia_w;
      dailyCount[dayIdx]++;
    });

    const averageData = dailySum.map((sum, i) =>
      dailyCount[i] > 0 ? Number((sum / dailyCount[i]).toFixed(2)) : 0
    );

    return [{
      name: 'Consumo (W)',
      data: averageData
    }];
  });

  readonly eficienciaSeries = computed(() => {
    const data = this.consumosData();
    if (data.length === 0) return [0];

    const totalPotencia = data.reduce((acc, item) => acc + item.potencia_w, 0);
    const avgPotencia = totalPotencia / data.length;

    // Supongamos una carga máxima de referencia de 200W para el porcentaje
    const maxReference = 200;
    const percentage = Math.min(100, Math.round((avgPotencia / maxReference) * 100));

    return [percentage];
  });

  eficienciaLabels = ['Carga del sistema'];
  eficienciaColors = ['#ffffff'];

  constructor() {
    afterNextRender(() => {
      const isBrowser = isPlatformBrowser(this.platformId);
      const token = isBrowser ? (localStorage.getItem('token') ?? '') : '';
      const userId = Number(isBrowser ? (localStorage.getItem('userId') ?? '1') : '1');

      if (userId > 0 && token) {
        this.inicioService.loadInicio(userId, token);
        this.casasService.loadCasas();
      }
    });
  }
}
