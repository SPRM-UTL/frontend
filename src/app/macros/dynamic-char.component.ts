import { Component, Input, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
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
        [states]="chartConfig.states">
      </apx-chart>
    </div>
  `,
  styles: [`
    .dynamic-chart-container { width: 100%; height: 100%; min-width: 0; }
  `]
})
export class DynamicChartComponent implements AfterViewInit, OnDestroy, OnChanges {
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

  @Input() valueFormatKind?: 'percentage' | 'currency';
  @Input() valueFormatter?: (value: number, kind: 'percentage' | 'currency') => string;

  chartConfig: any = null;
  private resizeObserver?: ResizeObserver;
  private resizeRafId: number | null = null;
  private resizeDebounceTimer: number | null = null;

  private defaultPalette = ['#2bbfaa', '#1f8a7a', '#4cd4c0', '#0e5c50', '#7fe0d0', '#a8f0e0', '#3a9e8c'];
  private seriesNameList: string[] = [];

  ngAfterViewInit() {
    this.buildChartConfig();
    this.setupResizeObserver();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['series'] || changes['categories'] || changes['labels'] ||
        changes['colors'] || changes['chartType'] || changes['height'] ||
        changes['additionalOptions'] || changes['seriesNames']) {
      this.buildChartConfig();
      this.forceResize();
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
    return `${value}%`;
  }

  private buildChartConfig() {
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

    const config: any = {
      series: this.series,
      chart: {
        type: this.chartType,
        height: this.height,
        toolbar: { show: false },
        ...(this.additionalOptions?.chart || {})
      },
      colors: finalColors,
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
        markers: { width: 12, height: 12, radius: 12 },
        formatter: (_seriesName: string, opts: any) => {
          const idx = opts?.seriesIndex;
          return this.seriesNameList[idx] || `Serie ${idx + 1}`;
        },
        itemMargin: { horizontal: 10, vertical: 4 },
        showForSingleSeries: true
      },
      tooltip: {
        enabled: true,
        custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
          const name = this.seriesNameList[seriesIndex] || '';
          const value = Array.isArray(series) && series[seriesIndex] ? series[seriesIndex] : undefined;
          const raw = typeof value === 'number' ? value : (Array.isArray(value) ? value[0] : w?.globals?.series?.[seriesIndex]);
          const formatted = this.formatNumber(Number(raw));
          return `<div class="apex-tooltip-custom">
            ${name ? `<div class="apex-tooltip-title">${name}</div>` : ''}
            <div class="apex-tooltip-value">${formatted}</div>
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
      Object.assign(config, this.additionalOptions);
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
    const raf = typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame
      : (cb: FrameRequestCallback) => window.setTimeout(cb, 0);  // ✅ CORREGIDO: tipado explícito
    this.resizeRafId = raf(() => {
      this.resizeRafId = null;
      window.dispatchEvent(new Event('resize'));
      setTimeout(() => {
        try { instance.updateOptions({}, false, true, false); } catch (e) {}
      }, 20);
    });
  }
}
