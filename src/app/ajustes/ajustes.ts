import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideRotateCcw,
  LucideBolt,
  LucideLayoutDashboard,
  LucideUser,
  LucidePencil,
  LucideClock,
  LucideLock,
  LucideBell,
  LucideSearch,
  LucideHand,
  LucideSparkles
} from '@lucide/angular';
import { DispositivosService } from '../dispositivos/dispositivos.service';
import { GestosService } from '../gestos/gestos.service';
import { SkeletonComponent } from 'boneyard-js/angular';

@Component({
  selector: 'app-ajustes',
  standalone: true,
  imports: [
    CommonModule,
    LucideRotateCcw,
    LucideBolt,
    LucideLayoutDashboard,
    LucideUser,
    LucidePencil,
    LucideClock,
    LucideLock,
    LucideBell,
    LucideSearch,
    LucideHand,
    LucideSparkles,
    SkeletonComponent
  ],
  templateUrl: './ajustes.html',
  styleUrl: './ajustes.css',
})
export class Ajustes {
  private dispositivosService = inject(DispositivosService);
  private gestosService = inject(GestosService);

  // Settings state (local only)
  readonly language = signal('Español');
  readonly mode = signal('Automático');
  readonly notifications = signal(true);
  readonly autoUpdate = signal(true);
  readonly twoStepAuth = signal(true);
  readonly loading = signal(true);

  // Dynamic Stats from services
  readonly totalDevices = computed(() => this.dispositivosService.devices().length);
  readonly totalGestos = computed(() => this.gestosService.gestos().length);

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    // Momento en que inicia la carga
      const startTime = Date.now();
    try {
      const raw = localStorage.getItem('user_settings');
      if (raw) {
        const settings = JSON.parse(raw);

        if (settings.language) this.language.set(settings.language);
        if (settings.mode) this.mode.set(settings.mode);
        if (typeof settings.notifications === 'boolean') this.notifications.set(settings.notifications);
        if (typeof settings.autoUpdate === 'boolean') this.autoUpdate.set(settings.autoUpdate);
        if (typeof settings.twoStepAuth === 'boolean') this.twoStepAuth.set(settings.twoStepAuth);
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }finally {

    // simulamos carga mínima de skeleton
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 2000 - elapsed);

    setTimeout(() => {
      this.loading.set(false);
    }, remaining);

  }
  }

  cycleLanguage() {
    const langs = ['Español', 'Inglés', 'Francés'];
    const currentIdx = langs.indexOf(this.language());
    this.language.set(langs[(currentIdx + 1) % langs.length]);
    this.saveSettings();
  }

  cycleMode() {
    const modes = ['Automático', 'Claro', 'Oscuro'];
    const currentIdx = modes.indexOf(this.mode());
    this.mode.set(modes[(currentIdx + 1) % modes.length]);
    this.saveSettings();
  }

  toggleNotifications() {
    this.notifications.update(v => !v);
    this.saveSettings();
  }

  toggleAutoUpdate() {
    this.autoUpdate.update(v => !v);
    this.saveSettings();
  }

  toggleTwoStep() {
    this.twoStepAuth.update(v => !v);
    this.saveSettings();
  }

  private saveSettings() {
    const settings = {
      language: this.language(),
      mode: this.mode(),
      notifications: this.notifications(),
      autoUpdate: this.autoUpdate(),
      twoStepAuth: this.twoStepAuth()
    };
    localStorage.setItem('user_settings', JSON.stringify(settings));
  }

  resetSettings() {
    if (confirm('¿Estás seguro de que deseas restablecer todas las preferencias locales?')) {
      this.language.set('Español');
      this.mode.set('Automático');
      this.notifications.set(true);
      this.autoUpdate.set(true);
      this.twoStepAuth.set(true);
      localStorage.removeItem('user_settings');
    }
  }
}

