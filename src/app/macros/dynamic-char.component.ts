git status        };
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
