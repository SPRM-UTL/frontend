import { Component, computed, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistorialService } from './historial.service';

import {
  LucideSearch,
  LucideFilter,
  LucideChevronDown,
  LucideClock,
  LucideSun,
  LucideTriangleAlert,
  LucideSmartphone,
  LucideHand,
  LucideBolt,
  LucideMic,
  LucideSparkles,
  LucideTvMinimal,
  LucideSpeaker,
  LucideLightbulb,
  LucideLampFloor,
  LucideWind,
  LucidePlug,
  LucideCirclePlus
} from '@lucide/angular';

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
    LucideBolt,
    LucideMic,
    LucideSparkles,
    LucideTvMinimal,
    LucideSpeaker,
    LucideLightbulb,
    LucideLampFloor,
    LucideWind,
    LucidePlug,
    LucideCirclePlus
  ],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class Historial implements OnInit {
  private historialService = inject(HistorialService);

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

  // Mapeo de tipos de aparatos a iconos Lucide
  readonly categoryIconMap: Record<string, string> = {
    'Audífonos': 'headphones',
    'Bocinas': 'speaker',
    'Focos': 'lightbulb',
    'Luces': 'lamp-floor',
    'Ventilador': 'wind',
    'Televisión': 'tv-minimal',
    'Sockets': 'plug',
    'Asistente': 'circle-plus',
    'Predeterminado': 'circle-plus'
  };

  getIconName(icono: string | undefined): string {
    if (!icono) return 'sparkles';
    // Si el icono es un tipo de aparato, lo mapeamos
    const iconName = this.categoryIconMap[icono] || icono;
    return iconName;
  }

  getMethodIcon(metodo: string | undefined): string {
    const m = (metodo || '').toLowerCase();
    if (m.includes('gesto')) return 'hand';
    if (m.includes('app') || m.includes('móvil')) return 'smartphone';
    if (m.includes('auto')) return 'bolt';
    if (m.includes('voz')) return 'mic';
    return 'sparkles';
  }

  formatHora(hora: any): string {
    const h = parseInt(hora, 10);
    if (isNaN(h)) return hora || '0';

    if (h === 0) return '12:00 AM';
    if (h < 12) return `${h}:00 AM`;
    if (h === 12) return '12:00 PM';

    return `${h - 12}:00 PM`;
  }
}
