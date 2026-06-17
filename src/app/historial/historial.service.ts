import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Actividad } from '../historial/actividad.model';

interface ApiResponse {
  success: boolean;
  status: number;
  data: Actividad[];
}

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private http = inject(HttpClient);

  // URL directa de producción en Render
  private readonly apiUrl = 'https://backend-neao.onrender.com/api/Fact_Historico_Actividad';

  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public actividades = signal<Actividad[]>([]);

  /**
   * Obtiene los headers con el token de localStorage de forma segura para SSR
   */
  private getHeaders(): HttpHeaders {
    let token = '';
    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('token') ?? '';
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Carga el historial mediante suscripción interna directa (Void) - Para tu componente
   */
  loadHistorial(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<ApiResponse>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        map(response => response?.data || response)
      )
      .subscribe({
        next: (data: any) => {
          this.actividades.set(Array.isArray(data) ? data : []);
          this.loading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.error.set('No se pudo cargar el historial.');
          this.loading.set(false);
        }
      });
  }

  /**
   * Método especial para forkJoin en el Inicio Dashboard (Regresa Observable)
   */
  getHistorialObservable(): Observable<Actividad[]> {
    return this.http.get<ApiResponse>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(response => {
        const data = response?.data || response;
        const arrayData = Array.isArray(data) ? data : [];
        this.actividades.set(arrayData); // Sincroniza la señal por si acaso
        return arrayData;
      })
    );
  }
}