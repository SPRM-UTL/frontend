import { Component, computed, signal, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestosService } from './gestos.service';
import { Gesto } from './gesto.model';

@Component({
  selector: 'app-gestos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestos.html',
  styleUrl: './gestos.css'
})
export class Gestos {

  private gestosService = inject(GestosService);

  readonly searchQuery = signal('');
  readonly selectedGesto = signal<Gesto | null>(null);

  readonly gestosFiltrados = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return q
    ? this.gestosService.gestos().filter(g =>
        (g.nombre_gesto ?? '').toLowerCase().includes(q) ||
        (g.tipo_disparador_nombre ?? '').toLowerCase().includes(q) ||
        String(g.sk_gesto_id).includes(q)
      )
    : this.gestosService.gestos();
  });

  readonly totalActivos = computed(() =>
    this.gestosService.gestos().filter(g => g.estado === 'Activo' || g.activo === true).length
  );

  readonly loading = this.gestosService.loading;
  readonly error   = this.gestosService.error;

  constructor() {
    afterNextRender(() => {
      this.gestosService.loadGestos().subscribe({
        next: (data) => console.log('Gestos cargados en componente:', data),
        error: (err) => console.error('Error al activar la petición de gestos:', err)
      });
    });
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  getIconPath(icono: string | undefined): string {
    if (icono === 'user') return '/icons/user.svg';
    return '/icons/hand.svg';
  }

  verDetalle(gesto: Gesto): void {
    this.gestosService.getGestoDetalle(gesto.sk_gesto_id).subscribe({
      next: (detalle) => {
        const gestoCompleto: Gesto = {
          ...gesto,
          ...detalle,
          // Aseguramos que multimedia exista para evitar errores en template
          multimedia: detalle.multimedia || gesto.multimedia || {
            fotos: [this.getIconPath(gesto.icono), this.getIconPath(gesto.icono)], // Dos fotos de ejemplo
            video_url: 'placeholder_url', // URL para que se muestre el cuadro de video
            video_duracion: '0:05'
          }
        };

        // Fallbacks para recomendaciones si no vienen en la API
        if (!gestoCompleto.recomendaciones || gestoCompleto.recomendaciones.length === 0) {
          gestoCompleto.recomendaciones = [
            'Distancia 0.5 - 1.5 m de cámara.',
            'Gesto claro por 1 seg.',
            'Iluminación adecuada.',
            'Evitar obstrucciones.'
          ];
        }

        this.selectedGesto.set(gestoCompleto);
      },
      error: (err) => {
        console.error('Error al cargar detalle real, usando fallback:', err);
        this.selectedGesto.set({
          ...gesto,
          descripcion: gesto.descripcion || 'Este gesto permite controlar el dispositivo mediante un movimiento específico detectado por la IA.',
          recomendaciones: ['Distancia 0.5 - 1.5 m de cámara.', 'Gesto claro por 1 seg.', 'Iluminación adecuada.', 'Evitar obstrucciones.'],
          duracion_segundos: 1,
          iluminacion_requerida: 'Alta',
          distancia_minima_m: 0.5,
          distancia_maxima_m: 1.5,
          precision_ia: 'Alta',
          multimedia: {
            fotos: [this.getIconPath(gesto.icono), this.getIconPath(gesto.icono)],
            video_url: 'placeholder_url',
            video_duracion: '0:05'
          }
        });
      }
    });
  }

  cerrarDetalle(): void {
    this.selectedGesto.set(null);
  }
}
