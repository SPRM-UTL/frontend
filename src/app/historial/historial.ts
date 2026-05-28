// historial.ts

import { Component, computed, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistorialService } from './historial.service';

@Component({
  selector: 'app-historial',
  imports: [CommonModule, FormsModule],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class Historial implements OnInit {

  private historialService = inject(HistorialService);

  readonly searchQuery = signal('');

  readonly actividadesFiltradas = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return q
      ? this.historialService.actividades().filter(a =>
          a.accion.toLowerCase().includes(q)      ||
          a.dispositivo.toLowerCase().includes(q) ||
          a.metodo.toLowerCase().includes(q)      ||
          a.estado.toLowerCase().includes(q)
        )
      : this.historialService.actividades();
  });

  readonly loading = this.historialService.loading;
  readonly error   = this.historialService.error;

  ngOnInit(): void {
    this.historialService.loadHistorial();
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }
}