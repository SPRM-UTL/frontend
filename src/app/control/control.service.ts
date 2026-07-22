import { Injectable, signal, Inject, PLATFORM_ID, WritableSignal, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DispositivoControl, AparatoTipo } from './control.model';
import { APP_CONFIG } from '../core/config/app-config';
import { ENDPOINTS } from '../core/config/endpoints';
import { AudioService } from '../services/audio.service';

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

  private audioService = inject(AudioService);

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
    
    // Verificamos el estado real del socket (estado_encendido).
    // Si no está definido, usamos accion_nombre por compatibilidad hacia atrás.
    const esEncendido = d.estado_encendido === true || (d.estado_encendido == null && d.accion_nombre === 'Encendido');

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

  /**
   * Refresca el estado encendido/apagado de todos los dispositivos.
   * Preserva los estados de contacto del MultiSocket ya cargados.
   * Se llama desde el polling de 5 segundos para sincronizar cambios del móvil a web.
   */
  refreshAllDeviceStates(): void {
    const urlDispositivos = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.dispositivos}`;
    const headers = this.getHeaders().set('X-Skip-Loader', 'true');

    this.http.get<ApiResponse>(urlDispositivos, { headers }).subscribe({
      next: response => {
        const data = response?.data || response;
        if (!Array.isArray(data)) return;

        this.todosLosDispositivos.update(list =>
          list.map(existing => {
            const fresh = data.find((d: any) =>
              (d.sk_aparato_id || d.id) === existing.id
            );
            if (!fresh) return existing;

            const nuevoEncendido =
              fresh.accion_nombre === 'Encendido' || fresh.encendido === true;

            if (existing.encendido === nuevoEncendido) return existing;
            return { ...existing, encendido: nuevoEncendido };
          })
        );
      },
      error: err => console.error('Error refreshing device states:', err)
    });
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

    // Momento en que inicia la carga
    const startTime = Date.now();
    // Cargar dispositivos
    this.http.get<ApiResponse>(urlDispositivos, { headers: this.getHeaders() }).subscribe({
      next: response => {
        const data = response?.data || response;

        // Tiempo que tardó la petición
        const elapsed = Date.now() - startTime;

        // Queremos que el skeleton dure al menos 2 segundos
        const remaining = Math.max(0, 2000 - elapsed);

        setTimeout(() => {
          if (Array.isArray(data)) {
            this.todosLosDispositivos.set(data.map(d => this.mapDevice(d)));
          }
          this.loading.set(false);
        }, remaining);
        
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
    const url = `${APP_CONFIG.apiBaseUrl}/ws/toggle/${device.id}?estado=${nuevoEstado}`;

    const headers = this.getHeaders().set('X-Skip-Loader', 'true');

    this.http.post(url, {}, { headers }).subscribe({
      next: () => {
        this.todosLosDispositivos.update(list =>
          list.map(d => d.id === id ? { ...d, encendido: nuevoEstado } : d)
        );
        this.audioService.play('interruptor', device.volumen ?? 50);
      },
      error: err => {
        console.error('Error toggling device:', err);
      }
    });
  }

  updateDevice(device: DispositivoControl): void {
    const body = this.mapToBackend(device);
    const url = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.dispositivos}/${device.id}`;

    const headers = this.getHeaders().set('X-Skip-Loader', 'true');

    this.http.put(url, body, { headers }).subscribe({
      next: () => {
        this.todosLosDispositivos.update(list =>
          list.map(d => d.id === device.id ? { ...device } : d)
        );
      },
      error: err => {
        console.error('Error updating device:', err);
      }
    });
  }

  playVolumeSound(volumen: number): void {
    this.audioService.play('volumen', volumen);
  }

  /**
   * Carga el estado real de los 4 contactos del MultiSocket desde el backend.
   * Se llama al mostrar la tarjeta de un dispositivo de tipo MultiSocket.
   */
  loadMultisocketState(device: DispositivoControl): void {
    const url = `${APP_CONFIG.apiBaseUrl}/ws/state/${device.id}`;
    const headers = this.getHeaders().set('X-Skip-Loader', 'true');

    this.http.get<any>(url, { headers }).subscribe({
      next: (res) => {
        this.todosLosDispositivos.update(list =>
          list.map(d => {
            if (d.id !== device.id) return d;
            return {
              ...d,
              estado_contacto_1: res.estado_encendido   ?? false,
              estado_contacto_2: res.estado_encendido_2 ?? false,
              estado_contacto_3: res.estado_encendido_3 ?? false,
              estado_contacto_4: res.estado_encendido_4 ?? false,
            };
          })
        );
      },
      error: (err) => console.error('Error cargando estado MultiSocket:', err)
    });
  }

  /**
   * Enciende o apaga un contacto específico (1–4) de un MultiSocket.
   * Llama a POST /ws/toggle/{id}/contacto/{contacto}?estado={bool}
   */
  toggleContacto(device: DispositivoControl, contacto: 1 | 2 | 3 | 4, nuevoEstado: boolean): void {
    const url = `${APP_CONFIG.apiBaseUrl}/ws/toggle/${device.id}/contacto/${contacto}?estado=${nuevoEstado}`;
    const headers = this.getHeaders().set('X-Skip-Loader', 'true');

    this.http.post(url, {}, { headers }).subscribe({
      next: () => {
        this.todosLosDispositivos.update(list =>
          list.map(d => {
            if (d.id !== device.id) return d;
            const patch: Partial<DispositivoControl> = {};
            if (contacto === 1) patch.estado_contacto_1 = nuevoEstado;
            if (contacto === 2) patch.estado_contacto_2 = nuevoEstado;
            if (contacto === 3) patch.estado_contacto_3 = nuevoEstado;
            if (contacto === 4) patch.estado_contacto_4 = nuevoEstado;
            // encendido refleja si AL MENOS un contacto está activo
            const merged = { ...d, ...patch };
            merged.encendido =
              (merged.estado_contacto_1 || false) ||
              (merged.estado_contacto_2 || false) ||
              (merged.estado_contacto_3 || false) ||
              (merged.estado_contacto_4 || false);
            return merged;
          })
        );
        this.audioService.play('interruptor', device.volumen ?? 50);
      },
      error: (err) => console.error(`Error toggling contacto ${contacto}:`, err)
    });
  }
}
