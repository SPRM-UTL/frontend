// control.service.ts
//
// TODO (backend):
//   1. Inyectar HttpClient y reemplazar los bloques MOCK.
//   2. Actualizar BASE_URL con la URL real del API.

import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
// import { HttpClient } from '@angular/common/http';
import { Luz, Tv, Ac, Categoria } from './control.model';

const BASE_URL = '/api/control';

const MOCK_CATEGORIAS: Categoria[] = [
  { nombre: 'Luces',       cantidad: 8, emoji: '💡', color: '#f97316', bg: '#fff7ed' },
  { nombre: 'TV',          cantidad: 2, emoji: '📺', color: '#8b5cf6', bg: '#f5f3ff' },
  { nombre: 'AC',          cantidad: 3, emoji: '❄️', color: '#3b82f6', bg: '#eff6ff' },
  { nombre: 'Audio',       cantidad: 4, emoji: '🎵', color: '#ec4899', bg: '#fdf2f8' },
  { nombre: 'Ventiladores',cantidad: 2, emoji: '🌀', color: '#06b6d4', bg: '#ecfeff' },
  { nombre: 'Cortinas',    cantidad: 5, emoji: '🪟', color: '#10b981', bg: '#ecfdf5' },
];

const MOCK_LUCES: Luz[] = [
  { id: 1, nombre: 'Living Room Lights', ubicacion: 'Living Room • 8 bulbs', encendido: true,  brillo: 75,  tono: 'warm' },
  { id: 2, nombre: 'Bedroom Lights',     ubicacion: 'Bedroom • 4 bulbs',     encendido: false, brillo: 50,  tono: 'cool' },
  { id: 3, nombre: 'Kitchen Lights',     ubicacion: 'Kitchen • 6 bulbs',     encendido: true,  brillo: 100, tono: 'warm' },
];

const MOCK_TVS: Tv[] = [
  { id: 1, nombre: 'Living Room TV', ubicacion: 'Living Room', encendido: true,  nowPlaying: 'Netflix', volumen: 45, app: 'Netflix', apps: ['Netflix','YouTube','Prime','Disney+'] },
  { id: 2, nombre: 'Bedroom TV',     ubicacion: 'Bedroom',     encendido: false, nowPlaying: '',        volumen: 30, app: '',        apps: ['Netflix','YouTube','Prime','Disney+'] },
];

const MOCK_ACS: Ac[] = [
  { id: 1, nombre: 'Living Room AC', ubicacion: 'Living Room', encendido: true,  temp: 22, modo: 'cool', humedad: 55 },
  { id: 2, nombre: 'Bedroom AC',     ubicacion: 'Bedroom',     encendido: false, temp: 24, modo: 'auto', humedad: 48 },
];

@Injectable({ providedIn: 'root' })
export class ControlService {

  readonly categorias = signal<Categoria[]>([]);
  readonly luces      = signal<Luz[]>([]);
  readonly tvs        = signal<Tv[]>([]);
  readonly acs        = signal<Ac[]>([]);

  readonly loading = signal<boolean>(false);
  readonly error   = signal<string | null>(null);

  // constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────
  //  GET /api/control  (carga todo de una vez)
  // ─────────────────────────────────────────
  loadControl(): void {
    this.loading.set(true);
    this.error.set(null);

    // ── MOCK ──────────────────────────────────────────────────
    this.categorias.set([...MOCK_CATEGORIAS]);
    this.luces.set([...MOCK_LUCES]);
    this.tvs.set([...MOCK_TVS]);
    this.acs.set([...MOCK_ACS]);
    this.loading.set(false);

    // ── BACKEND (descomentar) ─────────────────────────────────
    // forkJoin({
    //   luces: this.http.get<Luz[]>(`${BASE_URL}/luces`),
    //   tvs:   this.http.get<Tv[]>(`${BASE_URL}/tvs`),
    //   acs:   this.http.get<Ac[]>(`${BASE_URL}/acs`),
    // }).subscribe({
    //   next: ({ luces, tvs, acs }) => {
    //     this.luces.set(luces); this.tvs.set(tvs); this.acs.set(acs);
    //     this.loading.set(false);
    //   },
    //   error: err => { this.error.set('No se pudo cargar el control.'); this.loading.set(false); }
    // });
  }

  // ─────────────────────────────────────────
  //  PATCH /api/control/luces/:id
  // ─────────────────────────────────────────
  toggleLuz(id: number): void {
    this.luces.update(list =>
      list.map(l => l.id === id ? { ...l, encendido: !l.encendido } : l)
    );
    // BACKEND: this.http.patch(`${BASE_URL}/luces/${id}/toggle`, {}).subscribe();
  }

  updateLuz(updated: Luz): void {
    this.luces.update(list => list.map(l => l.id === updated.id ? updated : l));
    // BACKEND: this.http.patch(`${BASE_URL}/luces/${updated.id}`, updated).subscribe();
  }

  // ─────────────────────────────────────────
  //  PATCH /api/control/tvs/:id
  // ─────────────────────────────────────────
  toggleTv(id: number): void {
    this.tvs.update(list =>
      list.map(t => t.id === id ? { ...t, encendido: !t.encendido } : t)
    );
    // BACKEND: this.http.patch(`${BASE_URL}/tvs/${id}/toggle`, {}).subscribe();
  }

  updateTv(updated: Tv): void {
    this.tvs.update(list => list.map(t => t.id === updated.id ? updated : t));
    // BACKEND: this.http.patch(`${BASE_URL}/tvs/${updated.id}`, updated).subscribe();
  }

  // ─────────────────────────────────────────
  //  PATCH /api/control/acs/:id
  // ─────────────────────────────────────────
  toggleAc(id: number): void {
    this.acs.update(list =>
      list.map(a => a.id === id ? { ...a, encendido: !a.encendido } : a)
    );
    // BACKEND: this.http.patch(`${BASE_URL}/acs/${id}/toggle`, {}).subscribe();
  }

  updateAc(updated: Ac): void {
    this.acs.update(list => list.map(a => a.id === updated.id ? updated : a));
    // BACKEND: this.http.patch(`${BASE_URL}/acs/${updated.id}`, updated).subscribe();
  }
}