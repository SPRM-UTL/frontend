// gestos.service.ts
//
// TODO (backend):
//   1. Inyectar HttpClient y reemplazar los bloques MOCK.
//   2. Actualizar BASE_URL con la URL real del API.

import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
// import { HttpClient } from '@angular/common/http';
import { Gesto, GestoEstadoUpdate } from './gesto.model';

const BASE_URL = '/api/gestos';

const MOCK_GESTOS: Gesto[] = [
  {
    id: 1, nombre: 'Saludo - Encender Luces', emoji: '👋',
    dispositivo: 'Luces del Salón', dispositivoIconColor: '#f97316', dispositivoIconEmoji: '💡',
    accion: 'Encender todas las luces', tiempo: 'Hace 2 minutos', estado: 'Activo'
  },
  {
    id: 2, nombre: 'Pulgar Arriba - TV', emoji: '👍',
    dispositivo: 'Smart TV Samsung', dispositivoIconColor: '#8b5cf6', dispositivoIconEmoji: '📺',
    accion: 'Encender televisión', tiempo: 'Hace 1 hora', estado: 'Activo'
  },
  {
    id: 3, nombre: 'Palma Abierta - Ventilador', emoji: '🖐',
    dispositivo: 'Ventilador Dormitorio', dispositivoIconColor: '#06b6d4', dispositivoIconEmoji: '🌀',
    accion: 'Apagar ventilador', tiempo: 'Hace 30 minutos', estado: 'Activo'
  },
  {
    id: 4, nombre: 'Dos Dedos - Cortinas', emoji: '✌️',
    dispositivo: 'Cortinas Inteligentes', dispositivoIconColor: '#10b981', dispositivoIconEmoji: '🪟',
    accion: 'Abrir cortinas', tiempo: 'Hace 3 horas', estado: 'Activo'
  },
  {
    id: 5, nombre: 'Puño Cerrado - Música', emoji: '✊',
    dispositivo: 'Altavoz Inteligente', dispositivoIconColor: '#ec4899', dispositivoIconEmoji: '🎵',
    accion: 'Reproducir música', tiempo: 'Hace 45 minutos', estado: 'Activo'
  },
  {
    id: 6, nombre: 'Señalar - Aire Acondicionado', emoji: '☝️',
    dispositivo: 'AC Habitación Principal', dispositivoIconColor: '#3b82f6', dispositivoIconEmoji: '❄️',
    accion: 'Ajustar temperatura a 22°C', tiempo: 'Hace 5 horas', estado: 'Pausado'
  }
];

@Injectable({ providedIn: 'root' })
export class GestosService {

  private _gestos = signal<Gesto[]>([]);
  readonly gestos  = this._gestos.asReadonly();

  readonly loading = signal<boolean>(false);
  readonly error   = signal<string | null>(null);

  // constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────
  //  GET /api/gestos
  // ─────────────────────────────────────────
  loadGestos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.getGestos$().subscribe({
      next:  gestos => { this._gestos.set(gestos); this.loading.set(false); },
      error: err    => { this.error.set('No se pudieron cargar los gestos.'); this.loading.set(false); console.error(err); }
    });
  }

  private getGestos$(): Observable<Gesto[]> {
    // ── MOCK ──────────────────────────────────────────────────
    return of([...MOCK_GESTOS]);

    // ── BACKEND (descomentar) ─────────────────────────────────
    // return this.http.get<Gesto[]>(BASE_URL);
  }

  // ─────────────────────────────────────────
  //  PATCH /api/gestos/:id/estado
  // ─────────────────────────────────────────
  toggleEstado(gesto: Gesto): void {
    const update: GestoEstadoUpdate = {
      id: gesto.id,
      estado: gesto.estado === 'Activo' ? 'Pausado' : 'Activo'
    };

    this.patchEstado$(update).subscribe({
      next: updated => {
        this._gestos.update(list =>
          list.map(g => g.id === updated.id ? updated : g)
        );
      },
      error: err => { this.error.set(`No se pudo cambiar el estado de "${gesto.nombre}".`); console.error(err); }
    });
  }

  private patchEstado$(update: GestoEstadoUpdate): Observable<Gesto> {
    // ── MOCK ──────────────────────────────────────────────────
    const current = this._gestos().find(g => g.id === update.id)!;
    return of({ ...current, estado: update.estado });

    // ── BACKEND (descomentar) ─────────────────────────────────
    // return this.http.patch<Gesto>(`${BASE_URL}/${update.id}/estado`, update);
  }

  // ─────────────────────────────────────────
  //  DELETE /api/gestos/:id
  // ─────────────────────────────────────────
  eliminarGesto(id: number): void {
    this.delete$(id).subscribe({
      next: () => {
        this._gestos.update(list => list.filter(g => g.id !== id));
      },
      error: err => { this.error.set('No se pudo eliminar el gesto.'); console.error(err); }
    });
  }

  private delete$(id: number): Observable<void> {
    // ── MOCK ──────────────────────────────────────────────────
    return of(undefined);

    // ── BACKEND (descomentar) ─────────────────────────────────
    // return this.http.delete<void>(`${BASE_URL}/${id}`);
  }
}