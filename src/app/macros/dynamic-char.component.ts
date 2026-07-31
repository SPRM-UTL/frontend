import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';

export type ChartType =
  | 'line' | 'area' | 'bar' | 'histogram' | 'pie' | 'donut'
  | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'treemap'
  | 'boxPlot' | 'candlestick' | 'radar' | 'polarArea' | 'rangeBar';

@Component({
  selector: 'app-dynamic-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="dynamic-chart-container" #chartContainer>
      <apx-chart
        #chartRef
        *ngIf="chartConfig"
        [series]="chartConfig.series"
        [chart]="chartConfig.chart"
        [xaxis]="chartConfig.xaxis"
        [stroke]="chartConfig.stroke"
        [colors]="chartConfig.colors"
        [dataLabels]="chartConfig.dataLabels"
        [fill]="chartConfig.fill"
        [plotOptions]="chartConfig.plotOptions"
        [labels]="chartConfig.labels"
        [legend]="chartConfig.legend"
        [yaxis]="chartConfig.yaxis"
        [grid]="chartConfig.grid"
        [tooltip]="chartConfig.tooltip"
        [states]="chartConfig.states">
      </apx-chart>
    </div>
  `,
  styles: [`
    .dynamic-chart-container {
      width: 100%;
      height: 100%;
      min-width: 0;
      min-height: 300px;
    }
  `]
})
export class DynamicChartComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('chartRef') chartComponent: any;
  @ViewChild('chartContainer') containerRef!: ElementRef<HTMLDivElement>;

  @Input() chartType: ChartType = 'area';
  @Input() series: any[] = [];
  @Input() seriesNames: string[] = [];
  @Input() categories?: string[];
  @Input() labels?: string[];
  @Input() colors: string[] = [];
  @Input() height: number = 300;
  @Input() additionalOptions?: any;

  @Input() valueFormatKind?: 'percentage' | 'currency' | 'kwh';
  @Input() valueFormatter?: (value: number, kind: 'percentage' | 'currency' | 'kwh') => string;
  @Output() dataPointSelected = new EventEmitter<{
    seriesIndex: number;
    dataPointIndex: number;
    label: string;
    value: number;
    color: string;
  }>();

  chartConfig: any = null;
  private resizeObserver?: ResizeObserver;
  private resizeRafId: number | null = null;
  private resizeDebounceTimer: number | null = null;

  private defaultPalette = ['#2bbfaa', '#1f8a7a', '#4cd4c0', '#0e5c50', '#7fe0d0', '#a8f0e0', '#3a9e8c'];
  private seriesNameList: string[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.buildChartConfig();
  }

  ngAfterViewInit() {
    this.setupResizeObserver();
    setTimeout(() => this.forceResize(), 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['series'] || changes['categories'] || changes['labels'] ||
        changes['colors'] || changes['chartType'] || changes['height'] ||
        changes['additionalOptions'] || changes['seriesNames']) {
      this.buildChartConfig();
      setTimeout(() => this.forceResize(), 100);
    }
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    if (this.resizeDebounceTimer) clearTimeout(this.resizeDebounceTimer);
    if (this.resizeRafId) cancelAnimationFrame(this.resizeRafId);
  }

  private formatNumber(value: number): string {
    if (this.valueFormatter) return this.valueFormatter(value, this.valueFormatKind || 'percentage');
    if (this.valueFormatKind === 'currency') {
      const num = typeof value === 'number' ? value : Number(value);
      if (Number.isNaN(num)) return String(value);
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
      }).format(num);
    }
    if (this.valueFormatKind === 'kwh') {
      const num = typeof value === 'number' ? value : Number(value);
      if (Number.isNaN(num)) return String(value);
      return `${num.toFixed(5)} kWh`;
    }
    return `${value}%`;
  }

  private runAfterFrame(callback: () => void): void {
    if (typeof window !== 'undefined' && typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => callback());
      return;
    }

    setTimeout(() => callback(), 0);
  }

  private buildChartConfig() {
    if (typeof window === 'undefined') {
      return;
    }

    this.resolveSeriesNames();

    let seriesCount = this.series.length;
    if (this.chartType === 'radialBar' && this.series.length && typeof this.series[0] !== 'object') {
      seriesCount = this.series.length;
    } else if (this.chartType !== 'radialBar' && this.series.length && this.series[0]?.data) {
      seriesCount = this.series.length;
    } else if ((this.chartType === 'pie' || this.chartType === 'donut' || this.chartType === 'polarArea') && Array.isArray(this.series)) {
      seriesCount = this.series.length;
    }

    let finalColors = [...this.colors];
    if (finalColors.length === 0) {
      finalColors = this.getDefaultColors(seriesCount);
    } else if (finalColors.length < seriesCount) {
      for (let i = finalColors.length; i < seriesCount; i++) {
        finalColors.push(this.defaultPalette[i % this.defaultPalette.length]);
      }
    }

    const additionalChartOptions = this.additionalOptions?.chart || {};
    const additionalChartEvents = additionalChartOptions?.events || {};

    const config: any = {
      series: this.series,
      chart: {
        type: this.chartType,
        height: this.height,
        toolbar: { show: false },
        ...additionalChartOptions,
        events: {
          ...additionalChartEvents,
          dataPointSelection: (event: any, chartContext: any, opts: any) => {
            additionalChartEvents?.dataPointSelection?.(event, chartContext, opts);
            this.emitSelection(opts);
          }
        }
      },
      colors: finalColors,
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
        markers: { width: 12, height: 12, radius: 12 },
        formatter: (seriesName: string, opts: any) => {
          const idx = opts?.seriesIndex;
          if (this.chartType === 'pie' || this.chartType === 'donut') {
            return this.labels?.[idx] || seriesName;
          }
          return this.seriesNameList[idx] || `Serie ${idx + 1}`;
        },
        itemMargin: { horizontal: 10, vertical: 4 },
        showForSingleSeries: true
      },
      tooltip: {
        enabled: true,
        custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
          let name = '';
          let raw = 0;
          let percentText = '';
          const isPieOrDonut = w.config.chart.type === 'pie' || w.config.chart.type === 'donut';

          if (isPieOrDonut) {
            const idx = this.resolvePointIndex(seriesIndex, dataPointIndex);
            name = w.globals.labels[idx] || '';
            const rawVal = w.globals.series[idx];
            raw = Number(Array.isArray(rawVal) ? rawVal[0] : rawVal) || 0;

            const rawPct = w.globals?.seriesPercent?.[idx];
            const pctVal = Number(Array.isArray(rawPct) ? rawPct[0] : rawPct);

            if (!Number.isNaN(pctVal)) {
              const cost = raw * 0.95;
              const costText = cost < 0.01 && cost > 0 ? cost.toFixed(4) : cost.toFixed(2);
              percentText = ` (${pctVal.toFixed(1)}% | $${costText})`;
            } else if (w.globals && Array.isArray(w.globals.series)) {
              const total = w.globals.series.reduce((a: number, b: number) => a + Number(b) || 0, 0);
              if (total > 0) {
                const pct = (raw / total) * 100;
                const cost = raw * 0.95;
                const costText = cost < 0.01 && cost > 0 ? cost.toFixed(4) : cost.toFixed(2);
                percentText = ` (${pct.toFixed(1)}% | $${costText})`;
              }
            }
          } else {
            name = this.seriesNameList[seriesIndex] || '';
            const value = Array.isArray(series) && series[seriesIndex] ? series[seriesIndex] : undefined;
            raw = typeof value === 'number'
              ? value
              : (Array.isArray(value) ? value[dataPointIndex] : w?.globals?.series?.[seriesIndex]?.[dataPointIndex]);
          }

          const formatted = isPieOrDonut && this.valueFormatKind === 'kwh'
            ? `${raw.toFixed(5)} kWh (${(raw * 1000).toFixed(2)} Wh)${percentText}`
            : this.formatNumber(Number(raw)) + percentText;
          const colorIndex = isPieOrDonut ? this.resolvePointIndex(seriesIndex, dataPointIndex) : seriesIndex;
          const color = w.config.colors[colorIndex] || '#fff';

          return `<div class="apex-tooltip-custom" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(30, 30, 30, 0.95); border: 1px solid #444; border-radius: 6px; color: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.35);">
            <span class="apex-tooltip-marker" style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; flex-shrink: 0;"></span>
            <div style="display: flex; flex-direction: column;">
              ${name ? `<span class="apex-tooltip-title" style="font-size: 11px; opacity: 0.8; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: #bbb;">${name}</span>` : ''}
              <span class="apex-tooltip-value" style="font-size: 13px; font-weight: 700; margin-top: 2px; color: #fff;">${formatted}</span>
            </div>
          </div>`;
        }
      },
      states: {
        hover: { filter: { type: 'none' } },
        active: { allowMultipleDataPointsSelection: false, filter: { type: 'none' } }
      }
    };

    switch (this.chartType) {
      case 'area':
        config.stroke = { curve: 'smooth' };
        config.fill = { opacity: 0.3 };
        config.xaxis = { categories: this.categories || [] };
        break;
      case 'line':
        config.stroke = { curve: 'smooth', width: 2 };
        config.xaxis = { categories: this.categories || [] };
        break;
      case 'bar':
        config.plotOptions = {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded',
            dataLabels: { position: 'top', enabled: true, formatter: (val: number) => this.formatNumber(val) }
          }
        };
        config.xaxis = { categories: this.categories || [] };
        break;
      case 'radialBar':
        let numericSeries: number[] = [];
        if (Array.isArray(this.series) && this.series.length) {
          numericSeries = this.series.map((item: any) => {
            if (typeof item === 'number') return item;
            if (item?.data) {
              const d = item.data;
              return Array.isArray(d) ? Number(d[0]) : Number(d);
            }
            return Number(item);
          }).filter(n => !Number.isNaN(n));
        }
        config.series = numericSeries;

        config.plotOptions = {
          radialBar: {
            hollow: { size: '65%' },
            dataLabels: {
              value: { formatter: (val: number) => this.formatNumber(val) }
            },
            track: { background: '#E6E6E6', strokeWidth: '100%', opacity: 0.25 }
          }
        };
        config.stroke = { lineCap: 'round' };

        if (numericSeries.length > 0) {
          config.plotOptions.radialBar.dataLabels.total = {
            show: true,
            label: 'Total',
            formatter: () => {
              const total = numericSeries.reduce((a, b) => a + b, 0);
              return this.formatNumber(total);
            }
          };
        }
        break;
      case 'candlestick':
        config.xaxis = { type: 'datetime' };
        break;
    }

    if (this.labels && this.labels.length) {
      config.labels = this.labels;
    }

    if (this.additionalOptions) {
      for (const key of Object.keys(this.additionalOptions)) {
        if (key === 'chart') continue; // chart is already merged above
        if (config[key] && typeof config[key] === 'object' && typeof this.additionalOptions[key] === 'object' && !Array.isArray(config[key])) {
          config[key] = { ...config[key], ...this.additionalOptions[key] };
        } else {
          config[key] = this.additionalOptions[key];
        }
      }
    }

    this.chartConfig = config;
  }

  private resolveSeriesNames(): void {
    if (this.seriesNames && this.seriesNames.length) {
      this.seriesNameList = [...this.seriesNames];
      return;
    }

    const names: string[] = [];
    for (let i = 0; i < this.series.length; i++) {
      const s = this.series[i];
      if (s && typeof s === 'object' && 'name' in s && typeof s.name === 'string') {
        names.push(s.name);
      } else {
        names.push(`Serie ${i + 1}`);
      }
    }
    this.seriesNameList = names;
  }

  private resolvePointIndex(seriesIndex: any, dataPointIndex: any): number {
    const dataIndex = Number(dataPointIndex);
    if (Number.isFinite(dataIndex) && dataIndex >= 0) {
      return dataIndex;
    }

    const fallbackIndex = Number(seriesIndex);
    return Number.isFinite(fallbackIndex) && fallbackIndex >= 0 ? fallbackIndex : 0;
  }

  private emitSelection(opts: any): void {
    const isPieLike = this.chartType === 'pie' || this.chartType === 'donut' || this.chartType === 'polarArea';
    const pointIndex = this.resolvePointIndex(opts?.seriesIndex, opts?.dataPointIndex);
    const seriesIndex = Number.isFinite(Number(opts?.seriesIndex)) ? Number(opts?.seriesIndex) : 0;
    const globals = opts?.w?.globals;
    const colors = opts?.w?.config?.colors ?? this.colors;

    const value = isPieLike
      ? Number(globals?.series?.[pointIndex] ?? this.series?.[pointIndex] ?? 0)
      : Number(globals?.series?.[seriesIndex]?.[pointIndex] ?? this.series?.[seriesIndex]?.data?.[pointIndex] ?? 0);

    this.dataPointSelected.emit({
      seriesIndex,
      dataPointIndex: pointIndex,
      label: isPieLike
        ? String(globals?.labels?.[pointIndex] ?? this.labels?.[pointIndex] ?? '')
        : String(this.categories?.[pointIndex] ?? ''),
      value: Number.isNaN(value) ? 0 : value,
      color: String(colors?.[isPieLike ? pointIndex : seriesIndex] ?? '')
    });
  }

  private getDefaultColors(count: number): string[] {
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(this.defaultPalette[i % this.defaultPalette.length]);
    }
    return colors;
  }

  private setupResizeObserver() {
    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return;
    if (!this.containerRef) return;
    this.resizeObserver = new ResizeObserver(() => this.scheduleResize());
    this.resizeObserver.observe(this.containerRef.nativeElement);
  }

  private scheduleResize() {
    if (typeof window === 'undefined') return;
    if (this.resizeDebounceTimer) clearTimeout(this.resizeDebounceTimer);
    this.resizeDebounceTimer = window.setTimeout(() => {
      this.resizeDebounceTimer = null;
      this.forceResize();
    }, 120);
  }

  private forceResize() {
    if (typeof window === 'undefined') return;
    const instance = this.chartComponent?.chart;
    if (!instance || this.resizeRafId) return;

    const schedule = (cb: FrameRequestCallback) => {
      if (typeof window.requestAnimationFrame === 'function') {
        return window.requestAnimationFrame(cb);
      }
      return window.setTimeout(cb, 0);
    };

    this.resizeRafId = schedule(() => {
      this.resizeRafId = null;
      window.dispatchEvent(new Event('resize'));
      setTimeout(() => {
        try { instance.updateOptions({}, false, true, false); } catch (e) {}
      }, 20);
    });
  }
}
