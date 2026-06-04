import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HistoricoActividad } from './control.model';

const BASE_URL = '/api/historico';

@Injectable({ providedIn: 'root' })
export class ControlService {

  readonly actividades = signal<HistoricoActividad[]>([]);
  readonly loading     = signal<boolean>(false);
  readonly error       = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  loadActividades(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<HistoricoActividad[]>(BASE_URL).subscribe({
      next: data => { this.actividades.set(data); this.loading.set(false); },
      error: err => { this.error.set('No se pudo cargar el historial.'); this.loading.set(false); console.error(err); }
    });
  }
}