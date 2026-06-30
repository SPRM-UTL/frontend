// weather.service.ts
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  LucideCloud,
  LucideCloudLightning,
  LucideCloudMoon,
  LucideCloudRain,
  LucideCloudSun,
  LucideMoon,
  LucideSun,
} from '@lucide/angular';
import { WeatherInfo, GeoPosition } from './dashboard.types';

const FALLBACK_POSITION: GeoPosition = {
  latitude: 19.4326,
  longitude: -99.1332,
  isFallback: true,
};

const WEATHER_DESCRIPTIONS: Array<{ codes: number[]; label: string }> = [
  { codes: [0],                                          label: 'Despejado' },
  { codes: [1, 2],                                       label: 'Parcialmente nublado' },
  { codes: [3, 45, 48],                                  label: 'Nublado' },
  { codes: [51, 53, 55, 56, 57],                         label: 'Llovizna' },
  { codes: [61, 63, 65, 66, 67, 80, 81, 82],             label: 'Lluvia' },
  { codes: [95, 96, 99],                                 label: 'Tormenta' },
];

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  readonly info    = signal<WeatherInfo | null>(null);
  readonly loading = signal(false);
  readonly error   = signal('');

  async load(currentTime: string): Promise<void> {
    if (!this.isBrowser || this.loading()) return;

    this.loading.set(true);
    this.error.set('');

    try {
      const pos = await this.getPosition();
      const data = await this.fetchForecast(pos);
      this.info.set(this.buildWeatherInfo(data, pos, currentTime));
    } catch {
      this.error.set('No se pudo cargar el clima');
      this.info.set(this.fallbackWeatherInfo(currentTime));
    } finally {
      this.loading.set(false);
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async fetchForecast(pos: GeoPosition): Promise<any> {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${pos.latitude}&longitude=${pos.longitude}` +
      `&current=temperature_2m,weather_code&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    return res.json();
  }

  private buildWeatherInfo(data: any, pos: GeoPosition, time: string): WeatherInfo {
    const code        = Number(data?.current?.weather_code ?? 0);
    const temperature = Math.round(Number(data?.current?.temperature_2m ?? 0));
    const now         = new Date();

    return {
      temperature: `${temperature}°C`,
      summary:     this.describe(code),
      place:       pos.isFallback ? 'Clima local' : 'Ubicación actual',
      updatedAt:   time,
      icon:        this.icon(code, now),
      cssClass:    this.getCssClass(code, now),
    };
  }

  private fallbackWeatherInfo(time: string): WeatherInfo {
    const night = this.isNight(new Date());
    return {
      temperature: '--°C',
      summary:     'Clima no disponible',
      place:       'Ubicación local',
      updatedAt:   time || '--:--',
      icon:        night ? LucideMoon : LucideSun,
      cssClass:    night ? 'night' : 'sunny',
    };
  }

  private getPosition(): Promise<GeoPosition> {
    if (!navigator.geolocation) return Promise.resolve(FALLBACK_POSITION);

    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude, isFallback: false }),
        ()           => resolve(FALLBACK_POSITION),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 600_000 },
      );
    });
  }

  private describe(code: number): string {
    return WEATHER_DESCRIPTIONS.find(w => w.codes.includes(code))?.label ?? 'Clima actual';
  }

  private icon(code: number, date: Date): any {
    const night = this.isNight(date);

    if (code === 0)                                                         return night ? LucideMoon          : LucideSun;
    if ([1, 2].includes(code))                                              return night ? LucideCloudMoon     : LucideCloudSun;
    if ([3, 45, 48].includes(code))                                         return LucideCloud;
    if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code))           return LucideCloudRain;
    if ([95, 96, 99].includes(code))                                        return LucideCloudLightning;

    return night ? LucideCloudMoon : LucideCloudSun;
  }

  private getCssClass(code: number, date: Date): string {
    const night = this.isNight(date);

    if (code === 0) return night ? 'night' : 'sunny';
    if ([1, 2].includes(code)) return night ? 'cloudy' : 'sunny';
    if ([3, 45, 48].includes(code)) return 'cloudy';
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rainy';
    if ([95, 96, 99].includes(code)) return 'stormy';

    return 'cloudy';
  }

  private isNight(date: Date): boolean {
    const h = date.getHours();
    return h < 6 || h >= 19;
  }
}
