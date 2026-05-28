// historial.service.ts
//
// TODO (backend):
//   1. Inyectar HttpClient y reemplazar los bloques MOCK.
//   2. Actualizar BASE_URL con la URL real del API.

import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
// import { HttpClient } from '@angular/common/http';
import { Actividad } from './actividad.model';

const BASE_URL = '/api/historial';

const MOCK_ACTIVIDADES: Actividad[] = [
  { id: 1,  hora: '12:30 PM', accion: 'Encender luces sala',       dispositivo: 'Luces Sala',          dispositivoEmoji: '💡', dispositivoColor: '#f97316', estado: 'Ejecutado', metodo: 'Gesto' },
  { id: 2,  hora: '11:15 AM', accion: 'Smart TV apagada',          dispositivo: 'Smart TV',             dispositivoEmoji: '📺', dispositivoColor: '#8b5cf6', estado: 'Ejecutado', metodo: 'App móvil' },
  { id: 3,  hora: '09:40 AM', accion: 'Reproducir música',         dispositivo: 'Bocina Inteligente',   dispositivoEmoji: '🎵', dispositivoColor: '#ec4899', estado: 'Pendiente', metodo: 'Gesto' },
  { id: 4,  hora: '08:15 AM', accion: 'Ajustar temperatura 22°C',  dispositivo: 'Aire Acondicionado',   dispositivoEmoji: '❄️', dispositivoColor: '#3b82f6', estado: 'Ejecutado', metodo: 'Automatización' },
  { id: 5,  hora: '07:30 AM', accion: 'Abrir cortinas',            dispositivo: 'Cortinas Inteligentes',dispositivoEmoji: '🪟', dispositivoColor: '#10b981', estado: 'Ejecutado', metodo: 'Automatización' },
  { id: 6,  hora: '07:00 AM', accion: 'Encender luces dormitorio', dispositivo: 'Luces Dormitorio',     dispositivoEmoji: '💡', dispositivoColor: '#f97316', estado: 'Ejecutado', metodo: 'Gesto' },
  { id: 7,  hora: '11:00 PM', accion: 'Apagar ventilador',         dispositivo: 'Ventilador Dormitorio',dispositivoEmoji: '🌀', dispositivoColor: '#06b6d4', estado: 'Ejecutado', metodo: 'App móvil' },
  { id: 8,  hora: '10:45 PM', accion: 'Modo noche activado',       dispositivo: 'Sistema General',      dispositivoEmoji: '🌙', dispositivoColor: '#6366f1', estado: 'Ejecutado', metodo: 'Automatización' },
  { id: 9,  hora: '09:20 PM', accion: 'Bajar volumen TV',          dispositivo: 'Smart TV',             dispositivoEmoji: '📺', dispositivoColor: '#8b5cf6', estado: 'Error',     metodo: 'Gesto' },
  { id: 10, hora: '08:00 PM', accion: 'Encender sistema sonido',   dispositivo: 'Bocina Sala',          dispositivoEmoji: '🔊', dispositivoColor: '#ec4899', estado: 'Ejecutado', metodo: 'App móvil' },
];

@Injectable({ providedIn: 'root' })
export class HistorialService {

  private _actividades = signal<Actividad[]>([]);
  readonly actividades  = this._actividades.asReadonly();

  readonly loading = signal<boolean>(false);
  readonly error   = signal<string | null>(null);

  // constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────
  //  GET /api/historial
  // ─────────────────────────────────────────
  loadHistorial(): void {
    this.loading.set(true);
    this.error.set(null);

    this.getActividades$().subscribe({
      next:  actividades => { this._actividades.set(actividades); this.loading.set(false); },
      error: err         => { this.error.set('No se pudo cargar el historial.'); this.loading.set(false); console.error(err); }
    });
  }

  private getActividades$(): Observable<Actividad[]> {
    // ── MOCK ──────────────────────────────────────────────────
    return of([...MOCK_ACTIVIDADES]);

    // ── BACKEND (descomentar) ─────────────────────────────────
    // return this.http.get<Actividad[]>(BASE_URL);
  }
}