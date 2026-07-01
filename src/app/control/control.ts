import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ControlService } from './control.service';
import { DispositivoControl, AparatoTipo } from './control.model';

import {
  LucideSun,
  LucideTriangleAlert,
  LucideLayoutDashboard,
  LucideChevronDown,
  LucidePower,
  LucideDynamicIcon
} from '@lucide/angular';
import { getDeviceIcon } from '../shared/icon-map';

@Component({
  selector: 'app-control',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideSun,
    LucideTriangleAlert,
    LucideLayoutDashboard,
    LucideChevronDown,
    LucidePower,
    LucideDynamicIcon
  ],
  templateUrl: './control.html',
  styleUrl: './control.css'
})
export class Control implements OnInit {

  private controlService = inject(ControlService);

  // Expose icon objects to template
  readonly LucideSun = LucideSun;
  readonly LucideTriangleAlert = LucideTriangleAlert;
  readonly LucideLayoutDashboard = LucideLayoutDashboard;
  readonly LucideChevronDown = LucideChevronDown;
  readonly LucidePower = LucidePower;

  readonly tipos        = this.controlService.tiposDispositivos;
  readonly dispositivos = this.controlService.todosLosDispositivos;
  readonly loading      = this.controlService.loading;
  readonly error        = this.controlService.error;

  tipoSeleccionado = signal<string>('Todos los tipos');

  // Filtrar tipos que tienen al menos un dispositivo
  tiposConDispositivos = computed(() => {
    const allDevices = this.dispositivos();
    const allTypes = this.tipos();

    return allTypes.filter(t =>
      allDevices.some(d => (d.tipo_aparato || '').toLowerCase() === t.nombre_tipo.toLowerCase())
    );
  });

  dispositivosFiltrados = computed(() => {
    const seleccion = this.tipoSeleccionado();
    const all = this.dispositivos();
    if (seleccion === 'Todos los tipos') return all;
    return all.filter(d => (d.tipo_aparato || '').toLowerCase() === seleccion.toLowerCase());
  });

  ngOnInit(): void {
    this.controlService.loadControl();
  }

  selectTipo(tipo: string): void {
    this.tipoSeleccionado.set(tipo);
  }

  getDeviceIcon = getDeviceIcon;

  getDeviceCount(tipo: string): number {
    return this.dispositivos().filter(d => (d.tipo_aparato || '').toLowerCase() === tipo.toLowerCase()).length;
  }

  toggleDevice(device: DispositivoControl): void {
    this.controlService.toggleDevice(device.id);
  }

  onBrilloChange(device: DispositivoControl, value: number): void {
    this.controlService.updateDevice({ ...device, brillo: value });
  }

  incrementVolumen(device: DispositivoControl): void {
    if ((device.volumen || 0) < 100) {
      this.controlService.updateDevice({ ...device, volumen: (device.volumen || 0) + 5 });
    }
  }

  decrementVolumen(device: DispositivoControl): void {
    if ((device.volumen || 0) > 0) {
      this.controlService.updateDevice({ ...device, volumen: (device.volumen || 0) - 5 });
    }
  }

  incrementVelocidad(device: DispositivoControl): void {
    if ((device.velocidad || 0) < 5) {
      this.controlService.updateDevice({ ...device, velocidad: (device.velocidad || 0) + 1 });
    }
  }

  decrementVelocidad(device: DispositivoControl): void {
    if ((device.velocidad || 0) > 1) {
      this.controlService.updateDevice({ ...device, velocidad: (device.velocidad || 0) - 1 });
    }
  }
}
