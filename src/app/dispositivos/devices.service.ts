import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Device } from './device.model';

interface ApiResponse {
  success: boolean;
  status: number;
  data: Device[];
}

@Injectable({
  providedIn: 'root'
})
export class DevicesService {

  private http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:5295/api/Dim_Aparatos';
    //'https://backend-neao.onrender.com/api/Dim_Aparatos';

  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public devices = signal<Device[]>([]);

// Si tu API devuelve { "data": [...] }
loadDevices(): void {
  this.loading.set(true);
  this.http.get<ApiResponse>(this.apiUrl)
    .subscribe({
      next: (response: ApiResponse) => {
        console.log('Respuesta cruda del servidor:', response);
        this.devices.set(response.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudieron cargar los dispositivos.');
        this.loading.set(false);
      }
    });
}
}

