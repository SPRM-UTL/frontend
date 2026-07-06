import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

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
  getAparatosConsumoHistorico(): Observable<AparatosConsumoHistorico[]> {

    return this.http
      .get<ApiResponseConsumo>(this.apiUrl, {
        headers: this.getHeaders()
      })
      .pipe(
        map(response => response.data ?? [])
      );

  }

}
