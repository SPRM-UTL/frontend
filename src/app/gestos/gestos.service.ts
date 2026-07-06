import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { Gesto, GestoDetalle } from './gesto.model';
import { APP_CONFIG } from '../core/config/app-config';
import { ENDPOINTS } from '../core/config/endpoints';
import { AudioService } from '../services/audio.service';

interface ApiResponse {
  success: boolean;
  status: number;
  data: Gesto[];
}

@Injectable({
  providedIn: 'root'
})
export class GestosService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private audioService = inject(AudioService);

  //private readonly apiUrl = 'http://localhost:5295/api/gestos';
  private readonly apiUrl = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.gestos}`;

  readonly gestos = signal<Gesto[]>([]);
  readonly selectedGesto = signal<Gesto | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /**
   * Obtiene los headers con el token de localStorage de forma segura para SSR
   */
  private getHeaders(token?: string): HttpHeaders {
    let authToken = token ?? '';

    if (!authToken && isPlatformBrowser(this.platformId)) {
      authToken = localStorage.getItem('token') ?? '';
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Carga los gestos devolviendo el flujo frío ejecutable
   */
  loadGestos(token?: string): Observable<Gesto[]> {
    this.loading.set(true);
    this.error.set(null);

    const headers = this.getHeaders(token).set('X-Skip-Loader', 'true');

    return this.http.get<ApiResponse>(this.apiUrl, { headers }).pipe(
      map(response => {
        const data = response?.data ?? response;
        return Array.isArray(data) ? data : [];
      }),
      tap(data => this.gestos.set(data)),
      catchError(err => {
        console.error('Error en loadGestos:', err);
        this.error.set('Error al cargar gestos');
        return throwError(() => err);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Obtiene el detalle de un gesto específico por su ID
   */
  getGestoDetalle(id: number): Observable<GestoDetalle> {
    // Detener forzosamente cualquier sonido de carga que esté sonando
    this.audioService.stop('cargando');

    const headers = this.getHeaders().set('X-Skip-Loader', 'true');
    return this.http.get<any>(`${this.apiUrl}/${id}/detalle`, { headers }).pipe(
      map(response => response?.data ?? response),
      catchError(err => {
        console.error(`Error cargando detalle del gesto ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  cerrarDetalle() {
    this.selectedGesto.set(null);
  }
}
