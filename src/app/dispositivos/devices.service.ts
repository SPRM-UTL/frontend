// ─────────────────────────────────────────────
//  devices.service.ts
//  Servicio centralizado para la gestión de dispositivos.
//
//  TODO (backend):
//    1. Inyectar HttpClient y reemplazar cada método
//       "MOCK" con la llamada HTTP correspondiente.
//    2. Actualizar BASE_URL con la URL real del API.
//    3. Si el backend usa WebSockets/SSE para estado
//       en tiempo real, suscribirse aquí y emitir
//       a través de devicesUpdated$.
// ─────────────────────────────────────────────

import { Injectable, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
// import { HttpClient } from '@angular/common/http';  // ← descomentar cuando haya backend
import { Device, DevicePowerUpdate } from './device.model';

// ── Ajustar cuando el backend esté listo ──────
const BASE_URL = '/api/devices';

// ── Mock data (eliminar cuando el backend devuelva datos reales) ──
const MOCK_DEVICES: Device[] = [
  {
    id: 1, name: 'Living Room Lights', room: 'Living Room',
    status: 'On', statusClass: 'status-on', power: '48W',
    lastActive: '2 min ago', color: '#f59e0b', icon: 'light', powered: true
  },
  {
    id: 2, name: 'Living Room AC', room: 'Living Room',
    status: 'Cooling', statusClass: 'status-cooling', power: '850W',
    lastActive: '5 min ago', color: '#3b82f6', icon: 'ac', powered: true
  },
  {
    id: 3, name: 'Smart TV', room: 'Living Room',
    status: 'Playing', statusClass: 'status-playing', power: '125W',
    lastActive: '1 min ago', color: '#8b5cf6', icon: 'tv', powered: true
  },
  {
    id: 4, name: 'Smart Speaker', room: 'Kitchen',
    status: 'Idle', statusClass: 'status-idle', power: '3W',
    lastActive: '10 min ago', color: '#10b981', icon: 'speaker', powered: true
  },
  {
    id: 5, name: 'Security Camera', room: 'Front Door',
    status: 'Recording', statusClass: 'status-recording', power: '12W',
    lastActive: '1 min ago', color: '#ef4444', icon: 'camera', powered: true
  },
  {
    id: 6, name: 'Smart Lock', room: 'Main Door',
    status: 'Locked', statusClass: 'status-locked', power: '2W',
    lastActive: '2h ago', color: '#f59e0b', icon: 'lock', powered: true
  },
  {
    id: 7, name: 'Ceiling Fan', room: 'Bedroom',
    status: 'Off', statusClass: 'status-off', power: '0W',
    lastActive: '5h ago', color: '#6b7280', icon: 'fan', powered: false
  },
  {
    id: 8, name: 'WiFi Router', room: 'Office',
    status: 'Connected', statusClass: 'status-connected', power: '15W',
    lastActive: '1 min ago', color: '#2bbfaa', icon: 'wifi', powered: true
  }
];

@Injectable({ providedIn: 'root' })
export class DevicesService {

  // ── Signal interno: fuente de verdad de los dispositivos ──
  private _devices = signal<Device[]>([]);
  readonly devices = this._devices.asReadonly();

  // ── Estado de carga/error para que el componente pueda mostrarlo ──
  readonly loading = signal<boolean>(false);
  readonly error   = signal<string | null>(null);

  // constructor(private http: HttpClient) {}  // ← descomentar cuando haya backend

  // ─────────────────────────────────────────
  //  GET /api/devices
  //  Carga todos los dispositivos del usuario.
  // ─────────────────────────────────────────
  loadDevices(): void {
    this.loading.set(true);
    this.error.set(null);

    this.getDevices$().subscribe({
      next:  devices => { this._devices.set(devices); this.loading.set(false); },
      error: err     => { this.error.set('No se pudieron cargar los dispositivos.'); this.loading.set(false); console.error(err); }
    });
  }

  private getDevices$(): Observable<Device[]> {
    // ── MOCK ──────────────────────────────────────────────────
    return of([...MOCK_DEVICES]);

    // ── BACKEND (descomentar) ─────────────────────────────────
    // return this.http.get<Device[]>(BASE_URL);
  }

  // ─────────────────────────────────────────
  //  PATCH /api/devices/:id/power
  //  Activa o desactiva un dispositivo.
  // ─────────────────────────────────────────
  togglePower(device: Device): void {
    const update: DevicePowerUpdate = { id: device.id, powered: !device.powered };

    this.patchPower$(update).subscribe({
      next: updated => {
        this._devices.update(list =>
          list.map(d => d.id === updated.id ? updated : d)
        );
      },
      error: err => {
        this.error.set(`No se pudo cambiar el estado de "${device.name}".`);
        console.error(err);
      }
    });
  }

  private patchPower$(update: DevicePowerUpdate): Observable<Device> {
    // ── MOCK ──────────────────────────────────────────────────
    const current = this._devices().find(d => d.id === update.id)!;
    const next: Device = {
      ...current,
      powered:    update.powered,
      status:     update.powered ? 'On'  : 'Off',
      statusClass: update.powered ? 'status-on' : 'status-off',
      lastActive: update.powered ? 'just now' : current.lastActive
    };
    return of(next);

    // ── BACKEND (descomentar) ─────────────────────────────────
    // return this.http.patch<Device>(`${BASE_URL}/${update.id}/power`, update);
  }
}