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
          this.toastService.error(err?.error?.data || 'No se encontraron registros');
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

  getActivador(gesto: Gesto): string {
    const p = gesto.pasos?.find(x => x.es_activador);
    return p ? p.nombre_gesto : 'N/A';
  }

  getSecuencia(gesto: Gesto): string {
    const pasos = gesto.pasos?.filter(x => !x.es_activador).sort((a,b) => a.orden - b.orden);
    if (!pasos || pasos.length === 0) return 'Sin secuencia';
    return pasos.map(p => p.nombre_gesto).join(', ');
  }

  verDetalle(gesto: Gesto): void {
    // Primero seteamos el gesto básico para que el modal se abra inmediatamente
    this.gestosService.selectedGesto.set(gesto);

    // Luego cargamos el detalle real desde el endpoint específico
    this.gestosService.getGestoDetalle(gesto.sk_gesto_id).subscribe({
      next: (detalle: any) => {
        // Actualizamos el signal con los datos reales del detalle
        this.gestosService.selectedGesto.update(current => {
          if (current && current.sk_gesto_id === gesto.sk_gesto_id) {
            // Extraer videos y fotos
            const videos = (detalle.medios_referencia || [])
              .filter((m: any) => m.tipo_media === 2);

            const fotos = (detalle.medios_referencia || [])
              .filter((m: any) => m.tipo_media === 1)
              .map((m: any) => m.url_archivo);

            return {
              ...current,
              // Mapeamos los campos del detalle a los que espera el template
              duracion_segundos: detalle.duracion_segundos,
              iluminacion_requerida: detalle.iluminacion_recomendada,
              distancia_minima_m: undefined,
              distancia_maxima_m: undefined,
              precision_ia: 'Alta',
              recomendaciones: [
                detalle.distancia_recomendada,
                detalle.iluminacion_recomendada,
                'Gesto claro por 1 seg.',
                'Evitar obstrucciones.'
              ],
              videos: videos.map((v: any) => v.url_archivo),
              multimedia: {
                fotos: fotos,
                video_url: videos.length > 0 ? videos[0].url_archivo : undefined,
                video_duracion: `${detalle.duracion_segundos} seg.`
              },
              detalle: detalle
            };
          }
          return current;
        });
      },
      error: err => {
        console.warn('No se encontraron detalles adicionales (o error 404):', err);
      }
    });
  }

  cerrarDetalle(): void {
    this.gestosService.cerrarDetalle();
  }

  getGestureIcon = getGestureIcon;
}
