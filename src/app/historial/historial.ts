import { Component, computed, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistorialService } from './historial.service';
import {
  LucideLightbulb,
  LucideTv,
  LucideSpeaker,
  LucideFan,
  LucideAirVent
} from '@lucide/angular';

@Component({
  selector: 'app-historial',  
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideLightbulb,
    LucideTv,
    LucideSpeaker,
    LucideFan,
    LucideAirVent
  ],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class Historial implements OnInit {
  private historialService = inject(HistorialService);

  readonly searchQuery = signal('');

  /**
   * Filtrado reactivo mediante computed sobre la señal de actividades del servicio
   */
  readonly actividadesFiltradas = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const lista = this.historialService.actividades();
    
    // Verificación de seguridad por si la lista no es un arreglo válido aún
    if (!Array.isArray(lista)) return [];
    if (!q) return lista;

    return lista.filter(a =>
      (a.accion ?? '').toLowerCase().includes(q)      ||
      (a.dispositivo ?? '').toLowerCase().includes(q) ||
      (a.metodo ?? '').toLowerCase().includes(q)      ||
      (a.estado ?? '').toLowerCase().includes(q)
    );
  });

  // Vinculación directa a los estados de carga y error del servicio
  readonly loading = this.historialService.loading;
  readonly error   = this.historialService.error;

  ngOnInit(): void {
    // Disparo directo y limpio: el servicio se encarga de la suscripción interna
    this.historialService.loadHistorial();
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }
}