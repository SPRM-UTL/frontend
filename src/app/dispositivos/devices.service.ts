import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // <-- Importante para el método del Dashboard

import { Device } from './device.model';

@Injectable({
  providedIn: 'root'
})
export class DevicesService {
  private http = inject(HttpClient);

  // URL de producción en Render
  private readonly apiUrl = 'https://backend-neao.onrender.com/api/aparatos';

  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public devices = signal<Device[]>([]);

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
   * Método especial para forkJoin en el Inicio Dashboard (Devuelve Observable)
   */
  getDevicesObservable(): Observable<Device[]> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map((response: any) => {
        const data = response?.data || response;
        const arrayData = Array.isArray(data) ? data : [];
        this.devices.set(arrayData); // Sincroniza la señal local de paso
        return arrayData;
      })
    );
  }

  /**
   * Registrar dispositivo
   */
  createDevice(device: any): Observable<any> {
    return this.http.post(this.apiUrl, device, { headers: this.getHeaders() });
  }
}