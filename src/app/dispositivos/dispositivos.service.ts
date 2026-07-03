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
  public selectedDevice = signal<Dispositivo | null>(null);
  public device = signal<Dispositivo | null>(null);

  // Lista de MACs (deviceKey) conectadas globalmente
  public connectedDevices = signal<string[]>([]);
  private globalPollingInterval: any;

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

  public selectedDeviceOnline = signal<boolean>(false);
  private pollingInterval: any;

  verDetalle(device: Dispositivo | null) {
    this.selectedDevice.set(device);

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    if (device && device.mac_bluetooth) {
      this.checkWsStatus(device.mac_bluetooth);
      if (isPlatformBrowser(this.platformId)) {
        this.pollingInterval = setInterval(() => {
          this.checkWsStatus(device.mac_bluetooth!);
        }, 3000);
      }
    } else {
      this.selectedDeviceOnline.set(false);
    }
  }

  private checkWsStatus(mac: string) {
    this.http.get<any>(`${APP_CONFIG.apiBaseUrl}/ws/status/${mac}`, {
      headers: new HttpHeaders({ 'X-Skip-Loader': 'true' })
    }).subscribe({
      next: (res) => {
        this.selectedDeviceOnline.set(res.connected === true);
      },
      error: () => {
        this.selectedDeviceOnline.set(false);
      }
    });
  }

  // --- Funciones para el listado global ---
  public startGlobalPolling() {
    this.fetchGlobalStatus();
    if (isPlatformBrowser(this.platformId) && !this.globalPollingInterval) {
      this.globalPollingInterval = setInterval(() => {
        this.fetchGlobalStatus();
      }, 5000);
    }
  }

  public stopGlobalPolling() {
    if (this.globalPollingInterval) {
      clearInterval(this.globalPollingInterval);
      this.globalPollingInterval = null;
    }
  }

  private fetchGlobalStatus() {
    this.http.get<any>(`${APP_CONFIG.apiBaseUrl}/ws/status/all`, {
      headers: new HttpHeaders({ 'X-Skip-Loader': 'true' })
    }).subscribe({
      next: (res) => {
        this.connectedDevices.set(res.connectedDevices || []);
      },
      error: () => {
        this.connectedDevices.set([]);
      }
    });
  }

  cerrarDetalle() {
    this.verDetalle(null);
  }

  toggleDevice(device: Dispositivo): void {
    const nuevoEstado = device.accion_nombre === 'Encendido' ? 'Apagado' : 'Encendido';
    const body = {
      ...device,
      accion_nombre: nuevoEstado
    };
    const url = `${this.apiUrl}/${device.sk_aparato_id}`;

    this.http.put(url, body, { headers: this.getHeaders().set('X-Skip-Loader', 'true') }).subscribe({
      next: () => {
        // 1. Actualizamos la lista principal (Tabla)
        this.devices.update(list =>
          list.map(d => d.sk_aparato_id === device.sk_aparato_id ? { ...d, accion_nombre: nuevoEstado } : d)
        );
        
        // 2. Si el dispositivo modificado es el que está abierto en el modal, también lo actualizamos (Modal)
        if (this.selectedDevice()?.sk_aparato_id === device.sk_aparato_id) {
          this.selectedDevice.update(current => current ? { ...current, accion_nombre: nuevoEstado } : null);
        }
      },
      error: (err) => {
        console.error('Error toggling device:', err);
      }
    });
  }
}
