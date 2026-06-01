// ─────────────────────────────────────────────
//  devices.service.ts
// ─────────────────────────────────────────────

import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Device, DevicePowerUpdate } from './device.model';

const BASE_URL = '/api/devices';

@Injectable({ providedIn: 'root' })
export class DevicesService {

  private _devices = signal<Device[]>([]);
  readonly devices = this._devices.asReadonly();

  readonly loading = signal<boolean>(false);
  readonly error   = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  loadDevices(): void {
    this.loading.set(true);
    this.error.set(null);

    this.getDevices$().subscribe({
      next:  devices => { this._devices.set(devices); this.loading.set(false); },
      error: err     => { this.error.set('No se pudieron cargar los dispositivos.'); this.loading.set(false); console.error(err); }
    });
  }

  private getDevices$(): Observable<Device[]> {
    return this.http.get<Device[]>(BASE_URL);
  }

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
    return this.http.patch<Device>(`${BASE_URL}/${update.id}/power`, update);
  }
}