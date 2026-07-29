import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { APP_CONFIG } from '../core/config/app-config';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CamaraService {
  private http = inject(HttpClient);

  getConfiguracionRed(aparatoId: number): Observable<any> {
    const token = localStorage.getItem('token') ?? '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`${APP_CONFIG.apiBaseUrl}/api/aparatos/${aparatoId}/configuracion-red`, { headers });
  }

  sendLedCommand(deviceKey: string, on: boolean): void {
    const comando = on ? 'LED_ON' : 'LED_OFF';
    const url = `${APP_CONFIG.apiBaseUrl}/ws/accion?comando=${comando}&deviceKey=${encodeURIComponent(deviceKey)}`;
    fetch(url).catch(err => console.error('Error enviando comando LED:', err));
  }
}
