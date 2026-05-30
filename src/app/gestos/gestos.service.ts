// gestos.service.ts

import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Gesto, GestoEstadoUpdate } from './gesto.model';

const BASE_URL = '/api/gestos';

@Injectable({ providedIn: 'root' })
export class GestosService {

  private _gestos = signal<Gesto[]>([]);
  readonly gestos  = this._gestos.asReadonly();

  readonly loading = signal<boolean>(false);
  readonly error   = signal<string | null>(null);

  constructor(private http: HttpClient) {}

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
    return this.http.get<Gesto[]>(BASE_URL);
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
    return this.http.patch<Gesto>(`${BASE_URL}/${update.id}/estado`, update);
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
    return this.http.delete<void>(`${BASE_URL}/${id}`);
  }
}