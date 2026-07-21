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
import { forkJoin } from 'rxjs';

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
type PeriodoConsumo = 'hoy' | 'semana' | 'mes' | 'ano';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    DynamicChartComponent,
    LucideDynamicIcon,
    RouterLink
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
    if (this.datosDonaConConsumo().length === 0) return '0.00000 kWh';
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
    const datos = this.datosDonaConConsumo();
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
  periodoSeleccionado = signal<PeriodoConsumo>('semana');
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
    if (p === 'hoy')    return 'Hoy';
    if (p === 'semana') return 'Últimos 7 días';
    if (p === 'mes')    return 'Últimos 30 días';
    if (p === 'ano')    return 'Últimos 12 meses';
    return '';
  });

// ── Modificación para la gráfica circular (Donut) ────────────────────────

  /** Series para la dona: energía en kWh por dispositivo */
  readonly datosDonaConConsumo = computed(() =>
    this.inicioService.datosDona().filter(d => Number(d.totalEnergiaWh) > 0)
  );

  private readonly indiceDonaSeleccionado = signal<number | null>(null);

  readonly eficienciaSeries = computed(() =>
    this.datosDonaConConsumo().map(d => Number((d.totalEnergiaWh / 1000).toFixed(6)))
  );

  /** Etiquetas: nombres de los dispositivos */
  readonly eficienciaLabels = computed(() =>
    this.datosDonaConConsumo().map(d => d.aparato)
  );

  /** Total kWh de la dona */
  readonly donaTotalKwh = computed(() =>
    this.datosDonaConConsumo().reduce((acc, d) => acc + d.totalEnergiaWh / 1000, 0)
  );

  /** Paleta de colores atractiva */
  readonly eficienciaColors = ['#00a896', '#028090', '#02c39a', '#43b3aa', '#05668d', '#17b8a6', '#0f8f94', '#5ac8bf'];

  readonly donaSeleccionada = computed(() => {
    const datos = this.datosDonaConConsumo();
    if (datos.length === 0) return null;

    const requestedIndex = this.indiceDonaSeleccionado();
    const index = requestedIndex !== null && requestedIndex >= 0 && requestedIndex < datos.length
      ? requestedIndex
      : 0;
    const item = datos[index];
    const totalWh = datos.reduce((acc, d) => acc + d.totalEnergiaWh, 0);
    const kwh = item.totalEnergiaWh / 1000;
    const costo = kwh * COSTO_POR_KWH;

    return {
      ...item,
      index,
      color: this.eficienciaColors[index % this.eficienciaColors.length],
      wh: item.totalEnergiaWh,
      kwh,
      porcentaje: totalWh > 0 ? (item.totalEnergiaWh / totalWh) * 100 : 0,
      costo
    };
  });

  /** Label del período seleccionado para mostrar en la dona */
  readonly donaLabelPeriodo = computed(() => {
    const p = this.periodoSeleccionado();
    const map: Record<PeriodoConsumo, string> = { hoy: 'Hoy', semana: 'Semana', mes: 'Mes', ano: 'Año' };
    return map[p] || p;
  });

  readonly mayorConsumidor = computed(() => {
    const datos = this.datosDonaConConsumo();
    if (datos.length === 0) return { aparato: 'Ninguno', porcentaje: 0, kwh: 0, icono: 'smartphone' };

    const top = [...datos].sort((a, b) => b.totalEnergiaWh - a.totalEnergiaWh)[0];
    const totalWh = datos.reduce((acc, d) => acc + d.totalEnergiaWh, 0);

    return {
      aparato: top.aparato,
      porcentaje: totalWh > 0 ? (top.totalEnergiaWh / totalWh) * 100 : 0,
      kwh: top.totalEnergiaWh / 1000,
      icono: 'plug'
    };
  });

  // ── Interpretación de Resultados e Insights ─────────────────────────────
  readonly insights = computed(() => {
    const puntos = this.puntosResumen();
    const dona   = this.inicioService.datosDona();
    const period = this.periodoSeleccionado();
    const list: { title: string; description: string; type: 'info' | 'warning' | 'success' }[] = [];

    if (puntos.length === 0 && dona.length === 0) {
      list.push({
        title: 'Sin datos de consumo',
        description: 'No hay registros de consumo eléctrico en el periodo seleccionado para generar un análisis.',
        type: 'info'
      });
      return list;
    }

    const totalWh  = puntos.reduce((acc, p) => acc + p.energia_consumida_wh, 0);
    const totalKwh = totalWh / 1000;
    const avgW     = puntos.length > 0
      ? puntos.reduce((acc, p) => acc + p.potencia_promedio_w, 0) / puntos.length
      : 0;

    let periodText = 'en el periodo';
    if (period === 'hoy')    periodText = 'hoy';
    else if (period === 'semana') periodText = 'esta semana';
    else if (period === 'mes')    periodText = 'este mes';
    else if (period === 'ano')    periodText = 'este año';

    if (totalKwh > 0) {
      list.push({
        title: `Consumo total ${periodText}`,
        description: `Has consumido un total de <strong>${totalKwh.toFixed(3)} kWh</strong>, con un costo estimado de <strong>$${(totalKwh * COSTO_POR_KWH).toFixed(2)} MXN</strong> (tarifa base de $${COSTO_POR_KWH}/kWh).`,
        type: totalKwh > 10 ? 'warning' : 'success'
      });
    }

    if (dona.length > 0) {
      const sortedDona  = [...dona].sort((a, b) => b.totalEnergiaWh - a.totalEnergiaWh);
      const topDevice   = sortedDona[0];
      const donaTotal   = dona.reduce((a, d) => a + d.totalEnergiaWh, 0);
      const percentage  = donaTotal > 0 ? (topDevice.totalEnergiaWh / donaTotal) * 100 : 0;

      if (topDevice.totalEnergiaWh > 0) {
        list.push({
          title: `Mayor consumidor: ${topDevice.aparato}`,
          description: `<strong>${topDevice.aparato}</strong> representa el <strong>${percentage.toFixed(1)}%</strong> del consumo total, acumulando <strong>${(topDevice.totalEnergiaWh / 1000).toFixed(3)} kWh</strong>. Considera programar reglas o gestos para optimizar su uso.`,
          type: percentage > 40 ? 'warning' : 'info'
        });
      }

      if (dona.length > 1) {
        const sorted2   = [...dona].sort((a, b) => a.totalEnergiaWh - b.totalEnergiaWh);
        const efficient = sorted2[0];
        list.push({
          title: `Dispositivo más eficiente: ${efficient.aparato}`,
          description: `<strong>${efficient.aparato}</strong> es el dispositivo con menor consumo registrado: <strong>${(efficient.totalEnergiaWh / 1000).toFixed(4)} kWh</strong>.`,
          type: 'success'
        });
      }
    }

    if (avgW > 150) {
      list.push({
        title: 'Carga promedio elevada',
        description: `La potencia promedio del sistema es <strong>${avgW.toFixed(1)} W</strong>, lo cual indica varios aparatos de alto consumo encendidos simultáneamente.`,
        type: 'warning'
      });
    } else if (avgW > 0) {
      list.push({
        title: 'Uso eficiente de energía',
        description: `La potencia promedio es baja (<strong>${avgW.toFixed(1)} W</strong>), reflejando un perfil de consumo moderado y óptimo en tu hogar.`,
        type: 'success'
      });
    }

    return list;
  });

  // ── Cambio de período desde los botones ─────────────────────────────────
  setPeriodo(periodo: PeriodoConsumo) {
    this.periodoSeleccionado.set(periodo);
    this.cargarResumen();
  }

  seleccionarSegmentoDona(event: { dataPointIndex?: number; seriesIndex?: number }) {
    const index = Number(event?.dataPointIndex ?? event?.seriesIndex ?? 0);
    if (Number.isFinite(index) && index >= 0 && index < this.datosDonaConConsumo().length) {
      this.indiceDonaSeleccionado.set(index);
    }
  }

  // ── Llama al endpoint /resumen con los parámetros correctos ─────────────
  private cargarResumen() {
    if (!isPlatformBrowser(this.platformId)) return;
    const token = localStorage.getItem('token') ?? '';
    if (!token) return;

    const userId = Number(localStorage.getItem('userId') ?? '0');
    if (userId === 0) return;

    this.cargandoConsumo.set(true);
    this.puntosResumen.set([]);
    // No reseteamos datosDona a [] para evitar el flash de 'Sin datos' en la dona

    const { desde, hasta, granularidad } = this.obtenerRangoConsumo();

    // Cargar ambos: dona y barras con las fechas correctas
    forkJoin({
      dona: this.consumosService.getConsumoDona(userId, desde, hasta),
      barras: this.consumosService.getResumenGlobal(granularidad, desde, hasta)
    }).subscribe({
      next: ({ dona, barras }) => {
        const donasData = Array.isArray(dona) ? dona : [];
        const resumenData = barras?.data ?? barras;
        const puntos: AparatoConsumoPunto[] = Array.isArray(resumenData?.puntos)
          ? resumenData.puntos.map((punto: any) => ({
              periodo: punto?.periodo ?? '',
              potencia_promedio_w: Number(punto?.potencia_promedio_w ?? punto?.potenciaPromedioW ?? 0),
              corriente_promedio_a: Number(punto?.corriente_promedio_a ?? punto?.corrientePromedioA ?? 0),
              energia_consumida_wh: Number(punto?.energia_consumida_wh ?? punto?.energiaConsumidaWh ?? punto?.energia_wh ?? 0)
            }))
          : [];

        this.inicioService.datosDona.set(donasData);
        if (this.indiceDonaSeleccionado() === null || this.indiceDonaSeleccionado()! >= this.datosDonaConConsumo().length) {
          this.indiceDonaSeleccionado.set(donasData.some(d => d.totalEnergiaWh > 0) ? 0 : null);
        }
        this.puntosResumen.set(puntos);
        this.cargandoConsumo.set(false);
      },
      error: (err) => {
        console.error('Error al cargar consumos:', err);
        this.puntosResumen.set([]);
        this.inicioService.datosDona.set([]);
        this.cargandoConsumo.set(false);
      }
    });
  }

  private obtenerRangoConsumo(): { desde: Date; hasta: Date; granularidad: string } {
    const hasta = new Date();
    const desde = new Date(hasta);

    switch (this.periodoSeleccionado()) {
      case 'hoy':
        desde.setHours(0, 0, 0, 0);
        return { desde, hasta, granularidad: 'hora' };
      case 'semana':
        desde.setDate(hasta.getDate() - 6);
        desde.setHours(0, 0, 0, 0);
        return { desde, hasta, granularidad: 'dia' };
      case 'mes':
        desde.setDate(hasta.getDate() - 29);
        desde.setHours(0, 0, 0, 0);
        return { desde, hasta, granularidad: 'dia' };
      case 'ano':
        desde.setMonth(hasta.getMonth() - 11, 1);
        desde.setHours(0, 0, 0, 0);
        return { desde, hasta, granularidad: 'ano' };
      default:
        desde.setHours(0, 0, 0, 0);
        return { desde, hasta, granularidad: 'hora' };
    }
  }

  /** Formatea el ISO string del periodo según el tab activo */
  private formatearEtiqueta(periodoIso: string): string {
    try {
      const fecha = new Date(periodoIso);
      const p = this.periodoSeleccionado();
      if (p === 'hoy')    return `${pad(fecha.getHours())}:00`;
      if (p === 'semana') return ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][fecha.getDay()];
      if (p === 'mes')    return `${pad(fecha.getDate())}/${pad(fecha.getMonth() + 1)}`;
      if (p === 'ano')    return ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][fecha.getMonth()];
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
