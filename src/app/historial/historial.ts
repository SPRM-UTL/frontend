import { Component, computed, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistorialService } from './historial.service';
import { DispositivosService } from '../dispositivos/dispositivos.service';

import {
  LucideSearch,
  LucideFilter,
  LucideChevronDown,
  LucideClock,
  LucideSun,
  LucideTriangleAlert,
  LucideSmartphone,
  LucideDynamicIcon,
} from '@lucide/angular';
import { getActivityIcon, getDeviceIcon } from '../shared/icon-map';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideSearch,
    LucideFilter,
    LucideChevronDown,
    LucideClock,
    LucideSun,
    LucideTriangleAlert,
    LucideSmartphone,
    LucideDynamicIcon,
  ],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class Historial implements OnInit {
  private historialService = inject(HistorialService);
  private dispositivosService = inject(DispositivosService);

  readonly searchQuery = signal('');
  readonly showActions = signal(false);

  // Dropdown Filter State
  readonly isFilterOpen = signal(false);
  readonly selectedFilter = signal('');
  readonly selectedFilterLabel = signal('Todos los estados');

  readonly actividadesFiltradas = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const status = this.selectedFilter();
    let lista = this.historialService.actividades();

    if (!Array.isArray(lista)) return [];

    // Filtro por búsqueda
    if (q) {
      lista = lista.filter(a =>
        (a.accion ?? '').toLowerCase().includes(q)      ||
        (a.dispositivo ?? '').toLowerCase().includes(q) ||
        (a.metodo ?? '').toLowerCase().includes(q)      ||
        (a.estado ?? '').toLowerCase().includes(q)
      );
    }

    // Filtro por estado
    if (status) {
      lista = lista.filter(a => (a.estado ?? '') === status);
    }

    return lista;
  });

  readonly loading = this.historialService.loading;
  readonly error   = this.historialService.error;

  ngOnInit(): void {
    this.historialService.loadHistorial();
    this.dispositivosService.loadDevices();
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  // Dropdown Methods
  toggleFilter() {
    this.isFilterOpen.update(v => !v);
  }

  selectFilter(value: string, label: string) {
    this.selectedFilter.set(value);
    this.selectedFilterLabel.set(label);
    this.isFilterOpen.set(false);
  }

  getActivityIcon = getActivityIcon;
  getDeviceIcon   = getDeviceIcon;

  formatHora(hora: any): string {
    const h = parseInt(hora, 10);
    if (isNaN(h)) return hora || '0';

    if (h === 0) return '12:00 AM';
    if (h < 12) return `${h}:00 AM`;
    if (h === 12) return '12:00 PM';

    return `${h - 12}:00 PM`;
  }
}
