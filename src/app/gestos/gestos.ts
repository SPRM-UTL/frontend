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
}
