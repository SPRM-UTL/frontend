// dashboard.ts
import {
  afterNextRender,
  Component,
  computed,
  inject,
  signal,
  PLATFORM_ID,
  OnDestroy,
  effect,
  viewChild,
  ElementRef,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';

import { AuthService }              from '../services/auth.service';
import { CuentaService }            from '../cuenta/cuenta.service';
import { InicioService }            from './inicio/inicio.service';
import { HistorialService }         from '../historial/historial.service';
import { GestosService }            from '../gestos/gestos.service';
import { DispositivosService }      from '../dispositivos/dispositivos.service';
import { AlertNotificationService } from '../services/alert-notification.service';
import { WeatherService }           from './weather.service';
import { AudioService } from '../services/audio.service';
import { LucideDynamicIcon } from '@lucide/angular';
import { getActivityIcon, getGestureIcon, getDeviceIcon } from '../shared/icon-map';
import { UnifiedNotification } from './dashboard.types';

import {
  LucideX, LucideLayoutDashboard, LucideSmartphone, LucideHand,
  LucideClock, LucidePencil, LucideBolt, LucideUser, LucideLogOut,
  LucideMenu, LucideBell, LucideSun, LucideCalendarDays,
  LucideChevronRight, LucideMapPin, LucideCheck, LucideCamera,
  LucidePlay, LucideBluetooth, LucideHash, LucideZap,
  LucidePause, LucideVolume2, LucideVolumeX, LucideRotateCcw, LucideRotateCw,
  LucideSettings, LucideMaximize, LucideChevronLeft, LucideDownload, LucidePower,
} from '@lucide/angular';

// Mapa de rutas → títulos, evita la cadena de if/else
const ROUTE_TITLES: Record<string, string> = {
  '/dashboard/inicio':     'Dashboard',
  '/dashboard/dispositivos': 'Dispositivos',
  '/dashboard/gestos':     'Gestos',
  '/dashboard/historial':  'Historial de actividad',
  '/dashboard/control':    'Control',
  '/dashboard/ajustes':    'Ajustes',
  '/dashboard/cuenta':     'Cuenta',
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink, RouterLinkActive, RouterOutlet, CommonModule,
    LucideDynamicIcon,
    LucideX, LucideLayoutDashboard, LucideSmartphone, LucideHand,
    LucideClock, LucidePencil, LucideBolt, LucideUser, LucideLogOut,
    LucideMenu, LucideBell, LucideSun, LucideCalendarDays,
    LucideChevronRight, LucideMapPin, LucideCheck, LucideCamera,
    LucidePlay, LucideBluetooth, LucideHash, LucideZap,
    LucidePause, LucideVolume2, LucideVolumeX, LucideRotateCcw, LucideRotateCw,
    LucideSettings, LucideMaximize, LucideChevronLeft, LucideChevronRight,
    LucideDownload, LucidePower,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────────
  private platformId           = inject(PLATFORM_ID);
  private isBrowser            = isPlatformBrowser(this.platformId);
  private router               = inject(Router);
  private historialService     = inject(HistorialService);
  private alertService         = inject(AlertNotificationService);
  private audioService         = inject(AudioService);
  public authService           = inject(AuthService);
  public cuentaService         = inject(CuentaService);
  public inicioService         = inject(InicioService);
  public gestosService         = inject(GestosService);
  public dispositivosService   = inject(DispositivosService);
  public weatherService        = inject(WeatherService);

  // ── Estado UI ─────────────────────────────────────────────────────────────
  readonly currentTitle        = signal<string>('Dashboard');
  readonly indicatorTop        = signal<number>(0);
  readonly isFirstItemActive   = signal<boolean>(false);
  readonly panelOpen           = signal(false);
  readonly menuOpen            = signal(false);
  readonly datePanelOpen       = signal(false);
  readonly sidebarCollapsed    = signal(true);

  // ── Reloj ─────────────────────────────────────────────────────────────────
  dayLabel  = '';
  timeLabel = '';

  readonly clockTime = computed(() =>
    (this.timeLabel || '--:--').replace(/\s?(AM|PM)$/i, ''),
  );
  readonly clockMeridiem = computed(() =>
    (this.timeLabel || '').match(/(AM|PM)$/i)?.[1]?.toUpperCase() ?? '',
  );

  // ── Notificaciones ────────────────────────────────────────────────────────

  readonly dismissedIds        = signal<number[]>([])
  readonly panelLoading        = this.historialService.loading;
  readonly panelError        = this.historialService.error;

  private prevNotifCount       = signal<number>(0)

  readonly recentActivities = computed <UnifiedNotification[]>(()=>{
      const alerts     = this.mapAlerts();
      const activities = this.mapActivities();
      return [...alerts, ...activities].slice(0,10)
  })

  readonly notifCount = computed(() => this.recentActivities().length);

  // ── Helpers públicos de íconos ────────────────────────────────────────────
  readonly getGestureIcon = getGestureIcon;
  readonly getDeviceIcon  = getDeviceIcon;

  // Iconos para el visor multimedia
  readonly LucidePause = LucidePause;
  readonly LucideVolume2 = LucideVolume2;
  readonly LucideVolumeX = LucideVolumeX;
  readonly LucideRotateCcw = LucideRotateCcw;
  readonly LucideRotateCw = LucideRotateCw;
  readonly LucideSettings = LucideSettings;
  readonly LucideMaximize = LucideMaximize;
  readonly LucideChevronLeft = LucideChevronLeft;
  readonly LucideChevronRight = LucideChevronRight;
  readonly LucidePlay = LucidePlay;
  readonly LucideDownload = LucideDownload;

  readonly userName = computed(() => this.cuentaService.userName() || 'Usuario');

  // ── Estado del Visor Multimedia ──────────────────────────────────────────
  readonly mediaViewerOpen = signal(false);
  readonly currentMediaIndex = signal(0);
  readonly isPlaying = signal(false);
  readonly isMuted = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);

  readonly consolidatedMedia = computed(() => {
    const gesto = this.gestosService.selectedGesto();
    if (!gesto || !gesto.detalle?.medios_referencia) return [];

    // Agrupamos para mantener el orden visual: fotos primero, luego videos
    const fotos = gesto.detalle.medios_referencia.filter((m: any) => m.tipo_media === 1);
    const videos = gesto.detalle.medios_referencia.filter((m: any) => m.tipo_media === 2);

    return [...fotos, ...videos];
  });

  readonly currentMedia = computed(() => {
    const media = this.consolidatedMedia();
    if (media.length === 0) return null;
    return media[this.currentMediaIndex()];
  });

  readonly totalMedia = computed(() => {
    return this.consolidatedMedia().length;
  });

  openMediaViewer(index: number): void {
    this.currentMediaIndex.set(index);
    this.mediaViewerOpen.set(true);
    this.isPlaying.set(true);
  }

  closeMediaViewer(): void {
    this.mediaViewerOpen.set(false);
    this.isPlaying.set(false);
  }

  nextMedia(): void {
    const next = (this.currentMediaIndex() + 1) % this.totalMedia();
    this.currentMediaIndex.set(next);
  }

  prevMedia(): void {
    const prev = (this.currentMediaIndex() - 1 + this.totalMedia()) % this.totalMedia();
    this.currentMediaIndex.set(prev);
  }

  togglePlay(): void { this.isPlaying.update(v => !v); }
  toggleMute(): void { this.isMuted.update(v => !v); }

  formatVideoTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  onVideoMetadata(event: any): void {
    this.duration.set(event.target.duration);
  }

  onVideoTimeUpdate(event: any): void {
    this.currentTime.set(event.target.currentTime);
  }

  seekVideo(event: any): void {
    const video = document.querySelector('.main-media-video') as HTMLVideoElement;
    if (video) {
      const pos = (event.target.value / 100) * this.duration();
      video.currentTime = pos;
    }
  }

  skip(seconds: number): void {
    const video = document.querySelector('.main-media-video') as HTMLVideoElement;
    if (video) video.currentTime += seconds;
  }

  // ── Internos ──────────────────────────────────────────────────────────────
  private timerId?: any;
  private routerSub?: Subscription;

  verDetalleGesto(gesto: any): void {
    this.gestosService.selectedGesto.set(gesto);
    this.gestosService.getGestoDetalle(gesto.sk_gesto_id).subscribe({
      next: (detalle) => {
        this.gestosService.selectedGesto.update(current => {
          if (current && current.sk_gesto_id === gesto.sk_gesto_id) {
            return { ...current, detalle };
          }
          return current;
        });
      },
      error: () => console.error('No se pudo cargar el detalle del gesto')
    });
  }

  // Referencia al reproductor de video
  videoPlayer = viewChild<ElementRef<HTMLVideoElement>>('videoPlayer');

  constructor() {
    this.updateClock();
    if (this.isBrowser) {
      this.timerId = setInterval(() => this.updateClock(), 1000);
    }

    this.syncWithUrl(this.router.url);
    this.initRouterListener();

    afterNextRender(() => this.onBrowserReady());

    effect(() => {
      const current = this.notifCount();
      const prev    = this.prevNotifCount();
      if (current > prev){
        const newest = this.recentActivities()[0];
        if (newest?.severity === 'error'){
          this.audioService.play('alert')
        }else{
          this.audioService.play('notificacion')
        }
      }
      this.prevNotifCount.set(current)
    })

    // Efecto para controlar la reproducción del video
    effect(() => {
      const player = this.videoPlayer()?.nativeElement;
      const playing = this.isPlaying();

      if (!player) return;

      if (playing) {
        player.play().catch(err => console.warn('Autoplay bloqueado:', err));
      } else {
        player.pause();
      }
    });

    // Resetear tiempo al cambiar de media
    effect(() => {
      this.currentMediaIndex();
      this.currentTime.set(0);
      this.duration.set(0);
      this.isPlaying.set(true);
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.timerId);
    this.routerSub?.unsubscribe();
  }

  // ── Acciones públicas ─────────────────────────────────────────────────────

  onLogout(): void { this.authService.confirmLogout(); }

  togglePanel(): void {
    if (!this.panelOpen()) this.datePanelOpen.set(false);
    this.panelOpen.update(v => !v);
  }

  toggleDatePanel(): void {
    if (!this.datePanelOpen()) {
      this.panelOpen.set(false);
      this.weatherService.load(this.timeLabel);
    }
    this.datePanelOpen.update(v => !v);
  }

  toggleSidebar(): void { this.sidebarCollapsed.update(v => !v); }
  toggleMenu():    void { this.menuOpen.update(v => !v); }
  closePanel():    void { this.panelOpen.set(false); }
  closeDatePanel():void { this.datePanelOpen.set(false); }
  closeMenu():     void { this.menuOpen.set(false); }

  dismissNotification(item: UnifiedNotification): void {
    if (item.type === 'alert') {
      this.alertService.dismiss(item.originalId);
    } else {
      this.dismissedIds.update(ids => {
        const next = [...ids, item.originalId];
        if (this.isBrowser) {
          localStorage.setItem('dismissed_notifications', JSON.stringify(next));
        }
        return next;
      });
    }
  }

  obtenerNombreDispositivo(id: number | null): string {
    return (
      this.dispositivosService.devices().find(d => d.sk_aparato_id === id)
        ?.nombre_aparato ?? 'Sin Dispositivo'
    );
  }

  updateIndicator(): void {
    if (!this.isBrowser) return;
    setTimeout(() => {
      const active = document.querySelector('.sidebar .nav-item.active') as HTMLElement;
      if (active) this.indicatorTop.set(active.offsetTop);
    }, 50);
  }

  // ── Privados ──────────────────────────────────────────────────────────────

  private onBrowserReady(): void {
    this.updateIndicator();

    const storedName = localStorage.getItem('nombre');
    if (storedName) this.cuentaService.userName.set(storedName);

    const token = localStorage.getItem('token') ?? '';
    if (token) this.historialService.loadHistorial();

    this.loadDismissedIds();
  }

  private loadDismissedIds(): void {
    try {
      const raw = localStorage.getItem('dismissed_notifications');
      if (raw) this.dismissedIds.set(JSON.parse(raw));
    } catch {
      console.error('Error al leer notificaciones descartadas');
    }
  }

  private initRouterListener(): void {
    this.routerSub = this.router.events.subscribe(event => {
      if (!(event instanceof NavigationEnd)) return;
      const url = event.urlAfterRedirects ?? event.url;
      this.syncWithUrl(url);
      this.updateIndicator();
    });
  }

  private syncWithUrl(url: string): void {
    const match = Object.keys(ROUTE_TITLES).find(k => url.includes(k));
    this.currentTitle.set(match ? ROUTE_TITLES[match] : 'Dashboard');
    this.isFirstItemActive.set(url.includes('/dashboard/inicio') || url === '/dashboard');
  }

  private updateClock(): void {
    const now = new Date();

    const label = now.toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
    this.dayLabel  = label.charAt(0).toUpperCase() + label.slice(1);

    this.timeLabel = now
      .toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })
      .replace(/\./g, '')
      .toUpperCase();
  }

  private mapAlerts(): UnifiedNotification[] {
    return this.alertService.alerts()
      .filter(a => !a.dismissed)
      .map(a => ({
        id:         `alert-${a.id}`,
        type:       'alert' as const,
        severity:   a.type,
        title:      a.message,
        subtitle:   'Sistema',
        timeLabel:  this.formatTime(a.timestamp),
        icon:       getActivityIcon(a.icon),
        originalId: a.id,
      }));
  }

  private mapActivities(): UnifiedNotification[] {
    const all       = this.historialService.actividades();
    const dismissed = this.dismissedIds();

    if (!Array.isArray(all)) return [];

    return all
      .filter(a => !dismissed.includes(a.id))
      .map(a => ({
        id:         `act-${a.id}`,
        type:       'activity' as const,
        severity:   a.estado === 'Error' ? ('error' as const) : ('default' as const),
        title:      a.accion,
        subtitle:   a.dispositivo,
        timeLabel:  a.hora,
        icon:       getActivityIcon(a.icono, a.estado, a.accion),
        statusText: a.estado,
        originalId: a.id,
      }));
  }

  private formatTime(date: Date): string {
    return date
      .toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })
      .replace(/\./g, '')
      .toUpperCase();
  }
}
