import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // <-- Importante para el método del Dashboard

import { Dispositivo } from './dispositivos.model';

import { APP_CONFIG } from '../core/config/app-config';
import { ENDPOINTS } from '../core/config/endpoints';
import { AudioService } from '../services/audio.service';
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
  private audioService = inject(AudioService);

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

  public multisocketContactStates = signal<Record<number, boolean[]>>({});

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

    const headers = this.getHeaders().set('X-Skip-Loader', 'true');

    this.http.get<any>(this.apiUrl, { headers })
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
    if (device) {
      // Normalizar estado_encendido desde accion_nombre si el booleano no está definido
      const normalized: Dispositivo = {
        ...device,
        estado_encendido: device.estado_encendido !== undefined && device.estado_encendido !== null
          ? device.estado_encendido
          : (device.accion_nombre?.toLowerCase() === 'encendido')
      };
      this.selectedDevice.set(normalized);
    } else {
      this.selectedDevice.set(null);
    }

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
    // 1. Polling de estado de conexión (En línea / Desconectado)
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

    // 2. Polling silencioso de estados de dispositivos (Móvil → Web)
    this.http.get<any>(this.apiUrl, { headers: this.getHeaders().set('X-Skip-Loader', 'true') })
      .subscribe({
        next: (response: any) => {
          const data = response?.data || response;
          if (Array.isArray(data)) {
            // Actualizamos la señal con los nuevos datos pero conservando la referencia
            this.devices.update(list => {
              return list.map(existing => {
                const fresh = data.find((d: any) => d.sk_aparato_id === existing.sk_aparato_id);
                if (!fresh) return existing;
                const newAccion = fresh.accion_nombre ?? existing.accion_nombre;
                // Normalizar estado_encendido: preferir booleano del API, sino derivar de accion_nombre
                const newEstado = fresh.estado_encendido !== undefined && fresh.estado_encendido !== null
                  ? fresh.estado_encendido
                  : (newAccion?.toLowerCase() === 'encendido');
                if (existing.accion_nombre !== newAccion || existing.estado_encendido !== newEstado) {
                  return { ...existing, accion_nombre: newAccion, estado_encendido: newEstado };
                }
                return existing;
              });
            });

            // Si el dispositivo del modal está en la lista, también actualizarlo
            const sel = this.selectedDevice();
            if (sel) {
              const freshSel = data.find((d: any) => d.sk_aparato_id === sel.sk_aparato_id);
              if (freshSel) {
                const newAccion = freshSel.accion_nombre ?? sel.accion_nombre;
                const newEstado = freshSel.estado_encendido !== undefined && freshSel.estado_encendido !== null
                  ? freshSel.estado_encendido
                  : (newAccion?.toLowerCase() === 'encendido');
                if (sel.accion_nombre !== newAccion || sel.estado_encendido !== newEstado) {
                  this.selectedDevice.update(d => d ? { ...d, accion_nombre: newAccion, estado_encendido: newEstado } : null);
                }
              }
            }

            // Actualizamos los estados de contacto de los MultiSocket
            data.forEach(d => {
              const tipo = (d.tipo_aparato || '').toLowerCase();
              if (tipo.includes('multisocket') || tipo.includes('multi socket') || tipo.includes('socket')) {
                this.loadMultisocketStateById(d.sk_aparato_id);
              }
            });
          }
        },
        error: (err) => console.error('Error en polling silencioso de dispositivos:', err)
      });
  }

  cerrarDetalle() {
    this.verDetalle(null);
  }

  /**
   * Carga los estados individuales de un MultiSocket desde /ws/state/{id}
   * y los guarda en multisocketContactStates.
   */
  loadMultisocketStateById(id: number): void {
    const url = `${APP_CONFIG.apiBaseUrl}/ws/state/${id}`;
    const headers = this.getHeaders().set('X-Skip-Loader', 'true');

    this.http.get<any>(url, { headers }).subscribe({
      next: (res) => {
        const states = [
          res.estado_encendido   ?? false,
          res.estado_encendido_2 ?? false,
          res.estado_encendido_3 ?? false,
          res.estado_encendido_4 ?? false,
        ];
        this.multisocketContactStates.update(map => ({ ...map, [id]: states }));
      },
      error: () => {
        // Si falla, inicializamos todos en false
        this.multisocketContactStates.update(map => ({ ...map, [id]: [false, false, false, false] }));
      }
    });
  }

  /** Retorna true si el contacto N (1-4) del MultiSocket está encendido */
  getContactoEstado(deviceId: number, contacto: 1 | 2 | 3 | 4): boolean {
    const states = this.multisocketContactStates()[deviceId];
    return states ? (states[contacto - 1] ?? false) : false;
  }

  /** Retorna cuántos contactos del MultiSocket están activos */
  getActiveContactCount(deviceId: number): number {
    const states = this.multisocketContactStates()[deviceId];
    return states ? states.filter(Boolean).length : 0;
  }

  /** Envía el comando de toggle para un contacto específico (1-4) del MultiSocket */
  toggleContacto(device: Dispositivo, contacto: 1 | 2 | 3 | 4): void {
    const estadoActual = this.getContactoEstado(device.sk_aparato_id, contacto);
    const nuevoEstado = !estadoActual;
    const url = `${APP_CONFIG.apiBaseUrl}/ws/toggle/${device.sk_aparato_id}/contacto/${contacto}?estado=${nuevoEstado}`;

    this.http.post(url, {}, { headers: this.getHeaders().set('X-Skip-Loader', 'true') }).subscribe({
      next: () => {
        // Actualizar la señal de contactos
        this.multisocketContactStates.update(map => {
          const current = map[device.sk_aparato_id] ?? [false, false, false, false];
          const updated = [...current];
          updated[contacto - 1] = nuevoEstado;
          // Actualizar accion_nombre según si algún contacto está activo
          const anyOn = updated.some(Boolean);
          this.devices.update(list =>
            list.map(d => d.sk_aparato_id === device.sk_aparato_id
              ? { ...d, accion_nombre: anyOn ? 'Encendido' : 'Apagado' }
              : d
            )
          );
          if (this.selectedDevice()?.sk_aparato_id === device.sk_aparato_id) {
            this.selectedDevice.update(d => d ? { ...d, accion_nombre: anyOn ? 'Encendido' : 'Apagado' } : null);
          }
          return { ...map, [device.sk_aparato_id]: updated };
        });
        this.audioService.play('interruptor', 50);
      },
      error: (err) => console.error(`Error toggling contacto ${contacto}:`, err)
    });
  }

  toggleDevice(device: Dispositivo): void {
    // Si estado_encendido no existe, asumimos falso por seguridad
    const isEncendido = device.estado_encendido === true;
    const nuevoEstadoBool = !isEncendido;
    
    const url = `${APP_CONFIG.apiBaseUrl}/ws/toggle/${device.sk_aparato_id}?estado=${nuevoEstadoBool}`;

    this.http.post(url, {}, { headers: this.getHeaders().set('X-Skip-Loader', 'true') }).subscribe({
      next: () => {
        const nuevoAccionNombre = nuevoEstadoBool ? 'Encendido' : 'Apagado';

        // 1. Actualizamos la lista principal (Tabla)
        this.devices.update(list =>
          list.map(d => d.sk_aparato_id === device.sk_aparato_id ? { ...d, estado_encendido: nuevoEstadoBool, accion_nombre: nuevoAccionNombre } : d)
        );

        // 2. Si el dispositivo modificado es el que está abierto en el modal, también lo actualizamos (Modal)
        if (this.selectedDevice()?.sk_aparato_id === device.sk_aparato_id) {
          this.selectedDevice.update(current => current ? { ...current, estado_encendido: nuevoEstadoBool, accion_nombre: nuevoAccionNombre } : null);
        }

        this.audioService.play('interruptor', (device.volumen ?? 50));
      },
      error: (err) => {
        console.error('Error toggling device:', err);
      }
    });
  }

  updateDeviceRoom(deviceId: number, roomId: number | null): Observable<any> {
    const device = this.devices().find(d => d.sk_aparato_id === deviceId);
    const body = { ...device, sk_habitacion_id: roomId };
    const url = `${this.apiUrl}/${deviceId}`;
    return this.http.put(url, body, { headers: this.getHeaders() });
  }
}
