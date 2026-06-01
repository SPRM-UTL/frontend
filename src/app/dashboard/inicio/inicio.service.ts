// inicio.service.ts

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

const BASE_URL = '/api/inicio';

export interface DashboardStats {
  gestosGuardados: number;
  automatizaciones: number;
  dispositivosVinculados: number;
  accionesHoy: number;
  devicesOnline: number;
  activeAutomations: number;
  userName: string;
}

export interface AccionRapida {
  id: number;
  cantidad: number;
  label: string;
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class InicioService {

  readonly stats    = signal<DashboardStats | null>(null);
  readonly acciones = signal<AccionRapida[]>([]);

  readonly loading = signal<boolean>(false);
  readonly error   = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────
  //  GET /api/inicio/stats + /api/inicio/acciones
  // ─────────────────────────────────────────
  loadInicio(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      stats:    this.http.get<DashboardStats>(`${BASE_URL}/stats`),
      acciones: this.http.get<AccionRapida[]>(`${BASE_URL}/acciones`),
    }).subscribe({
      next: ({ stats, acciones }) => {
        this.stats.set(stats);
        this.acciones.set(acciones);
        this.loading.set(false);
      },
      error: err => {
        this.error.set('No se pudo cargar el dashboard.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }
}