import { Component, computed, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DispositivosService } from './dispositivos.service';
import { Dispositivo } from './dispositivos.model';

import {
  LucideSearch,
  LucideFilter,
  LucideChevronDown,
  LucideWifi,
  LucideSun,
  LucideTriangleAlert,
  LucideLogOut,
  LucideBolt,
  LucidePower,
  LucideDynamicIcon,
} from '@lucide/angular';

import { getDeviceIcon } from '../shared/icon-map';

@Component({
  selector: 'app-dispositivos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideSearch,
    LucideFilter,
    LucideChevronDown,
    LucideWifi,
    LucideSun,
    LucideTriangleAlert,
    LucideLogOut,
    LucideBolt,
    LucidePower,
    LucideDynamicIcon,
  ],
  templateUrl: './dispositivos.html',
  styleUrl: './dispositivos.css'
})
export class Dispositivos implements OnInit, OnDestroy {

  public devicesService = inject(DispositivosService);
  private route = inject(ActivatedRoute);

  activeNav = 'dispositivos';

  readonly searchQuery = signal('');
  readonly showActions = signal(false);

  // Estado del filtro
  readonly isFilterOpen = signal(false);
  readonly selectedFilter = signal('');
  readonly selectedFilterLabel = signal('Todos los tipos');

  readonly devices = this.devicesService.devices;
  readonly loading = this.devicesService.loading;
  readonly error = this.devicesService.error;
  readonly connectedDevices = this.devicesService.connectedDevices;

  readonly filteredDevices = computed(() => {
    let filtered = this.devices();

    if (!Array.isArray(filtered)) {
      return [];
    }

    const q = this.searchQuery().toLowerCase().trim();
    const type = this.selectedFilter();

    // Búsqueda
    if (q) {
      filtered = filtered.filter(device =>
        device.nombre_aparato?.toLowerCase().includes(q) ||
        device.tipo_aparato?.toLowerCase().includes(q) ||
        device.nombre_bluetooth?.toLowerCase().includes(q)
      );
    }

    // Filtro por tipo
    if (type) {
      filtered = filtered.filter(device => device.tipo_aparato === type);
    }

    return filtered;
  });

  readonly onlineDevicesCount = computed(() => {
    return this.filteredDevices().filter(d => this.connectedDevices().includes(d.mac_bluetooth || '')).length;
  });

  readonly availableTypes = computed(() => {
    const devices = this.devices();
    const types = new Set<string>();
    for (const d of devices) {
      if (d.tipo_aparato) {
        types.add(d.tipo_aparato);
      }
    }
    return Array.from(types).sort();
  });

  ngOnInit(): void {
    this.devicesService.loadDevices();
    this.devicesService.startGlobalPolling();
    setTimeout(() => {
      this.devices()
        .filter(d => this.isMultisocket(d))
        .forEach(d => this.devicesService.loadMultisocketStateById(d.sk_aparato_id));
    }, 1500);
  }

  ngOnDestroy(): void {
    this.devicesService.stopGlobalPolling();
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  toggleFilter(): void {
    this.isFilterOpen.update(value => !value);
  }

  closeFilter(): void {
    this.isFilterOpen.set(false);
  }

  selectFilter(value: string, label: string): void {
    this.selectedFilter.set(value);
    this.selectedFilterLabel.set(label);
    this.isFilterOpen.set(false);
  }

  verDetalle(device: Dispositivo): void {
    this.devicesService.verDetalle(device);
  }

  cerrarDetalle(): void {
    this.devicesService.cerrarDetalle();
  }

  getDeviceIcon = getDeviceIcon;

  onToggleDevice(device: Dispositivo): void {
    this.devicesService.toggleDevice(device);
  }

  isMultisocket(device: Dispositivo): boolean {
    const tipo = (device.tipo_aparato || '').toLowerCase();
    return tipo.includes('multisocket') || tipo.includes('multi socket');
  }

  getMultisocketActiveCount(device: Dispositivo): number {
    return this.devicesService.getActiveContactCount(device.sk_aparato_id);
  }

  hasDirectToggle(device: Dispositivo): boolean {
    const tipo = (device.tipo_aparato || '').toLowerCase();
    // Lista de tipos que SÍ deben mostrar el toggle directo
    const allowedTypes = ['foco', 'luces', 'socket', 'multisocket', 'ventilador', 'bocina', 'audifono'];
    return allowedTypes.some(t => tipo.includes(t));
  }
}
