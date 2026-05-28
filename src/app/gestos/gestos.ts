import { Component, computed, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestosService } from './gestos.service';
import { Gesto } from './gesto.model';

@Component({
  selector: 'app-gestos',
  imports: [CommonModule, FormsModule],
  templateUrl: './gestos.html',
  styleUrl: './gestos.css'
})
export class Gestos implements OnInit {

  private gestosService = inject(GestosService);

  readonly searchQuery = signal('');

  readonly gestosFiltrados = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return q
      ? this.gestosService.gestos().filter(g =>
          g.nombre.toLowerCase().includes(q)     ||
          g.dispositivo.toLowerCase().includes(q) ||
          g.accion.toLowerCase().includes(q)
        )
      : this.gestosService.gestos();
  });

  readonly totalActivos = computed(() =>
    this.gestosService.gestos().filter(g => g.estado === 'Activo').length
  );

  readonly loading = this.gestosService.loading;
  readonly error   = this.gestosService.error;

  ngOnInit(): void {
    this.gestosService.loadGestos();
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  toggleEstado(gesto: Gesto): void {
    this.gestosService.toggleEstado(gesto);
  }

  eliminarGesto(id: number): void {
    this.gestosService.eliminarGesto(id);
  }
}