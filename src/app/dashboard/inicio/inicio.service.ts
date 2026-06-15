// // inicio.service.ts

// import { Injectable, signal } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { forkJoin } from 'rxjs';

// const BASE_URL = '/api/inicio';

// export interface DashboardStats {
//   gestosGuardados: number;
//   automatizaciones: number;
//   dispositivosVinculados: number;
//   accionesHoy: number;
//   devicesOnline: number;
//   activeAutomations: number;
//   userName: string;
// }

// export interface AccionRapida {
//   id: number;
//   cantidad: number;
//   label: string;
//   icon: string;
// }

// @Injectable({ providedIn: 'root' })
// export class InicioService {

//   readonly stats    = signal<DashboardStats | null>(null);
//   readonly acciones = signal<AccionRapida[]>([]);

//   readonly loading = signal<boolean>(false);
//   readonly error   = signal<string | null>(null);

//   constructor(private http: HttpClient) {}

//   // ─────────────────────────────────────────
//   //  GET /api/inicio/stats + /api/inicio/acciones
//   // ─────────────────────────────────────────
//   loadInicio(): void {
//     this.loading.set(true);
//     this.error.set(null);

//     forkJoin({
//       stats:    this.http.get<DashboardStats>(`${BASE_URL}/stats`),
//       acciones: this.http.get<AccionRapida[]>(`${BASE_URL}/acciones`),
//     }).subscribe({
//       next: ({ stats, acciones }) => {
//         this.stats.set(stats);
//         this.acciones.set(acciones);
//         this.loading.set(false);
//       },
//       error: err => {
//         this.error.set('No se pudo cargar el dashboard.');
//         this.loading.set(false);
//         console.error(err);
//       }
//     });
//   }
// }
import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { Device } from '../../dispositivos/device.model';

export interface DashboardStats {
  gestosGuardados: number;
  automatizaciones: number;
  dispositivosVinculados: number;
  accionesHoy: number;
  devicesOnline: number;
  activeAutomations: number;
  userName: string;
}

export interface UsuarioData {
  id: number;
  nombre: string;
  correo: string;
}

interface ApiResponse<T> {
  success: boolean;
  status: number;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class InicioService {
  private readonly baseUrl = 'http://localhost:5295/api';

  readonly stats = signal<DashboardStats | null>(null);
  readonly acciones = signal<unknown[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  loadInicio(id: number, token: string): void {
    this.loading.set(true);
    this.error.set(null);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    forkJoin({
      perfil: this.http.get<ApiResponse<UsuarioData>>(`${this.baseUrl}/UsuariosApi/${id}`, { headers }),
      dispositivos: this.http.get<ApiResponse<Device[]>>(`${this.baseUrl}/Dim_Aparatos`, { headers })
    }).pipe(
      map(({ perfil, dispositivos }) => {
        const dispositivosData = Array.isArray(dispositivos.data) ? dispositivos.data : [];

        const stats: DashboardStats = {
          gestosGuardados: 0,
          automatizaciones: 0,
          dispositivosVinculados: dispositivosData.length,
          accionesHoy: 0,
          devicesOnline: dispositivosData.length,
          activeAutomations: 0,
          userName: perfil.data?.nombre ?? 'Usuario'
        };

        return { stats, dispositivosData };
      })
    ).subscribe({
      next: ({ stats }) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudo cargar la información del dashboard.');
        this.loading.set(false);
        console.error('Error en loadInicio:', err);
      }
    });
  }
}
