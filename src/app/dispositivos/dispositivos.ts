import { Component, computed, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
  LucideDynamicIcon,
} from '@lucide/angular';
import { getDeviceIcon, CATEGORY_ICON_MAP } from '../shared/icon-map';

@Component({
  selector: 'app-dispositivos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    LucideSearch,
    LucideFilter,
    LucideChevronDown,
    LucideWifi,
    LucideSun,
    LucideTriangleAlert,
    LucideLogOut,
    LucideBolt,
    LucideDynamicIcon,
  ],
  templateUrl: './dispositivos.html',
  styleUrl: './dispositivos.css'
})
export class Dispositivos implements OnInit {

  private devicesService = inject(DispositivosService);
  private route = inject(ActivatedRoute);

  activeNav = 'dispositivos';
  readonly searchQuery = signal('');
  readonly showActions = signal(false);

  // Dropdown Filter State
  readonly isFilterOpen = signal(false);
  readonly selectedFilter = signal('');
  readonly selectedFilterLabel = signal('Todos los tipos');

  // Mapeo de tipos para filtros (solo se necesita para el filtro, no para iconos)
  readonly categoryIconMap = CATEGORY_ICON_MAP;

  readonly devices = this.devicesService.devices;

  readonly filteredDevices = computed(() => {
    let filtered = this.devices();
    if (!Array.isArray(filtered)) return [];

    const q = this.searchQuery().toLowerCase().trim();
    const type = this.selectedFilter();

    // Filtro por búsqueda
    if (q) {
      filtered = filtered.filter(device =>
        device.nombre_aparato?.toLowerCase().includes(q) ||
        device.tipo_aparato?.toLowerCase().includes(q) ||
        device.nombre_bluetooth?.toLowerCase().includes(q)
      );
    }

    // Filtro por tipo (Categoría)
    if (type) {
      // Mapa de categoría española → kebab string del filtro (sólo para comparación)
      const filterKeyMap: Record<string, string> = {
        'Audífonos': 'headphones', 'Bocinas': 'speaker', 'Focos': 'lightbulb',
        'Luces': 'lamp-floor', 'Ventilador': 'wind', 'Televisión': 'tv-minimal',
        'Sockets': 'plug', 'Asistente': 'circle-plus', 'Predeterminado': 'circle-plus'
      };
      filtered = filtered.filter(device => {
        const devIcon = (device.icono || '').toLowerCase().trim();
        const devType = (device.tipo_aparato || '').toLowerCase().trim();
        const mappedKey = filterKeyMap[device.tipo_aparato || ''] || '';

        return devIcon === type ||
               devType === type.toLowerCase() ||
               mappedKey === type ||
               (type === 'lamp-floor' && devType === 'luces') ||
               (type === 'circle-plus' && devType === 'asistente') ||
               (type === 'circle-plus' && devType === 'predeterminado');
      });
    }

    return filtered;
  });

  readonly loading = this.devicesService.loading;
  readonly error = this.devicesService.error;

  ngOnInit(): void {
    this.devicesService.loadDevices();
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  // Dropdown Methods
  toggleFilter() {
    this.isFilterOpen.update(v => !v);
  }

  closeFilter() {
    this.isFilterOpen.set(false);
  }

  selectFilter(value: string, label: string) {
    this.selectedFilter.set(value);
    this.selectedFilterLabel.set(label);
    this.isFilterOpen.set(false);
  }

  verDetalle(device: Dispositivo): void {
    this.devicesService.selectedDevice.set(device);
  }

  cerrarDetalle(): void {
    this.devicesService.cerrarDetalle();
  }

  getDeviceIcon = getDeviceIcon;
}
