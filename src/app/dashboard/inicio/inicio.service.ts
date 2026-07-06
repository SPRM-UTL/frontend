
import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, finalize, forkJoin, map, of } from 'rxjs';
import { Dispositivo } from '../../dispositivos/dispositivos.model';
import { Gesto } from '../../gestos/gesto.model';
import { Actividad } from '../../historial/actividad.model';
import { DispositivosService } from '../../dispositivos/dispositivos.service';
import { GestosService } from '../../gestos/gestos.service';
import { HistorialService } from '../../historial/historial.service';
import { ConsumosService } from '../../aparatosConsumo/consumo.service';
import { AparatosConsumoHistorico } from '../../aparatosConsumo/consumo.model';

// Importación de tus interfaces reales de dashboard
import { DashboardStats, UltimoGesto, AparatoUtilizado } from './inicio.model';

@Injectable({ providedIn: 'root' })
export class InicioService {
  private platformId = inject(PLATFORM_ID);
  private devicesService = inject(DispositivosService);
  private gestosService = inject(GestosService);
  private historialService = inject(HistorialService);
  private consumosService = inject(ConsumosService)

  readonly stats = signal<DashboardStats | null>(null);
  readonly acciones = signal<AparatoUtilizado[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly consumos = signal<AparatosConsumoHistorico[]>([]);

  loadInicio(id: number, token: string): void {
    this.loading.set(true);
    this.error.set(null);

    const isBrowser = isPlatformBrowser(this.platformId);
    const fallbackName = isBrowser
      ? localStorage.getItem('nombre') ?? 'Usuario'
      : 'Usuario';

    const fallbackStats: DashboardStats = {
      gestosGuardados: 0,
      automatizaciones: 0,
      dispositivosVinculados: 0,
      accionesHoy: 0,
      devicesOnline: 0,
      activeAutomations: 0,
      userName: fallbackName,
      dispositivosActivos: 0,
      estadoConexion: 'Desconectado',
      ultimoGesto: null,
      aparatosUtilizados: [],
      actividadReciente: []
    };

    const headers = new HttpHeaders().set('X-Show-Loader', 'true');

    forkJoin({
      dispositivos: this.devicesService.getDevicesObservable(),
      gestos: this.gestosService.loadGestos(token),
      historial: this.historialService.getHistorialObservable(),
      consumos: this.consumosService.getAparatosConsumoHistoricoPorUsuario(id)
    }).pipe(
      map(({ dispositivos, gestos, historial, consumos }) => {
        const dispositivosData = Array.isArray(dispositivos) ? dispositivos : [];
        const gestosData = Array.isArray(gestos) ? gestos : [];
        const actividades = Array.isArray(historial) ? historial : [];
        const consumoData = Array.isArray(consumos)? consumos : [];

        const userName = isBrowser
          ? localStorage.getItem('nombre') ?? fallbackName
          : fallbackName;
        const estadoConexion = dispositivosData.length > 0 ? 'En línea' : 'Desconectado';
        const ultimoGesto = this.obtenerUltimoGesto(gestosData, actividades);
        const aparatosUtilizados = this.obtenerAparatosUtilizados(dispositivosData, actividades);
        const dispositivosActivos = this.contarDispositivosActivos(actividades);
        const accionesHoy = this.contarAccionesHoy(actividades);

        const gestosActivos = gestosData.filter(g => g.estado === 'Activo' || g.activo === true).length;

        const stats: DashboardStats = {
          gestosGuardados: gestosData.length,
          automatizaciones: gestosActivos,
          dispositivosVinculados: dispositivosData.length,
          accionesHoy,
          devicesOnline: dispositivosData.length,
          activeAutomations: gestosData.length,
          userName,
          dispositivosActivos,
          estadoConexion,
          ultimoGesto,
          aparatosUtilizados,
          actividadReciente: actividades.slice(0, 5)
        };

        this.consumos.set(consumoData)
        this.acciones.set(aparatosUtilizados);
        return stats;
      }),
      catchError((err) => {
        console.error('Error en loadInicio:', err);
        this.error.set('No se pudo cargar la información del dashboard.');
        this.acciones.set([]);
        return of(fallbackStats);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (stats) => {
        this.stats.set(stats);
      }
    });
  }

  private obtenerUltimoGesto(gestos: Gesto[], actividades: Actividad[]): UltimoGesto | null {
    if (actividades.length === 0) return null;

    const ultimaActividad = actividades[0];
    const gesto = gestos.find(g =>
      g.nombre_gesto.toLowerCase().includes(ultimaActividad.accion.toLowerCase())
    );

    return {
      nombre: gesto?.nombre_gesto || ultimaActividad.accion,
      icono: gesto?.icono,
      accionEjecutada: ultimaActividad.dispositivo,
      timestamp: ultimaActividad.hora
    };
  }

  private obtenerAparatosUtilizados(dispositivos: Dispositivo[], actividades: Actividad[]): AparatoUtilizado[] {
    const contadores: Record<string, { dispositivo: Dispositivo; count: number }> = {};

    actividades.forEach(actividad => {
      const dispositivo = dispositivos.find(d =>
        d.nombre_aparato.toLowerCase() === actividad.dispositivo.toLowerCase()
      );

      if (dispositivo) {
        const key = String(dispositivo.sk_aparato_id);
        if (!contadores[key]) {
          contadores[key] = { dispositivo, count: 0 };
        }
        contadores[key].count++;
      }
    });

    return Object.values(contadores)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => ({
        sk_aparato_id: item.dispositivo.sk_aparato_id,
        nombre_aparato: item.dispositivo.nombre_aparato,
        tipo_aparato: item.dispositivo.tipo_aparato,
        icono: item.dispositivo.icono,
        veces_utilizado: item.count
      }));
  }

  private contarDispositivosActivos(actividades: Actividad[]): number {
    const ahora = new Date();
    const hace2Horas = new Date(ahora.getTime() - 2 * 60 * 60 * 1000);
    const dispositivosActivos = new Set<string>();

    actividades.forEach(actividad => {
      try {
        const partes = actividad.hora?.split(':') ?? [];
        if (partes.length >= 2) {
          const [hora, minuto] = partes.map(Number);
          const fecha = new Date();
          fecha.setHours(hora, minuto);

          if (fecha >= hace2Horas && fecha <= ahora) {
            dispositivosActivos.add(actividad.dispositivo);
          }
        }
      } catch {
        // Formato inválido ignorado de forma segura
      }
    });

    return dispositivosActivos.size;
  }

  private contarAccionesHoy(actividades: Actividad[]): number {
    return actividades.length;
  }
}
