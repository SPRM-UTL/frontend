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
  LucideHand,
  LucideDynamicIcon,
} from '@lucide/angular';
import { getActivityIcon, getDeviceIcon } from '../shared/icon-map';
import { SkeletonComponent } from 'boneyard-js/angular';

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
    LucideHand,
    LucideDynamicIcon,
    SkeletonComponent
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

  // Pagination State
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.actividadesFiltradas().length / this.pageSize()));
  });

  readonly startIndex = computed(() => {
    if (this.actividadesFiltradas().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly endIndex = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.actividadesFiltradas().length);
  });

  readonly actividadesPaginadas = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.actividadesFiltradas().slice(start, end);
  });

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  readonly loading = this.historialService.loading;
  readonly error   = this.historialService.error;

  readonly selectedId = signal<number | null>(null);

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

  // Modal State
  readonly isModalOpen = signal(false);
  readonly selectedActividad = signal<any>(null);

  openModal(actividad: any) {
    this.selectedActividad.set(actividad);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedActividad.set(null);
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
