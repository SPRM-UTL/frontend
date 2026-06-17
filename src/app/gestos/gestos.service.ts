import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { Gesto } from './gesto.model';
import { APP_CONFIG } from '../core/config/app-config'; 
import { ENDPOINTS } from '../core/config/endpoints';

interface ApiResponse {
  success: boolean;
  status: number;
  data: Gesto[];
}

@Injectable({
  providedIn: 'root'
})
export class GestosService {
  private http = inject(HttpClient);

  //private readonly apiUrl = 'http://localhost:5295/api/gestos';
  private readonly apiUrl = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.gestos}`;

  readonly gestos = signal<Gesto[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /**
   * Obtiene los headers con el token de localStorage de forma segura para SSR
   */
  private getHeaders(token?: string): HttpHeaders {
    let authToken = token ?? '';
    
    if (!authToken && typeof window !== 'undefined' && window.localStorage) {
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

    return this.http.get<ApiResponse>(this.apiUrl, { headers: this.getHeaders(token) }).pipe(
      map(response => {
        if (Array.isArray(response)) return response;
        return response?.data ?? [];
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
}