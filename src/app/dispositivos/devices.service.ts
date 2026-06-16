import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map,Observable } from 'rxjs';

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
    'http://localhost:5295/api/aparatos';

  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public devices = signal<Device[]>([]);

// Si tu API devuelve { "data": [...] }
loadDevices(): void {
  this.loading.set(true);
  this.http.get<any>(this.apiUrl) // Usa 'any' para inspeccionar
    .subscribe({
      next: (response: any) => {
        // Si la respuesta es un objeto, accede a la propiedad que contiene el array
        // Cambia 'data' por el nombre de la propiedad real que veas en la consola
        console.log('Respuesta cruda del servidor:', response);
        this.devices.set(response.data || response); 
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudieron cargar los dispositivos.');
        this.loading.set(false);
      }
    });
}
/**
 * Registrar dispositivo
 */
createDevice(device: any): Observable<any> {

  return this.http.post(
    this.apiUrl,
    device
  );

}
}

