// inicio.service.ts
//
// TODO (backend):
//   1. Inyectar HttpClient y reemplazar los bloques MOCK.
//   2. Actualizar BASE_URL con la URL real del API.

import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
// import { HttpClient } from '@angular/common/http';

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

const MOCK_STATS: DashboardStats = {
  gestosGuardados:        24,
  automatizaciones:       24,
  dispositivosVinculados: 24,
  accionesHoy:            24,
  devicesOnline:           8,
  activeAutomations:       3,
  userName: 'Alex',
};

const MOCK_ACCIONES: AccionRapida[] = [
  { id: 1, cantidad: 3, label: 'Todas las luces apagadas', icon: 'light' },
  { id: 2, cantidad: 2, label: 'Modo nocturno',            icon: 'moon'  },
  { id: 3, cantidad: 1, label: 'Modo cine',                icon: 'tv'    },
  { id: 4, cantidad: 3, label: 'Buenas noches',            icon: 'moon'  },
];

@Injectable({ providedIn: 'root' })
export class InicioService {

  readonly stats    = signal<DashboardStats | null>(null);
  readonly acciones = signal<AccionRapida[]>([]);

  readonly loading = signal<boolean>(false);
  readonly error   = signal<string | null>(null);

  // constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────
  //  GET /api/inicio
  // ─────────────────────────────────────────
  loadInicio(): void {
    this.loading.set(true);
    this.error.set(null);

    this.getStats$().subscribe({
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

  private getStats$(): Observable<{ stats: DashboardStats; acciones: AccionRapida[] }> {
    // ── MOCK ──────────────────────────────────────────────────
    return of({ stats: { ...MOCK_STATS }, acciones: [...MOCK_ACCIONES] });

    // ── BACKEND (descomentar) ─────────────────────────────────
    // return forkJoin({
    //   stats:    this.http.get<DashboardStats>(`${BASE_URL}/stats`),
    //   acciones: this.http.get<AccionRapida[]>(`${BASE_URL}/acciones`),
    // });
  }
}