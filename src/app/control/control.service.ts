import { Injectable, signal, Inject, PLATFORM_ID, WritableSignal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DispositivoControl, AparatoTipo } from './control.model';
import { APP_CONFIG } from '../core/config/app-config';
import { ENDPOINTS } from '../core/config/endpoints';

export interface ApiResponse {
  success: boolean;
  status: number;
  data: any;
}

@Injectable({ providedIn: 'root' })
export class ControlService {

  readonly tiposDispositivos = signal<AparatoTipo[]>([]);
  readonly todosLosDispositivos = signal<DispositivoControl[]>([]);

  readonly loading = signal<boolean>(false);
  readonly error   = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }

  private mapDevice(d: any): DispositivoControl {
    const id = d.sk_aparato_id || d.id;
    const tipo = (d.tipo_aparato || '').toLowerCase();
    const esEncendido = d.accion_nombre === 'Encendido' || d.encendido === true;

    const base: DispositivoControl = {
      id: id,
      sk_aparato_id: id,
      nombre_aparato: d.nombre_aparato || d.nombre || 'Dispositivo',
      tipo_aparato: d.tipo_aparato,
      icono: d.icono || 'ic_default',
      encendido: esEncendido,
      ubicacion: d.ubicacion || 'Sin ubicación',
      mac_bluetooth: d.mac_bluetooth,
      nombre_bluetooth: d.nombre_bluetooth,
      comando_bluetooth: d.comando_bluetooth
    };

    if (tipo.includes('bocin') || tipo.includes('audio') || tipo.includes('audífon')) {
      base.volumen = d.volumen !== undefined ? d.volumen : 50;
      base.reproduciendo = d.reproduciendo || 'Silencio';
    } else if (tipo.includes('luz') || tipo.includes('foco') || tipo.includes('ilumin')) {
      base.brillo = d.brillo !== undefined ? d.brillo : 100;
      base.tono = d.tono || 'warm';
    } else if (tipo.includes('vent')) {
      base.velocidad = d.velocidad !== undefined ? d.velocidad : 1;
    }

    return base;
  }

  private mapToBackend(d: DispositivoControl, nuevoEstado?: boolean): any {
    const encendido = nuevoEstado !== undefined ? nuevoEstado : d.encendido;

    const body: any = {
      sk_aparato_id: d.id,
      nombre_aparato: d.nombre_aparato,
      tipo_aparato: d.tipo_aparato,
      icono: d.icono,
      accion_nombre: encendido ? 'Encendido' : 'Apagado',
      mac_bluetooth: d.mac_bluetooth,
      nombre_bluetooth: d.nombre_bluetooth,
      comando_bluetooth: d.comando_bluetooth
    };

    if (d.volumen !== undefined) body.volumen = d.volumen;
    if (d.brillo !== undefined) body.brillo = d.brillo;
    if (d.velocidad !== undefined) body.velocidad = d.velocidad;
    if (d.tono) body.tono = d.tono;

    return body;
  }

  loadControl(): void {
    this.loading.set(true);
    this.error.set(null);

    const urlTipos = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.aparatoTipos}`;
    const urlDispositivos = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.dispositivos}`;

    // Cargar tipos de dispositivos
    this.http.get<ApiResponse>(urlTipos, { headers: this.getHeaders() }).subscribe({
      next: response => {
        const data = response?.data || response;
        if (Array.isArray(data)) {
          this.tiposDispositivos.set(data);
        }
      },
      error: err => console.error('Error loading types:', err)
    });

    // Cargar dispositivos
    this.http.get<ApiResponse>(urlDispositivos, { headers: this.getHeaders() }).subscribe({
      next: response => {
        const data = response?.data || response;
        if (Array.isArray(data)) {
          this.todosLosDispositivos.set(data.map(d => this.mapDevice(d)));
        }
        this.loading.set(false);
      },
      error: err => {
        console.error('Error loading devices:', err);
        this.error.set('No se pudo conectar con el servidor.');
        this.loading.set(false);
      }
    });
  }

  toggleDevice(id: number): void {
    const device = this.todosLosDispositivos().find(d => d.id === id);
    if (!device) return;

    const nuevoEstado = !device.encendido;
    const body = this.mapToBackend(device, nuevoEstado);
    const url = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.dispositivos}/${device.id}`;

    this.http.put(url, body, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.todosLosDispositivos.update(list =>
          list.map(d => d.id === id ? { ...d, encendido: nuevoEstado } : d)
        );
      },
      error: err => {
        console.error('Error toggling device:', err);
        this.error.set(`Error al cambiar estado del dispositivo`);
      }
    });
  }

  updateDevice(device: DispositivoControl): void {
    const body = this.mapToBackend(device);
    const url = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.dispositivos}/${device.id}`;

    this.http.put(url, body, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.todosLosDispositivos.update(list =>
          list.map(d => d.id === device.id ? { ...device } : d)
        );
      },
      error: err => {
        console.error('Error updating device:', err);
        this.error.set(`Error al actualizar el dispositivo`);
      }
    });
  }
}
