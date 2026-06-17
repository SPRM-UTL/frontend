import { Component, computed, signal, inject, afterNextRender } from '@angular/core'; // <-- Cambiamos OnInit por afterNextRender
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestosService } from './gestos.service';
import { Gesto } from './gesto.model';
import { LucideHand, LucideUser } from '@lucide/angular';

@Component({
  selector: 'app-gestos',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideHand, LucideUser],
  templateUrl: './gestos.html',
  styleUrl: './gestos.css'
})
export class Gestos { // <-- Quitamos "implements OnInit"

  private gestosService = inject(GestosService);

  readonly searchQuery = signal('');

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
    this.gestosService.gestos().filter(g => g.estado === 'Activo').length
  );

  readonly loading = this.gestosService.loading;
  readonly error   = this.gestosService.error;

  constructor() {
    // ── DISPARO SEGURO Y COMPLETO EN EL NAVEGADOR ──
    afterNextRender(() => {
      // Nos suscribimos explícitamente para activar el flujo frío y que Render responda
      this.gestosService.loadGestos().subscribe({
        next: (data) => console.log('Gestos cargados en componente:', data),
        error: (err) => console.error('Error al activar la petición de gestos:', err)
      });
    });
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  // toggleEstado(gesto: Gesto): void {
  //   this.gestosService.toggleEstado(gesto);
  // }

  // eliminarGesto(id: number): void {
  //   this.gestosService.eliminarGesto(id);
  // }
}