import { afterNextRender, Component, computed, inject, signal, PLATFORM_ID, OnDestroy } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CuentaService } from '../cuenta/cuenta.service';
import { InicioService } from './inicio/inicio.service';
import { HistorialService } from '../historial/historial.service';
import { GestosService } from '../gestos/gestos.service';
import { DispositivosService } from '../dispositivos/dispositivos.service';
import { AlertNotificationService, AlertNotification } from '../services/alert-notification.service';
import { LucideDynamicIcon } from '@lucide/angular';
import { getActivityIcon, getGestureIcon, getDeviceIcon } from '../shared/icon-map';

interface UnifiedNotification {
  id: string | number;
  type: 'activity' | 'alert';
  severity: 'success' | 'error' | 'warning' | 'info' | 'default';
  title: string;
  subtitle: string;
  timeLabel: string;
  icon: any;
  statusText?: string;
  originalId: number;
}

interface WeatherInfo {
  temperature: string;
  summary: string;
  place: string;
  updatedAt: string;
  icon: any;
}

import {
  LucideX,
  LucideLayoutDashboard,
  LucideSmartphone,
  LucideHand,
  LucideClock,
  LucideCloud,
  LucideCloudMoon,
  LucideCloudRain,
  LucideCloudSun,
  LucideCloudLightning,
  LucidePencil,
  LucideBolt,
  LucideUser,
  LucideLogOut,
  LucideMenu,
  LucideBell,
  LucideMoon,
  LucideSun,
  LucideCalendarDays,
  LucideChevronRight,
  LucideMapPin,
  LucideCheck,
  LucideCamera,
  LucidePlay,
  LucideBluetooth,
  LucideHash,
  LucideZap,
} from '@lucide/angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    CommonModule,
    LucideDynamicIcon,
    LucideX,
    LucideLayoutDashboard,
    LucideSmartphone,
    LucideHand,
    LucideClock,
    LucidePencil,
    LucideBolt,
    LucideUser,
    LucideLogOut,
    LucideMenu,
    LucideBell,
    LucideSun,
    LucideCalendarDays,
    LucideChevronRight,
    LucideMapPin,
    LucideCheck,
    LucideCamera,
    LucidePlay,
    LucideBluetooth,
    LucideHash,
    LucideZap,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnDestroy {
  private timerId?: any;
  private routerSubscription?: Subscription;

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId)

  readonly currentTitle = signal<string>('Dashboard');

  // Servicios inyectados
  public authService = inject(AuthService);
  private router = inject(Router);
  private historialService = inject(HistorialService);
  public gestosService = inject(GestosService);
  public dispositivosService = inject(DispositivosService);
  public alertService = inject(AlertNotificationService);

  // Inyectamos ambos de forma pública para usarlos correctamente en el HTML
  public cuentaService = inject(CuentaService);
  public inicioService = inject(InicioService);

  readonly indicatorTop = signal<number>(0);
  readonly isFirstItemActive = signal<boolean>(false);

  readonly userName = computed(() => {
    return this.cuentaService.userName() || 'Usuario';
  });

  // Variables para las etiquetas de fecha y hora
  dayLabel: string = '';
  timeLabel: string = '';

  // Panel de notificaciones
  readonly panelOpen = signal(false);
  readonly dismissedNotifIds = signal<number[]>([]);

  // Control del menú móvil (Flotante)
  readonly menuOpen = signal(false);

  // Control de fecha móvil
  readonly datePanelOpen = signal(false);
  readonly weatherInfo = signal<WeatherInfo | null>(null);
  readonly weatherLoading = signal(false);
  readonly weatherError = signal('');

  // Control del sidebar (ChatGPT Style)
  readonly sidebarCollapsed = signal(true);

  // Mapeo de tipos de aparatos (Mismo que en dispositivos.ts)

  readonly recentActivities = computed(() => {
    const allActivities = this.historialService.actividades();
    const liveAlerts = this.alertService.alerts();
    const dismissed = this.dismissedNotifIds();

    const unified: UnifiedNotification[] = [];

    // Map Live Alerts
    liveAlerts.filter(a => !a.dismissed).forEach(a => {
      unified.push({
        id: `alert-${a.id}`,
        type: 'alert',
        severity: a.type,
        title: a.message,
        subtitle: 'Sistema',
        timeLabel: this.formatTime(a.timestamp),
        icon: getActivityIcon(a.icon),
        originalId: a.id
      });
    });

    // Map Historical Activities
    if (Array.isArray(allActivities)) {
      allActivities
        .filter(a => !dismissed.includes(a.id))
        .forEach(a => {
          unified.push({
            id: `act-${a.id}`,
            type: 'activity',
            severity: a.estado === 'Error' ? 'error' : 'default',
            title: a.accion,
            subtitle: `${a.dispositivo}`,
            timeLabel: a.hora,
            icon: getActivityIcon(a.icono, a.estado, a.accion),
            statusText: a.estado,
            originalId: a.id
          });
        });
    }

    return unified.slice(0, 10); // Show up to 10 unified notifications
  });

  readonly notifCount = computed(() => this.recentActivities().length);

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(/\./g, '').toUpperCase();
  }

  readonly panelLoading = this.historialService.loading;
  readonly panelError = this.historialService.error;

  constructor() {
    // Clock
    this.updateClock();

    if (this.isBrowser) {
      this.timerId = setInterval(() => this.updateClock(), 1000);
    }

    // Initial title setup
    this.updateTitle(this.router.url);
    this.updateActiveNavIndex(this.router.url);
    this.isFirstItemActive.set(this.router.url.includes('/dashboard/inicio') || this.router.url === '/dashboard');

    // Listen to routing changes
    this.routerSubscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects || event.url;
        this.updateTitle(url);
        this.updateActiveNavIndex(url);
        this.isFirstItemActive.set(url.includes('/dashboard/inicio') || url === '/dashboard');
        this.updateIndicator();
      }
    });

    // SSR-safe: cargar historial únicamente en cliente
    afterNextRender(() => {
      if (!this.isBrowser) {
        return;
      }
      this.updateIndicator();

      const storedName = localStorage.getItem('nombre');

      if (storedName) {
        this.cuentaService.userName.set(storedName);
      }

      const token = localStorage.getItem('token') ?? '';
      if (token) {
        this.historialService.loadHistorial();
      }

      // Cargar notificaciones borradas de localStorage
      const storedDismissed = localStorage.getItem('dismissed_notifications');
      if (storedDismissed) {
        try {
          this.dismissedNotifIds.set(JSON.parse(storedDismissed));
        } catch (e) {
          console.error('Error al cargar notificaciones borradas', e);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.timerId) clearInterval(this.timerId);
    this.routerSubscription?.unsubscribe();
  }

  private updateTitle(url: string) {
    if (url.includes('/dashboard/inicio')) {
      this.currentTitle.set('Dashboard');
    } else if (url.includes('/dashboard/dispositivos')) {
      this.currentTitle.set('Dispositivos');
    } else if (url.includes('/dashboard/gestos')) {
      this.currentTitle.set('Gestos');
    } else if (url.includes('/dashboard/historial')) {
      this.currentTitle.set('Historial de actividad');
    } else if (url.includes('/dashboard/control')) {
      this.currentTitle.set('Control');
    } else if (url.includes('/dashboard/ajustes')) {
      this.currentTitle.set('Ajustes');
    } else if (url.includes('/dashboard/cuenta')) {
      this.currentTitle.set('Cuenta');
    } else {
      this.currentTitle.set('Dashboard');
    }
  }

  private updateActiveNavIndex(url: string) {
    // Solo mantenemos la lógica para el título, el índice ya no es crítico para la posición
  }

  updateIndicator() {
    if (this.isBrowser) {
      // Usamos un pequeño delay para permitir que routerLinkActive aplique la clase .active
      setTimeout(() => {
        const activeEl = document.querySelector('.sidebar .nav-item.active') as HTMLElement;
        if (activeEl) {
          const navContainer = document.querySelector('.sidebar-nav') as HTMLElement;
          if (navContainer) {
            this.indicatorTop.set(activeEl.offsetTop);
          }
        }
      }, 50);
    }
  }

  onLogout() {
    this.authService.confirmLogout();
  }

  private updateClock() {
    const now = new Date();

    const label = now.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    this.dayLabel = label.charAt(0).toUpperCase() + label.slice(1);

    this.timeLabel = now
      .toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
      .replace(/\./g, '')
      .toUpperCase();
  }

  togglePanel(): void {
    if (!this.panelOpen()) {
      this.datePanelOpen.set(false);
    }
    this.panelOpen.set(!this.panelOpen());
  }

  toggleDatePanel(): void {
    if (!this.datePanelOpen()) {
      this.panelOpen.set(false);
      this.loadWeather();
    }
    this.datePanelOpen.set(!this.datePanelOpen());
  }

  closePanel(): void {
    this.panelOpen.set(false);
  }

  closeDatePanel(): void {
    this.datePanelOpen.set(false);
  }

  private async loadWeather(): Promise<void> {
    if (!this.isBrowser || this.weatherLoading()) return;

    this.weatherLoading.set(true);
    this.weatherError.set('');

    try {
      const position = await this.getBrowserPosition();
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${position.latitude}&longitude=${position.longitude}&current=temperature_2m,weather_code&timezone=auto`
      );

      if (!response.ok) {
        throw new Error('No se pudo consultar el clima');
      }

      const data = await response.json();
      const code = Number(data?.current?.weather_code ?? 0);
      const temperature = Math.round(Number(data?.current?.temperature_2m ?? 0));
      const now = new Date();

      this.weatherInfo.set({
        temperature: `${temperature}°C`,
        summary: this.weatherDescription(code),
        place: position.isFallback ? 'Clima local' : 'Ubicación actual',
        updatedAt: this.formatTime(now),
        icon: this.weatherIcon(code, now)
      });
    } catch {
      this.weatherError.set('No se pudo cargar el clima');
      this.weatherInfo.set({
        temperature: '--°C',
        summary: 'Clima no disponible',
        place: 'Ubicación local',
        updatedAt: this.timeLabel || '--:--',
        icon: this.isNight(new Date()) ? LucideMoon : LucideSun
      });
    } finally {
      this.weatherLoading.set(false);
    }
  }

  private getBrowserPosition(): Promise<{ latitude: number; longitude: number; isFallback: boolean }> {
    const fallback = { latitude: 19.4326, longitude: -99.1332, isFallback: true };

    if (!navigator.geolocation) {
      return Promise.resolve(fallback);
    }

    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        position => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          isFallback: false
        }),
        () => resolve(fallback),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
      );
    });
  }

  private weatherIcon(code: number, date: Date): any {
    const night = this.isNight(date);

    if (code === 0) return night ? LucideMoon : LucideSun;
    if ([1, 2].includes(code)) return night ? LucideCloudMoon : LucideCloudSun;
    if ([3, 45, 48].includes(code)) return LucideCloud;
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return LucideCloudRain;
    if ([95, 96, 99].includes(code)) return LucideCloudLightning;

    return night ? LucideCloudMoon : LucideCloudSun;
  }

  private weatherDescription(code: number): string {
    if (code === 0) return 'Despejado';
    if ([1, 2].includes(code)) return 'Parcialmente nublado';
    if ([3, 45, 48].includes(code)) return 'Nublado';
    if ([51, 53, 55, 56, 57].includes(code)) return 'Llovizna';
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Lluvia';
    if ([95, 96, 99].includes(code)) return 'Tormenta';

    return 'Clima actual';
  }

  private isNight(date: Date): boolean {
    const hour = date.getHours();
    return hour < 6 || hour >= 19;
  }

  clockTime(): string {
    return (this.timeLabel || '--:--').replace(/\s?(AM|PM)$/i, '');
  }

  clockMeridiem(): string {
    const match = (this.timeLabel || '').match(/(AM|PM)$/i);
    return match?.[1]?.toUpperCase() ?? '';
  }

  dismissNotification(item: UnifiedNotification): void {
    if (item.type === 'alert') {
      this.alertService.dismiss(item.originalId);
    } else {
      this.dismissedNotifIds.update(ids => {
        const newIds = [...ids, item.originalId];
        if (this.isBrowser) {
          localStorage.setItem('dismissed_notifications', JSON.stringify(newIds));
        }
        return newIds;
      });
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  toggleMenu(): void {
    this.menuOpen.set(!this.menuOpen());
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  obtenerNombreDispositivo(id: number | null): string {
    return this.dispositivosService.devices().find(
      d => d.sk_aparato_id === id
    )?.nombre_aparato ?? 'Sin Dispositivo';
  }

  /** Devuelve el icono Lucide para un gesto */
  getGestureIcon = getGestureIcon;

  /** Devuelve el icono Lucide para un dispositivo */
  getDeviceIcon = getDeviceIcon;
}

