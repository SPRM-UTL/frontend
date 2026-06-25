import { CommonModule } from '@angular/common';
import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  LucideChevronDown,
  LucideClock,
  LucideDynamicIcon,
  LucideFilter,
  LucideHand,
  LucideSearch,
  LucideSun,
  LucideTriangleAlert,
} from '@lucide/angular';

import { DispositivosService } from '../dispositivos/dispositivos.service';
import { getGestureIcon } from '../shared/icon-map';
import { ToastService } from '../services/toast.service';
import { Gesto } from './gesto.model';
import { GestosService } from './gestos.service';

@Component({
  selector: 'app-gestos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideSearch,
    LucideFilter,
    LucideChevronDown,
    LucideHand,
    LucideClock,
    LucideSun,
    LucideTriangleAlert,
    LucideDynamicIcon,
  ],
  templateUrl: './gestos.html',
  styleUrl: './gestos.css'
})
export class Gestos {
  private dispositivosService = inject(DispositivosService);
  private gestosService = inject(GestosService);
  private toastService = inject(ToastService);

  public gestos = signal<Gesto[]>([]);

  readonly searchQuery = signal('');
  readonly statusFilter = signal('');
  readonly selectedFilterLabel = signal('Todos los gestos');
  readonly isFilterOpen = signal(false);

  readonly gestosFiltrados = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();

    let filtered = this.gestos();

    if (q) {
      filtered = filtered.filter(g =>
        (g.nombre_gesto ?? '').toLowerCase().includes(q) ||
        (g.tipo_disparador_nombre ?? '').toLowerCase().includes(q) ||
        String(g.sk_gesto_id).includes(q)
      );
    }

    if (status) {
      filtered = filtered.filter(g => {
        const isActive = g.estado === 'Activo' || g.activo === true || (g.activo as any) == 1;

        if (status === 'Activo') return isActive;
        if (status === 'Pausado') return !isActive;

        return true;
      });
    }

    return filtered;
  });

  readonly totalActivos = computed(() =>
    this.gestos().filter(
      g => g.estado === 'Activo' || g.activo === true || (g.activo as any) == 1
    ).length
  );

  readonly loading = this.gestosService.loading;
  readonly error = this.gestosService.error;

  constructor() {
    afterNextRender(() => {
      this.dispositivosService.loadDevices();

      this.gestosService.loadGestos().subscribe({
        next: data => {
          console.log('Gestos cargados en componente:', data);
          this.gestos.set(data);
        },
        error: err => {
          console.error('Error al activar la peticion de gestos:', err);
          this.toastService.error(err?.error?.data || 'Error al cargar los gestos');
        }
      });
    });
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  onFilterStatus(value: string, label: string): void {
    this.statusFilter.set(value);
    this.selectedFilterLabel.set(label);
    this.isFilterOpen.set(false);
  }

  toggleFilter(): void {
    this.isFilterOpen.update(v => !v);
  }

  obtenerNombreDispositivo(id: number | null): string {
    return this.dispositivosService.devices().find(
      d => d.sk_aparato_id === id
    )?.nombre_aparato ?? 'Sin Dispositivo';
  }

  verDetalle(gesto: Gesto): void {
    this.gestosService.getGestoDetalle(gesto.sk_gesto_id).subscribe({
      next: detalle => {
        const gestoCompleto: Gesto = {
          ...gesto,
          ...detalle,
          multimedia: detalle.multimedia || gesto.multimedia || {
            fotos: [],
            video_url: 'placeholder_url',
            video_duracion: '0:05'
          }
        };

        if (!gestoCompleto.recomendaciones || gestoCompleto.recomendaciones.length === 0) {
          gestoCompleto.recomendaciones = [
            'Distancia 0.5 - 1.5 m de camara.',
            'Gesto claro por 1 seg.',
            'Iluminacion adecuada.',
            'Evitar obstrucciones.'
          ];
        }

        this.gestosService.selectedGesto.set(gestoCompleto);
      },
      error: err => {
        console.error('Error al cargar detalle real, usando fallback:', err);
        this.toastService.error(err?.error?.data || 'Error al cargar el detalle del gesto');
      }
    });
  }

  cerrarDetalle(): void {
    this.gestosService.cerrarDetalle();
  }

  getGestureIcon = getGestureIcon;
}
