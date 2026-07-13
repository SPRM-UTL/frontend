import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ControlService } from './control.service';
import { DispositivosService } from '../dispositivos/dispositivos.service';
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
import { CamaraComponent } from '../camara/camara.component';

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
    LucideDynamicIcon,
    CamaraComponent
  ],
  templateUrl: './control.html',
  styleUrl: './control.css'
})
export class Control implements OnInit {

  private controlService = inject(ControlService);
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isIncrementing = false;

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

  private dispositivosService = inject(DispositivosService);

  dispositivosFiltrados = computed(() => {
    const seleccion = this.tipoSeleccionado();
    const all = this.dispositivos();
    const connectedMacs = this.dispositivosService.connectedDevices();

    // Solo mantener dispositivos conectados (cuya MAC esté en la lista)
    const conectados = all.filter(d => d.mac_bluetooth && connectedMacs.includes(d.mac_bluetooth));

    if (seleccion === 'Todos los tipos') return conectados;
    return conectados.filter(d => (d.tipo_aparato || '').toLowerCase() === seleccion.toLowerCase());
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
    const nuevoVolumen = Math.min(100, (device.volumen || 0) + 10);
    this.controlService.updateDevice({ ...device, volumen: nuevoVolumen });
    this.controlService.playVolumeSound(nuevoVolumen);
  }

  decrementVolumen(device: DispositivoControl): void {
    const nuevoVolumen = Math.max(0, (device.volumen || 0) - 10);
    this.controlService.updateDevice({ ...device, volumen: nuevoVolumen });
    this.controlService.playVolumeSound(nuevoVolumen);
  }

  startIncrementVolumen(device: DispositivoControl): void {
    this.stopVolumeLoop();
    this.isIncrementing = true;
    this.runVolumeLoop(device, true);
  }

  startDecrementVolumen(device: DispositivoControl): void {
    this.stopVolumeLoop();
    this.isIncrementing = false;
    this.runVolumeLoop(device, false);
  }

  stopVolumeLoop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private runVolumeLoop(device: DispositivoControl, incrementando: boolean): void {
    this.intervalId = setInterval(() => {
      if (incrementando) {
        const nuevoVolumen = Math.min(100, (device.volumen || 0) + 5);
        if (nuevoVolumen !== (device.volumen || 0)) {
          device.volumen = nuevoVolumen;
          this.controlService.updateDevice({ ...device, volumen: nuevoVolumen });
          this.controlService.playVolumeSound(nuevoVolumen);
        }
      } else {
        const nuevoVolumen = Math.max(0, (device.volumen || 0) - 5);
        if (nuevoVolumen !== (device.volumen || 0)) {
          device.volumen = nuevoVolumen;
          this.controlService.updateDevice({ ...device, volumen: nuevoVolumen });
          this.controlService.playVolumeSound(nuevoVolumen);
        }
      }
    }, 120);
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
