import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

import {
  AparatosConsumoHistorico,
  ApiResponseConsumo,
  ApiResponseConsumoResumen
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

  private formatDateParam(value: Date | string): string {
    if (typeof value === 'string') {
      return value;
    }

    const pad = (part: number) => String(part).padStart(2, '0');
    const year = value.getFullYear();
    const month = pad(value.getMonth() + 1);
    const day = pad(value.getDate());
    const hours = pad(value.getHours());
    const minutes = pad(value.getMinutes());
    const seconds = pad(value.getSeconds());

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

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

  private normalizeConsumoDonaResponse(response: any): { aparato: string; totalEnergiaWh: number }[] {
    const rawData = response?.data ?? response;
    if (!Array.isArray(rawData)) {
      return [];
    }

    return rawData
      .map((item: any) => {
        if (!item || typeof item !== 'object') {
          return null;
        }

        const aparato = item.aparato ?? item.nombre_aparato ?? item.dispositivo ?? item.deviceName ?? item.nombre ?? 'Sin nombre';
        let totalEnergiaWh = Number(
          item.totalEnergiaWh ??
          item.TotalEnergiaWh ??
          item.total_energia_wh ??
          item.energia_consumida_wh ??
          item.energia_wh ??
          0
        );

        if (Number.isNaN(totalEnergiaWh)) {
          totalEnergiaWh = 0;
        }

        if (totalEnergiaWh === 0) {
          const totalEnergiaKwh = Number(item.totalEnergiaKwh ?? item.total_energia_kwh ?? item.energia_consumida_kwh ?? item.energia_kwh ?? 0);
          if (!Number.isNaN(totalEnergiaKwh) && totalEnergiaKwh !== 0) {
            totalEnergiaWh = totalEnergiaKwh * 1000;
          }
        }

        return {
          aparato: String(aparato),
          totalEnergiaWh
        };
      })
      .filter((item: any): item is { aparato: string; totalEnergiaWh: number } => item !== null && item.totalEnergiaWh >= 0);
  }

  private normalizeResumenGlobalResponse(response: any): ApiResponseConsumoResumen {
    const payload = response?.data ?? response;
    const data = payload?.data ?? payload;
    const resumen = (data && typeof data === 'object') ? data : {};

    const puntos = Array.isArray(resumen.puntos)
      ? resumen.puntos
      : Array.isArray(payload?.puntos)
        ? payload.puntos
        : [];

    return {
      success: response?.success ?? true,
      status: response?.status ?? 200,
      data: {
        granularidad: resumen.granularidad ?? payload?.granularidad ?? 'dia',
        desde: resumen.desde ?? payload?.desde ?? '',
        hasta: resumen.hasta ?? payload?.hasta ?? '',
        puntos: puntos.map((punto: any) => ({
          periodo: punto?.periodo ?? '',
          potencia_promedio_w: Number(punto?.potencia_promedio_w ?? punto?.potenciaPromedioW ?? 0),
          corriente_promedio_a: Number(punto?.corriente_promedio_a ?? punto?.corrientePromedioA ?? 0),
          energia_consumida_wh: Number(punto?.energia_consumida_wh ?? punto?.energiaConsumidaWh ?? punto?.energia_wh ?? 0)
        }))
      }
    };
  }

  getAparatosConsumoHistoricoPorUsuario(userId: number, desde?: Date, hasta?: Date): Observable<AparatosConsumoHistorico[]> {
    const url = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.consumoPorUsuario}/usuario/${userId}/consumo_historico`;
    let params = new HttpParams();

    if (desde) params = params.set('desde', this.formatDateParam(desde));
    if (hasta) params = params.set('hasta', this.formatDateParam(hasta));

    return this.http
      .get<ApiResponseConsumo>(url, {
        headers: this.getHeaders(),
        params: params
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

  getResumenGlobal(granularidad: string, desde?: Date | string, hasta?: Date | string): Observable<ApiResponseConsumoResumen> {
    const url = `${this.apiUrl}/resumen`;
    const desdeParam = desde ? this.formatDateParam(desde) : '';
    const hastaParam = hasta ? this.formatDateParam(hasta) : '';

    let params = new HttpParams().set('granularidad', granularidad);
    if (desdeParam) params = params.set('desde', desdeParam);
    if (hastaParam) params = params.set('hasta', hastaParam);

    return this.http
      .get<any>(url, {
        headers: this.getHeaders(),
        params
      })
      .pipe(
        map(response => this.normalizeResumenGlobalResponse(response)),
        catchError((err) => {
          if (err.status === 404) {
            return of({
              success: false,
              status: 404,
              data: {
                granularidad,
                desde: desdeParam,
                hasta: hastaParam,
                puntos: []
              }
            });
          }
          throw err;
        })
      );
  }

  getAparatosConsumoHistorico(aparatoId: number, desde?: Date | string, hasta?: Date | string): Observable<AparatosConsumoHistorico[]> {
    let params = new HttpParams();

    if (desde) params = params.set('desde', this.formatDateParam(desde));
    if (hasta) params = params.set('hasta', this.formatDateParam(hasta));

    const url = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.consumoPorUsuario}/aparato/${aparatoId}/consumo_historico`;
    return this.http
      .get<ApiResponseConsumo>(url, {
      headers: this.getHeaders(),
      params: params
    }).pipe(
      map(response => this.normalizeConsumoResponse(response)),
      catchError((err) => {
        if (err.status === 404) return of([]);
        throw err;
      })
    );
  }

  getConsumoDona(usuarioId: number, desde?: Date | string, hasta?: Date | string): Observable<{ aparato: string; totalEnergiaWh: number }[]> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', this.formatDateParam(desde));
    if (hasta) params = params.set('hasta', this.formatDateParam(hasta));

    const url = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.consumoPorUsuario}/usuario/${usuarioId}/resumen_dona`;
    return this.http.get<any>(url, {
      headers: this.getHeaders(),
      params: params
    }).pipe(
      map(response => this.normalizeConsumoDonaResponse(response)),
      catchError((err) => {
        if (err.status === 404) return of([]);
        throw err;
      })
    );
  }

}
