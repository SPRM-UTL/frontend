import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LoaderService } from '../services/loader.service';
import { AuthService } from '../services/auth.service';
import { CuentaService } from '../cuenta/cuenta.service';
import { InicioService } from './inicio/inicio.service';
import { HistorialService } from '../historial/historial.service';
import { Actividad } from '../historial/actividad.model';

import {
  LucideBell,
  LucideSun,
  LucideHand,
  LucideAlertTriangle,
  LucideZap,
  LucideInfo,
  LucideCamera,
  LucideWifi,
  LucideLock,
  LucideFan,
  LucideSpeaker,
  LucideTv,
  LucideLightbulb
} from '@lucide/angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    CommonModule,

    // Lucide (standalone)
    LucideBell,
    LucideSun,
    LucideHand,
    LucideAlertTriangle,
    LucideZap,
    LucideInfo,
    LucideCamera,
    LucideWifi,
    LucideLock,
    LucideFan,
    LucideSpeaker,
    LucideTv,
    LucideLightbulb
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  private routerSub?: Subscription;
  private timerId?: any;

  // Servicios inyectados
  private authService = inject(AuthService);
  private router = inject(Router);
  private loaderService = inject(LoaderService);
  private historialService = inject(HistorialService);

  // Inyectamos ambos de forma pública para usarlos correctamente en el HTML
  public cuentaService = inject(CuentaService);
  public inicioService = inject(InicioService);

  readonly userName = computed(() => {
    const storedName = typeof localStorage !== 'undefined'
      ? localStorage.getItem('nombre')
      : null;

    return this.cuentaService.userName() || storedName || 'Usuario';
  });

  // Variables para las etiquetas de fecha y hora
  dayLabel: string = '';
  timeLabel: string = '';

  // Panel de notificaciones
  readonly panelOpen = signal(false);

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
    this.timerId = setInterval(() => this.updateClock(), 1000);

    // Router loader
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loaderService.show();
      }

      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        setTimeout(() => this.loaderService.hide(), 400);
      }
    });

    // SSR-safe: cargar historial únicamente en cliente
    afterNextRender(() => {
      if (typeof window === 'undefined') {
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
    if (this.routerSub) this.routerSub.unsubscribe();
    if (this.timerId) clearInterval(this.timerId);
  }

  onLogout() {
    this.authService.logout();
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

  // Referencias para usar en el template (switch).
  readonly lucideBell = LucideBell;
  readonly lucideSun = LucideSun;
  readonly lucideHand = LucideHand;
  readonly lucideAlertTriangle = LucideAlertTriangle;
  readonly lucideZap = LucideZap;
  readonly lucideInfo = LucideInfo;
  readonly lucideCamera = LucideCamera;
  readonly lucideWifi = LucideWifi;
  readonly lucideLock = LucideLock;
  readonly lucideFan = LucideFan;
  readonly lucideSpeaker = LucideSpeaker;
  readonly lucideTv = LucideTv;
  readonly lucideLightbulb = LucideLightbulb;

  lucideIconForActivity(a: Actividad): any {

    // Error override
    if (a.estado === 'Error') return LucideAlertTriangle;

    const accion = (a.accion ?? '').toLowerCase();
    const icono = (a.icono ?? '').toLowerCase();

    const hayEncendido = accion.includes('encend') || accion.includes('on') || icono.includes('bolt') || icono.includes('zap');
    if (hayEncendido) return LucideZap;

    const hayCamara = icono.includes('camera') || accion.includes('cám') || accion.includes('cam');
    if (hayCamara) return LucideCamera;

    const hayWifi = icono.includes('wifi') || accion.includes('wifi') || accion.includes('red');
    if (hayWifi) return LucideWifi;

    const hayLock = icono.includes('lock') || accion.includes('bloq') || accion.includes('segur');
    if (hayLock) return LucideLock;

    const hayFan = icono.includes('fan') || accion.includes('ventil') || accion.includes('aire');
    if (hayFan) return LucideFan;

    const haySpeaker = icono.includes('speaker') || accion.includes('altav') || accion.includes('audio');
    if (haySpeaker) return LucideSpeaker;

    const hayTv = icono.includes('tv') || accion.includes('tv') || accion.includes('tele');
    if (hayTv) return LucideTv;

    const hayLight = icono.includes('lightbulb') || icono.includes('light') || accion.includes('luz') || accion.includes('ilumin');
    if (hayLight) return LucideLightbulb;

    return LucideInfo;
  }

  togglePanel(): void {
    this.panelOpen.set(!this.panelOpen());
  }

  closePanel(): void {
    this.panelOpen.set(false);
  }
}

