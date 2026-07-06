import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Habitacion } from './habitaciones.model';
import { APP_CONFIG } from '../core/config/app-config';
import { ENDPOINTS } from '../core/config/endpoints';

interface ApiResponse<T> {
  success: boolean;
  status: number;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class HabitacionesService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  private readonly apiUrl = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.habitaciones}`;

  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public habitaciones = signal<Habitacion[]>([]);

  private getHeaders(): HttpHeaders {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token') ?? '';
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadHabitacionesByCasa(casaId: number): void {
    this.loading.set(true);
    this.error.set(null);

    const headers = this.getHeaders().set('X-Skip-Loader', 'true');

    this.http.get<ApiResponse<Habitacion[]>>(`${this.apiUrl}/Casa/${casaId}`, { headers })
      .subscribe({
        next: (response) => {
          this.habitaciones.set(response.data || []);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error en loadHabitacionesByCasa:', err);
          this.error.set('No se pudieron cargar las habitaciones.');
          this.loading.set(false);
        }
      });
  }

  createHabitacion(habitacion: Partial<Habitacion>): Observable<Habitacion> {
    return this.http.post<ApiResponse<Habitacion>>(this.apiUrl, habitacion, { headers: this.getHeaders() }).pipe(
      map(res => res.data),
      tap(() => {
        if (habitacion.sk_casa_id) {
          this.loadHabitacionesByCasa(habitacion.sk_casa_id);
        }
      })
    );
  }

  updateHabitacion(id: number, habitacion: Partial<Habitacion>): Observable<Habitacion> {
    return this.http.put<ApiResponse<Habitacion>>(`${this.apiUrl}/${id}`, habitacion, { headers: this.getHeaders() }).pipe(
      map(res => res.data),
      tap(() => {
        if (habitacion.sk_casa_id) {
          this.loadHabitacionesByCasa(habitacion.sk_casa_id);
        }
      })
    );
  }

  deleteHabitacion(id: number, casaId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap(() => this.loadHabitacionesByCasa(casaId))
    );
  }
}
