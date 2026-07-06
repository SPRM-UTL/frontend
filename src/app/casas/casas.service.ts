import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Casa } from './casas.model';
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
export class CasasService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  private readonly apiUrl = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.casas}`;

  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public casas = signal<Casa[]>([]);

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

  loadCasas(): void {
    this.loading.set(true);
    this.error.set(null);

    const headers = this.getHeaders().set('X-Skip-Loader', 'true');

    this.http.get<ApiResponse<Casa[]>>(this.apiUrl, { headers })
      .subscribe({
        next: (response) => {
          this.casas.set(response.data || []);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error en loadCasas:', err);
          this.error.set('No se pudieron cargar las casas.');
          this.loading.set(false);
        }
      });
  }

  createCasa(casa: Partial<Casa>): Observable<Casa> {
    return this.http.post<ApiResponse<Casa>>(this.apiUrl, casa, { headers: this.getHeaders() }).pipe(
      map(res => res.data),
      tap(() => this.loadCasas())
    );
  }

  updateCasa(id: number, casa: Partial<Casa>): Observable<Casa> {
    return this.http.put<ApiResponse<Casa>>(`${this.apiUrl}/${id}`, casa, { headers: this.getHeaders() }).pipe(
      map(res => res.data),
      tap(() => this.loadCasas())
    );
  }

  deleteCasa(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap(() => this.loadCasas())
    );
  }
}
