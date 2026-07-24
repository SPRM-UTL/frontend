import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
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
  LucideWind,
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
    LucideWind,
    LucideDynamicIcon,
    CamaraComponent
  ],
  templateUrl: './control.html',
  styleUrl: './control.css'
})
export class Control implements OnInit, OnDestroy {

  private controlService = inject(ControlService);
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isIncrementing = false;
  private syncPollingId: ReturnType<typeof setInterval> | null = null;

  // Expose icon objects to template
  readonly LucideSun = LucideSun;
  readonly LucideTriangleAlert = LucideTriangleAlert;
  readonly LucideLayoutDashboard = LucideLayoutDashboard;
  readonly LucideChevronDown = LucideChevronDown;
  readonly LucidePower = LucidePower;
  readonly LucideWind = LucideWind;

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
    // Carga inicial del estado de los MultiSocket
    setTimeout(() => {
      const msDevices = this.controlService.todosLosDispositivos()
        .filter(d => this.isMultisocketByTipo(d.tipo_aparato));
      msDevices.forEach(d => this.controlService.loadMultisocketState(d));
    }, 1500);

    // Polling de sincronización cada 5 segundos.
    this.syncPollingId = setInterval(() => {
      // 1. Refresca estados generales de todos los dispositivos (encendido/apagado)
      this.controlService.refreshAllDeviceStates();
      // 2. Refresca estados individuales de los contactos MultiSocket
      const msDevices = this.controlService.todosLosDispositivos()
        .filter(d => this.isMultisocketByTipo(d.tipo_aparato));
      msDevices.forEach(d => this.controlService.loadMultisocketState(d));
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.syncPollingId) {
      clearInterval(this.syncPollingId);
      this.syncPollingId = null;
    }
    this.stopVolumeLoop();
  }

  private isMultisocketByTipo(tipo: string | undefined): boolean {
    if (!tipo) return false;
    const t = tipo.toLowerCase();
    return t.includes('multisocket') || t.includes('multi socket') || t.includes('ventilador');
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

  /** Devuelve true si el dispositivo es un MultiSocket */
  isMultisocket(device: DispositivoControl): boolean {
    const tipo = (device.tipo_aparato || '').toLowerCase();
    return tipo.includes('multisocket') || tipo.includes('multi socket');
  }

  /** Devuelve true si el dispositivo es un Ventilador Inteligente */
  isVentilador(device: DispositivoControl): boolean {
    const tipo = (device.tipo_aparato || '').toLowerCase();
    return tipo.includes('ventilador');
  }

  isDeviceOn(device: DispositivoControl): boolean {
    if (this.isMultisocket(device) || this.isVentilador(device)) {
      return this.getActiveContactCount(device) > 0;
    }
    return device.encendido;
  }

  /** Alterna un contacto individual (1–4) del MultiSocket */
  toggleContacto(device: DispositivoControl, contacto: 1 | 2 | 3 | 4): void {
    const estadoActual = this.getContactoEstado(device, contacto);
    this.controlService.toggleContacto(device, contacto, !estadoActual);
  }

  /** Alterna velocidad del ventilador con exclusividad (solo una a la vez) */
  toggleVelocidadExclusiva(device: DispositivoControl, velocidad: 1 | 2 | 3): void {
    const estadoActual = this.getContactoEstado(device, velocidad);
    if (estadoActual) {
      this.controlService.toggleContacto(device, velocidad, false);
    } else {
      // Apagar las otras velocidades primero
      for (let i = 1; i <= 3; i++) {
        if (i !== velocidad && this.getContactoEstado(device, i as 1 | 2 | 3)) {
          this.controlService.toggleContacto(device, i as 1 | 2 | 3, false);
        }
      }
      this.controlService.toggleContacto(device, velocidad, true);
    }
  }

  /** Lee el estado booleano de un contacto específico */
  getContactoEstado(device: DispositivoControl, contacto: 1 | 2 | 3 | 4): boolean {
    switch (contacto) {
      case 1: return device.estado_contacto_1 ?? false;
      case 2: return device.estado_contacto_2 ?? false;
      case 3: return device.estado_contacto_3 ?? false;
      case 4: return device.estado_contacto_4 ?? false;
    }
  }

  /** Retorna cuántos contactos del MultiSocket están actualmente encendidos (0–4) */
  getActiveContactCount(device: DispositivoControl): number {
    return [
      device.estado_contacto_1,
      device.estado_contacto_2,
      device.estado_contacto_3,
      device.estado_contacto_4
    ].filter(Boolean).length;
  }

  /** Retorna la velocidad activa del ventilador (1, 2, 3) o 0 si ninguna */
  getActiveVelocidad(device: DispositivoControl): number {
    if (device.estado_contacto_1) return 1;
    if (device.estado_contacto_2) return 2;
    if (device.estado_contacto_3) return 3;
    return 0;
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
}
