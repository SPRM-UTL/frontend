import { afterNextRender, Component, computed, inject, signal , PLATFORM_ID} from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { CuentaService } from '../cuenta/cuenta.service';
import { InicioService } from './inicio/inicio.service';
import { HistorialService } from '../historial/historial.service';
import { Actividad } from '../historial/actividad.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    CommonModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  private timerId?: any;
  private routerSubscription?: Subscription;

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId)

  readonly currentTitle = signal<string>('Dashboard');

  // Servicios inyectados
  public authService = inject(AuthService);
  private router = inject(Router);
  private historialService = inject(HistorialService);

  // Inyectamos ambos de forma pública para usarlos correctamente en el HTML
  public cuentaService = inject(CuentaService);
  public inicioService = inject(InicioService);

  readonly userName = computed(() => {
    return this.cuentaService.userName() || 'Usuario';
  });

  // Variables para las etiquetas de fecha y hora
  dayLabel: string = '';
  timeLabel: string = '';

  // Panel de notificaciones
  readonly panelOpen = signal(false);

  // Control del menú móvil (Flotante)
  readonly menuOpen = signal(false);

  // Control de fecha móvil
  readonly datePanelOpen = signal(false);

  // Control del sidebar (ChatGPT Style)
  readonly sidebarCollapsed = signal(true);

  readonly recentActivities = computed(() => {
    const all = this.historialService.actividades();
    if (!Array.isArray(all)) return [];
    return all.slice(0, 5);
  });

  readonly notifCount = computed(() => this.recentActivities().length);

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

    // Listen to routing changes
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateTitle(event.urlAfterRedirects || event.url);
    });

    // SSR-safe: cargar historial únicamente en cliente
    afterNextRender(() => {
      if (!this.isBrowser) {
        return;
      }

      const storedName = localStorage.getItem('nombre');

      if (storedName) {
        this.cuentaService.userName.set(storedName);
      }

      const token = localStorage.getItem('token') ?? '';
      if (token) {
        this.historialService.loadHistorial();
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

  iconPathForActivity(a: Actividad): string {
    if (a.estado === 'Error') return '/icons/triangle-alert.svg';

    const accion = (a.accion ?? '').toLowerCase();
    const icono = (a.icono ?? '').toLowerCase();

    const hayEncendido = accion.includes('encend') || accion.includes('on') || icono.includes('bolt') || icono.includes('zap');
    if (hayEncendido) return '/icons/cloud-lightning.svg';

    const hayCamara = icono.includes('camera') || accion.includes('cám') || accion.includes('cam');
    if (hayCamara) return '/icons/camera.svg';

    const hayWifi = icono.includes('wifi') || accion.includes('wifi') || accion.includes('red');
    if (hayWifi) return '/icons/wifi.svg';

    const hayLock = icono.includes('lock') || accion.includes('bloq') || accion.includes('segur');
    if (hayLock) return '/icons/lock.svg';

    const hayFan = icono.includes('fan') || accion.includes('ventil') || accion.includes('aire');
    if (hayFan) return '/icons/fan.svg';

    const haySpeaker = icono.includes('speaker') || accion.includes('altav') || accion.includes('audio');
    if (haySpeaker) return '/icons/speaker.svg';

    const hayTv = icono.includes('tv') || accion.includes('tv') || accion.includes('tele');
    if (hayTv) return '/icons/tv.svg';

    const hayLight = icono.includes('lightbulb') || icono.includes('light') || accion.includes('luz') || accion.includes('ilumin');
    if (hayLight) return '/icons/lightbulb.svg';

    return '/icons/sparkles.svg';
  }

  togglePanel(): void {
    this.panelOpen.set(!this.panelOpen());
  }

  closePanel(): void {
    this.panelOpen.set(false);
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
}
