// control.service.ts

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Luz, Tv, Ac, Categoria } from './control.model';

const BASE_URL = '/api/control';

@Injectable({ providedIn: 'root' })
export class ControlService {

  readonly categorias = signal<Categoria[]>([]);
  readonly luces      = signal<Luz[]>([]);
  readonly tvs        = signal<Tv[]>([]);
  readonly acs        = signal<Ac[]>([]);

  readonly loading = signal<boolean>(false);
  readonly error   = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────
  //  GET /api/control  (carga todo de una vez)
  // ─────────────────────────────────────────
  loadControl(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      categorias: this.http.get<Categoria[]>(`${BASE_URL}/categorias`),
      luces:      this.http.get<Luz[]>(`${BASE_URL}/luces`),
      tvs:        this.http.get<Tv[]>(`${BASE_URL}/tvs`),
      acs:        this.http.get<Ac[]>(`${BASE_URL}/acs`),
    }).subscribe({
      next: ({ categorias, luces, tvs, acs }) => {
        this.categorias.set(categorias);
        this.luces.set(luces);
        this.tvs.set(tvs);
        this.acs.set(acs);
        this.loading.set(false);
      },
      error: err => {
        this.error.set('No se pudo cargar el control.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  // ─────────────────────────────────────────
  //  PATCH /api/control/luces/:id
  // ─────────────────────────────────────────
  toggleLuz(id: number): void {
    this.http.patch(`${BASE_URL}/luces/${id}/toggle`, {}).subscribe({
      next: (updated: any) => this.luces.update(list => list.map(l => l.id === id ? updated : l)),
      error: err => { this.error.set('No se pudo cambiar el estado de la luz.'); console.error(err); }
    });
  }

  updateLuz(updated: Luz): void {
    this.http.patch<Luz>(`${BASE_URL}/luces/${updated.id}`, updated).subscribe({
      next: saved => this.luces.update(list => list.map(l => l.id === saved.id ? saved : l)),
      error: err => { this.error.set('No se pudo actualizar la luz.'); console.error(err); }
    });
  }

  // ─────────────────────────────────────────
  //  PATCH /api/control/tvs/:id
  // ─────────────────────────────────────────
  toggleTv(id: number): void {
    this.http.patch(`${BASE_URL}/tvs/${id}/toggle`, {}).subscribe({
      next: (updated: any) => this.tvs.update(list => list.map(t => t.id === id ? updated : t)),
      error: err => { this.error.set('No se pudo cambiar el estado del TV.'); console.error(err); }
    });
  }

  updateTv(updated: Tv): void {
    this.http.patch<Tv>(`${BASE_URL}/tvs/${updated.id}`, updated).subscribe({
      next: saved => this.tvs.update(list => list.map(t => t.id === saved.id ? saved : t)),
      error: err => { this.error.set('No se pudo actualizar el TV.'); console.error(err); }
    });
  }

  // ─────────────────────────────────────────
  //  PATCH /api/control/acs/:id
  // ─────────────────────────────────────────
  toggleAc(id: number): void {
    this.http.patch(`${BASE_URL}/acs/${id}/toggle`, {}).subscribe({
      next: (updated: any) => this.acs.update(list => list.map(a => a.id === id ? updated : a)),
      error: err => { this.error.set('No se pudo cambiar el estado del AC.'); console.error(err); }
    });
  }

  updateAc(updated: Ac): void {
    this.http.patch<Ac>(`${BASE_URL}/acs/${updated.id}`, updated).subscribe({
      next: saved => this.acs.update(list => list.map(a => a.id === saved.id ? saved : a)),
      error: err => { this.error.set('No se pudo actualizar el AC.'); console.error(err); }
    });
  }
}