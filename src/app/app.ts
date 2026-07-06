import { Component, OnDestroy, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Router,
  RouterOutlet,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastComponent } from './shared/toast/toast';
import { LoaderComponent } from './shared/loader/loader';
import { ConfirmModalComponent } from './shared/confirm-modal/confirm-modal';
import { LoaderService } from './services/loader.service';
import { AudioService } from './services/audio.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, LoaderComponent, ConfirmModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private router = inject(Router);
  private loaderService = inject(LoaderService);
  private audioService = inject(AudioService);
  private platformId = inject(PLATFORM_ID);
  private routerSub: Subscription;
  private safetyTimer?: any;
  private readonly loaderSafetyTimeoutMs = 8000;
  private readonly loaderHideDelayMs = 3400;

  private mousedownHandler = (event: MouseEvent) => this.handleGlobalInteraction(event);

  constructor() {
    // El componente raíz NUNCA se destruye durante la navegación,
    // así que es el lugar correcto para gestionar el loader global.
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loaderService.show();
        // Timeout de seguridad: si en 8 segundos no termina, ocultar el loader
        clearTimeout(this.safetyTimer);
        this.safetyTimer = setTimeout(() => this.loaderService.hide(), this.loaderSafetyTimeoutMs);
      } else if (event instanceof NavigationEnd) {
        clearTimeout(this.safetyTimer);
        setTimeout(() => this.loaderService.hide(), this.loaderHideDelayMs);
      } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
        clearTimeout(this.safetyTimer);
        this.loaderService.hide();
      }
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Usamos ÚNICAMENTE mousedown para evitar doble disparo con el evento click
      // Usamos la fase de captura (true) para interceptar antes de stopPropagation
      window.addEventListener('mousedown', this.mousedownHandler, true);
    }
  }

  private lastSoundTime = 0;
  private readonly SOUND_DEBOUNCE_MS = 300;

  private handleGlobalInteraction(event: MouseEvent) {
    const now = Date.now();
    if (now - this.lastSoundTime < this.SOUND_DEBOUNCE_MS) return;

    const target = event.target as HTMLElement;
    if (!target) return;

    // Excluir botones de encendido/apagado y controles de volumen que ya tienen su propio sonido
    const isExcluded = target.closest('.toggle-power-btn') ||
                       target.closest('.action-btn-status') ||
                       target.closest('.step-btn');

    if (isExcluded) return;

    // 1. Detección por etiquetas interactivas estándar o roles
    const isStandardClickable = target.closest('button') ||
                                target.closest('a') ||
                                target.closest('[role="button"]') ||
                                target.tagName === 'BUTTON' ||
                                target.tagName === 'A';

    if (isStandardClickable) {
      this.lastSoundTime = now;
      this.audioService.play('boton');
      return;
    }

    // 2. Detección por estilo (cursor pointer) para divs/componentes que actúan como botones
    try {
      const style = window.getComputedStyle(target);
      if (style && style.cursor === 'pointer') {
        this.lastSoundTime = now;
        this.audioService.play('boton');
      }
    } catch (e) {
      // Ignorar errores
    }
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    clearTimeout(this.safetyTimer);

    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('mousedown', this.mousedownHandler, true);
    }
  }
}
