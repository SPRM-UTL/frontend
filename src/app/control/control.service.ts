// Importa el decorador para que Angular sepa que esto es un servicio inyectable, y 'signal' para manejar estados reactivos.
import { Injectable, signal } from '@angular/core';
// Importa el módulo HTTP de Angular para poder hacer peticiones (GET, POST, PATCH, etc.) a un servidor externo/API.
import { HttpClient } from '@angular/common/http';
// Importa las interfaces o tipados (modelos de datos) para asegurar que la información que manejamos tenga la estructura correcta.
import { Luz, Bocina, Ventilador, Categoria } from './control.model';

// Define una constante con la ruta base de la API para no tener que escribir '/api/control' en cada petición.
const BASE_URL = 'https://backend-neao.onrender.com/api/aparatos/control';

export interface ControlResponse {
  luces: Luz[];
  bocinas: Bocina[];
  ventiladores: Ventilador[];
}
export interface ApiResponse {
  success: boolean;
  status: number;
  data: ControlResponse;
}

@Injectable({ providedIn: 'root' })
export class ControlService {

  readonly categorias = signal<Categoria[]>([]);
  readonly luces      = signal<Luz[]>([]);
  readonly bocinas    = signal<Bocina[]>([]);
  readonly ventiladores = signal<Ventilador[]>([]);

  readonly loading = signal<boolean>(false);
  readonly error   = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Mapea un objeto del backend al formato esperado por el frontend
   * (Ejem: 'nombre' -> 'nombre_aparato', 'estado' -> 'encendido')
   */
  private mapDevice(d: any): any {
    return {
      ...d,
      nombre_aparato: d.nombre_aparato || d.nombre || 'Dispositivo sin nombre',
      encendido: d.encendido !== undefined ? d.encendido : (d.estado !== undefined ? d.estado : false)
    };
  }

  // ─────────────────────────────────────────
  //  GET /api/control  (carga todo de una vez)
  // ─────────────────────────────────────────
  loadControl(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<ApiResponse>(BASE_URL).subscribe({
      next: response => {
        if (response && response.data) {
          this.luces.set((response.data.luces || []).map(l => this.mapDevice(l)));
          this.bocinas.set((response.data.bocinas || []).map(b => this.mapDevice(b)));
          this.ventiladores.set((response.data.ventiladores || []).map(v => this.mapDevice(v)));
        }
        this.loading.set(false);
      },
      error: err => {
        this.error.set('No se pudo conectar con el servidor de control.');
        this.loading.set(false);
        console.error('Error al cargar control:', err);
      }
    });
  }

  // ─────────────────────────────────────────
  //  PATCH /api/control/luces/:id
  // ─────────────────────────────────────────
  toggleLuz(id: number): void {
    this.http.patch(`${BASE_URL}/luces/${id}/toggle`, {}).subscribe({
      next: (updated: any) => {
        const mapped = this.mapDevice(updated);
        this.luces.update(list => list.map(l => l.id === id ? mapped : l));
      },
      error: err => { this.error.set('No se pudo cambiar el estado de la luz.'); console.error(err); }
    });
  }

  updateLuz(updated: Luz): void {
    this.http.patch<Luz>(`${BASE_URL}/luces/${updated.id}`, updated).subscribe({
      next: saved => {
        const mapped = this.mapDevice(saved);
        this.luces.update(list => list.map(l => l.id === mapped.id ? mapped : l));
      },
      error: err => { this.error.set('No se pudo actualizar la luz.'); console.error(err); }
    });
  }

  // ─────────────────────────────────────────
  //  PATCH /api/control/bocinas/:id
  // ─────────────────────────────────────────
  toggleBocina(id: number): void {
    this.http.patch(`${BASE_URL}/bocinas/${id}/toggle`, {}).subscribe({
      next: (updated: any) => {
        const mapped = this.mapDevice(updated);
        this.bocinas.update(list => list.map(t => t.id === id ? mapped : t));
      },
      error: err => { this.error.set('No se pudo cambiar el estado de la bocina.'); console.error(err); }
    });
  }

  updateBocina(updated: Bocina): void {
    this.http.patch<Bocina>(`${BASE_URL}/bocinas/${updated.id}`, updated).subscribe({
      next: saved => {
        const mapped = this.mapDevice(saved);
        this.bocinas.update(list => list.map(t => t.id === mapped.id ? mapped : t));
      },
      error: err => { this.error.set('No se pudo actualizar la bocina.'); console.error(err); }
    });
  }

  // ─────────────────────────────────────────
  //  PATCH /api/control/ventiladores/:id
  // ─────────────────────────────────────────
  toggleVentilador(id: number): void {
    this.http.patch(`${BASE_URL}/ventiladores/${id}/toggle`, {}).subscribe({
      next: (updated: any) => {
        const mapped = this.mapDevice(updated);
        this.ventiladores.update(list => list.map(a => a.id === id ? mapped : a));
      },
      error: err => { this.error.set('No se pudo cambiar el estado del ventilador.'); console.error(err); }
    });
  }

  updateVentilador(updated: Ventilador): void {
    this.http.patch<Ventilador>(`${BASE_URL}/ventiladores/${updated.id}`, updated).subscribe({
      next: saved => {
        const mapped = this.mapDevice(saved);
        this.ventiladores.update(list => list.map(a => a.id === mapped.id ? mapped : a));
      },
      error: err => { this.error.set('No se pudo actualizar el ventilador.'); console.error(err); }
    });
  }
}
