import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  loadGestos(): void {

    this.loading.set(true);

    this.http.get<ApiResponse>(this.apiUrl)
      .subscribe({
        next: response => {

          console.log(response);

          this.gestos.set(response.data);

          this.loading.set(false);
          console.log(response.data);
        },
        error: err => {
          
          console.error(err);

          this.error.set('Error al cargar gestos');

          this.loading.set(false);
        }
      });
  }
}