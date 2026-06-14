import { Component, computed, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestosService } from './gestos.service';
import { Gesto } from './gesto.model';
import { LucideHand, LucideUser,} from '@lucide/angular'

@Component({
  selector: 'app-gestos',
  imports: [CommonModule, FormsModule, LucideHand, LucideUser],
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

  ngOnInit(): void {
    this.gestosService.loadGestos();
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