import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // <-- Importante para el método del Dashboard

import { Dispositivo } from './dispositivos.model';

import { APP_CONFIG } from '../core/config/app-config';
import { ENDPOINTS } from '../core/config/endpoints';
interface ApiResponse {
  success: boolean;
  status: number;
  data: Dispositivo[];
}

@Injectable({
  providedIn: 'root'
})
export class DispositivosService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  //private readonly apiUrl = 'http://localhost:5295/api/aparatos';
  private readonly apiUrl = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.dispositivos}`;
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public devices = signal<Dispositivo[]>([]);
  public device = signal< |null>(null);

  /**
   * Obtiene los headers con el token de localStorage de forma segura para SSR
   */
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

  /**
   * Carga los dispositivos mediante suscripción interna directa (Void) - Para tu vista
   */
  loadDevices(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<any>(this.apiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (response: any) => {
          console.log('Respuesta cruda del servidor:', response);

          const data = response?.data || response;
          this.devices.set(Array.isArray(data) ? data : []);

          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error en loadDevices:', err);
          this.error.set('No se pudieron cargar los dispositivos.');
          this.loading.set(false);
        }
      });
  }

    /**
   * Obtiene los dispositivo por identificador
   */
  getDeviceById(id: number): void{
    this.loading.set(true);
    this.error.set(null);
    this.http
      .get<any>(`${this.apiUrl}/${id}`, {
        headers: this.getHeaders()
      })
      .subscribe({
        next: (response) => {
          const device = response?.data ?? response;
          this.device.set(device);
          this.loading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.error.set('No se pudo cargar el dispositivo');

          this.loading.set(false);
        }
      })
    }

  getDevicesObservable(): Observable<Dispositivo[]> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map((response: any) => {
        const data = response?.data || response;
        const arrayData = Array.isArray(data) ? data : [];
        this.devices.set(arrayData);
        return arrayData;
      })
    );
  }


}
