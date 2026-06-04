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

  loadGestos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<Gesto[]>(BASE_URL).subscribe({
      next:  gestos => { this._gestos.set(gestos); this.loading.set(false); },
      error: err    => { this.error.set('No se pudieron cargar los gestos.'); this.loading.set(false); console.error(err); }
    });
  }

  toggleEstado(gesto: Gesto): void {
    const nuevoTipo = gesto.tipoDisparadorNombre === 'Activo' ? 'Pausado' : 'Activo';
    const update: GestoEstadoUpdate = { skGestoId: gesto.skGestoId, tipoDisparadorNombre: nuevoTipo };

    this.http.patch<Gesto>(`${BASE_URL}/${gesto.skGestoId}/estado`, update).subscribe({
      next: updated => {
        this._gestos.update(list =>
          list.map(g => g.skGestoId === updated.skGestoId ? updated : g)
        );
      },
      error: err => { this.error.set(`No se pudo cambiar el estado de "${gesto.nombreGesto}".`); console.error(err); }
    });
  }

  eliminarGesto(id: number): void {
    this.http.delete<void>(`${BASE_URL}/${id}`).subscribe({
      next: () => { this._gestos.update(list => list.filter(g => g.skGestoId !== id)); },
      error: err => { this.error.set('No se pudo eliminar el gesto.'); console.error(err); }
    });
  }
}