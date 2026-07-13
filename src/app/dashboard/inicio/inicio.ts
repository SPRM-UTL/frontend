import { GestosService } from './../../gestos/gestos.service';
import { Component, afterNextRender, inject, computed, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DynamicChartComponent } from '../../macros/dynamic-char.component';
import { InicioService } from './inicio.service';
import { DispositivosService } from '../../dispositivos/dispositivos.service';
import { CasasService } from '../../casas/casas.service';
import { ConsumosService } from '../../aparatosConsumo/consumo.service';
import { AparatoConsumoPunto } from '../../aparatosConsumo/consumo.model';

import { LucideDynamicIcon } from '@lucide/angular';
import { getDeviceIcon, getGestureIcon } from '../../shared/icon-map';

const COSTO_POR_KWH = 0.95;

/** Formatea el eje Y en kWh con 4 decimales. Expuesto como property para usarlo desde el template. */
const yAxisFormatterFn = (val: number) => {
  if (val === 0) return '0';
  if (val < 0.001) return val.toFixed(6);
  if (val < 1)    return val.toFixed(4);
  return val.toFixed(3);
};

const tooltipFormatterFn = (val: number) => `${yAxisFormatterFn(val)} kWh`;

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    DynamicChartComponent,
    RouterLink,
    LucideDynamicIcon
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {
  private platformId   = inject(PLATFORM_ID);
  private gestosService  = inject(GestosService);
  private consumosService = inject(ConsumosService);

  public readonly inicioService  = inject(InicioService);
  public readonly devicesService = inject(DispositivosService);
  public readonly casasService   = inject(CasasService);

  // ── Exponer el estado del servicio de inicio ─────────────────────────────
  readonly stats    = this.inicioService.stats;
  readonly acciones = this.inicioService.acciones;
  readonly loading  = this.inicioService.loading;
  readonly error    = this.inicioService.error;

  // ── Listas de dispositivos, gestos y casas ───────────────────────────────
  readonly connectedDevices = this.devicesService.connectedDevices;

  readonly displayedDevices = computed(() => {
    const devices   = this.devicesService.devices();
    const connected = this.connectedDevices();
    return devices
      .filter(d => connected.includes(d.mac_bluetooth || ''))
      .slice(0, 4);
  });

  readonly displayedGestos = computed(() => this.gestosService.gestos().slice(0, 3));
  readonly displayedCasas  = computed(() => this.casasService.casas().slice(0, 3));

  getChipClass(_tipo: string, index: number = 0): string {
    const classes = ['device-chip--pink', 'device-chip--violet', 'device-chip--green', 'device-chip--orange'];
    return classes[index % classes.length];
  }

  getDeviceIcon = getDeviceIcon;
  getGestureIcon = getGestureIcon;

  /** Funciones de formateo expuestas para usarse en additionalOptions del template */
  readonly yAxisFormatter = yAxisFormatterFn;
  readonly tooltipFormatter = tooltipFormatterFn;
  readonly donutTotalFormatter = (w: any) => {
    if (this.donaRaw().length === 0) return '0.00000 kWh';
    const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
    return total.toFixed(5) + ' kWh';
  };
  readonly donutValueFormatter = (val: string) => {
    const num = Number(val);
    if (Number.isNaN(num)) return val;
    return num.toFixed(5) + ' kWh';
  };
  readonly donutNameFormatter = (val: string) => {
    if (val === 'Total') return 'Total';
    const datos = this.donaRaw();
    const totalWh = datos.reduce((acc, d) => acc + d.totalEnergiaWh, 0);
    const deviceData = datos.find(d => d.aparato === val);
    if (!deviceData || totalWh === 0) return val;
    const pct = (deviceData.totalEnergiaWh / totalWh) * 100;
    const kwh = deviceData.totalEnergiaWh / 1000;
    const costo = kwh * COSTO_POR_KWH;
    const costoTexto = costo < 0.01 && costo > 0 ? costo.toFixed(4) : costo.toFixed(2);
    return `${pct.toFixed(1)}% ($${costoTexto})`;
  };

  // ── Estado de la gráfica de consumo ─────────────────────────────────────
  periodoSeleccionado = signal<'hoy' | 'semana' | 'mes' | 'año'>('semana');
  cargandoConsumo     = signal(false);

  /** Puntos pre-agrupados que devuelve el backend */
  private puntosResumen = signal<AparatoConsumoPunto[]>([]);

  // ── Computed signals para la gráfica ────────────────────────────────────
  readonly actividadCategorias = computed(() =>
    this.puntosResumen().map(p => this.formatearEtiqueta(p.periodo))
  );

  readonly actividadSeries = computed(() => [{
    name: 'Consumo (kWh)',
    data: this.puntosResumen().map(p => Number((p.energia_consumida_wh / 1000).toFixed(4)))
  }]);

  readonly consumoTotalKwh = computed(() =>
    this.puntosResumen().reduce((acc, p) => acc + p.energia_consumida_wh / 1000, 0)
  );

  readonly costoTotal = computed(() => this.consumoTotalKwh() * COSTO_POR_KWH);

  readonly labelPeriodo = computed(() => {
    const p = this.periodoSeleccionado();
    if (p === 'hoy')    return 'Últimas 24 horas';
    if (p === 'semana') return 'Últimos 7 días';
    if (p === 'mes')    return 'Últimos 30 días';
    if (p === 'año')    return 'Último año';
    return '';
  });

// ── Modificación para la gráfica circular (Donut) ────────────────────────

  /** Datos crudos del endpoint resumen_dona */
  private donaRaw = signal<{ aparato: string; totalEnergiaWh: number }[]>([]);

  /** Series para la dona: energía en kWh por dispositivo */
  readonly eficienciaSeries = computed(() => {
    const datos = this.donaRaw();
    if (datos.length === 0) return [1]; // dona vacía con un segmento gris
    return datos.map(d => Number((d.totalEnergiaWh / 1000).toFixed(6)));
  });

  /** Etiquetas: nombres de los dispositivos */
  readonly eficienciaLabels = computed(() => {
    const datos = this.donaRaw();
    if (datos.length === 0) return ['Sin datos'];
    return datos.map(d => d.aparato);
  });

  /** Total kWh de la dona */
  readonly donaTotalKwh = computed(() =>
    this.donaRaw().reduce((acc, d) => acc + d.totalEnergiaWh / 1000, 0)
  );

  /** Paleta de colores atractiva */
  readonly eficienciaColors = ['#00a896', '#028090', '#02c39a', '#f0f3bd', '#05668d', '#00e5ff', '#ff6b6b', '#ffd93d'];

  /** Label del período seleccionado para mostrar en la dona */
  readonly donaLabelPeriodo = computed(() => {
    const p = this.periodoSeleccionado();
    const map: Record<string, string> = { hoy: 'Hoy', semana: 'Semana', mes: 'Mes', año: 'Año' };
    return map[p] || p;
  });

  // ── Cambio de período desde los botones ─────────────────────────────────
  setPeriodo(periodo: 'hoy' | 'semana' | 'mes' | 'año') {
    this.periodoSeleccionado.set(periodo);
    this.cargarResumen();
  }

  // ── Llama al endpoint /resumen con los parámetros correctos ─────────────
  private cargarResumen() {
    if (!isPlatformBrowser(this.platformId)) return;
    const token = localStorage.getItem('token') ?? '';
    if (!token) return;

    const userId = Number(localStorage.getItem('userId') ?? '0');

    const ahora = new Date();
    const hasta = ahora.toISOString();
    let desde: string;
    let granularidad: string;

    switch (this.periodoSeleccionado()) {
      case 'hoy': {
        const d = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
        desde = d.toISOString();
        granularidad = 'envivo';
        break;
      }
      case 'semana': {
        const d = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        desde = d.toISOString();
        granularidad = 'mes'; // Groups by Day
        break;
      }
      case 'mes': {
        const d = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
        desde = d.toISOString();
        granularidad = 'mes'; // Groups by Day
        break;
      }
      case 'año': {
        const d = new Date(ahora);
        d.setFullYear(d.getFullYear() - 1);
        desde = d.toISOString();
        granularidad = 'año'; // Groups by Month
        break;
      }
      default: {
        const d = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        desde = d.toISOString();
        granularidad = 'dia';
      }
    }

    this.cargandoConsumo.set(true);

    // Cargar gráfica de barras (resumen global)
    this.consumosService.getResumenGlobal(granularidad, desde, hasta).subscribe({
      next: (resp: any) => {
        const puntos: AparatoConsumoPunto[] = resp?.data?.puntos ?? resp?.puntos ?? [];
        this.puntosResumen.set(puntos);
        this.cargandoConsumo.set(false);
      },
      error: () => {
        this.puntosResumen.set([]);
        this.cargandoConsumo.set(false);
      }
    });

    // Cargar gráfica de dona (consumo por dispositivo)
    if (userId > 0) {
      this.consumosService.getConsumoDona(userId, desde, hasta).subscribe({
        next: (resp: any) => {
          const datos = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
          this.donaRaw.set(datos);
        },
        error: () => {
          this.donaRaw.set([]);
        }
      });
    }
  }

  /** Formatea el ISO string del periodo según el tab activo */
  private formatearEtiqueta(periodoIso: string): string {
    try {
      const fecha = new Date(periodoIso);
      const p = this.periodoSeleccionado();
      if (p === 'hoy')    return `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
      if (p === 'semana') return ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][fecha.getDay()];
      if (p === 'mes')    return `${pad(fecha.getDate())}/${pad(fecha.getMonth() + 1)}`;
      if (p === 'año')    return ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][fecha.getMonth()];
    } catch { /* si el string no es parseable, lo devolvemos tal cual */ }
    return periodoIso;
  }

  constructor() {
    afterNextRender(() => {
      const isBrowser = isPlatformBrowser(this.platformId);
      const token  = isBrowser ? (localStorage.getItem('token') ?? '') : '';
      const userId = Number(isBrowser ? (localStorage.getItem('userId') ?? '1') : '1');

      if (userId > 0 && token) {
        this.inicioService.loadInicio(userId, token);
        this.casasService.loadCasas();
        // Carga inicial con el período por defecto (semana)
        this.cargarResumen();
      }
    });
  }
}
