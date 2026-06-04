import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Device, DevicePowerUpdate } from './device.model';

const BASE_URL = '/api/aparatos';

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

    this.http.get<Device[]>(BASE_URL).subscribe({
      next:  devices => { this._devices.set(devices); this.loading.set(false); },
      error: err     => { this.error.set('No se pudieron cargar los dispositivos.'); this.loading.set(false); console.error(err); }
    });
  }

  togglePower(device: Device): void {
    const update: DevicePowerUpdate = {
      skAparatoId:      device.skAparatoId,
      comandoBluetooth: device.comandoBluetooth
    };

    this.http.patch<Device>(`${BASE_URL}/${device.skAparatoId}/power`, update).subscribe({
      next: updated => {
        this._devices.update(list =>
          list.map(d => d.skAparatoId === updated.skAparatoId ? updated : d)
        );
      },
      error: err => {
        this.error.set(`No se pudo cambiar el estado de "${device.nombreAparato}".`);
        console.error(err);
      }
    });
  }
}