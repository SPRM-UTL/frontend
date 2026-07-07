import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

import {
  AparatosConsumoHistorico,
  ApiResponseConsumo
} from './consumo.model';

import { APP_CONFIG } from '../core/config/app-config';
import { ENDPOINTS } from '../core/config/endpoints';

@Injectable({
  providedIn: 'root'
})
export class ConsumosService {

  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private readonly apiUrl =
    `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.consumo}`;

  /**
   * Obtiene los headers con el token de localStorage
   */
  private getHeaders(): HttpHeaders {

    let token = '';

    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token') ?? '';
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

  }

  /**
   * Obtiene el historial de consumos
   */
  private normalizeConsumoResponse(response: any): AparatosConsumoHistorico[] {
    const data = response?.data ?? response;
    return Array.isArray(data) ? data : [];
  }

  getAparatosConsumoHistorico(): Observable<AparatosConsumoHistorico[]> {
    return this.http
      .get<ApiResponseConsumo>(this.apiUrl, {
        headers: this.getHeaders()
      })
      .pipe(
        map(response => this.normalizeConsumoResponse(response)),
        catchError((err) => {
          if (err.status === 404) {
            return of([]);
          }
          throw err;
        })
      );
  }

  getAparatosConsumoHistoricoPorUsuario(userId: number): Observable<AparatosConsumoHistorico[]> {
    const url = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.consumoPorUsuario}/${userId}/consumo_historico`;
    return this.http
      .get<ApiResponseConsumo>(url, {
        headers: this.getHeaders()
      })
      .pipe(
        map(response => this.normalizeConsumoResponse(response)),
        catchError((err) => {
          if (err.status === 404) {
            return of([]);
          }
          throw err;
        })
      );
  }

}
