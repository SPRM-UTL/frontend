import { Component, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
    LucideSparkles
  ],
  templateUrl: './ajustes.html',
  styleUrl: './ajustes.css',
})
export class Ajustes {
  private platformId = inject(PLATFORM_ID);
  private dispositivosService = inject(DispositivosService);
  private gestosService = inject(GestosService);

  // Settings state (local only)
  readonly language = signal('Español');
  readonly mode = signal('Automático');
  readonly notifications = signal(true);
  readonly autoUpdate = signal(true);
  readonly twoStepAuth = signal(true);

  readonly showResetModal = signal(false);

  // Dynamic Stats from services
  readonly totalDevices = computed(() => this.dispositivosService.devices().length);
  readonly totalGestos = computed(() => this.gestosService.gestos().length);

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const raw = localStorage.getItem('user_settings');
      if (raw) {
        const settings = JSON.parse(raw);
        if (settings.language) this.language.set(settings.language);
        if (settings.mode)     this.mode.set(settings.mode);
        if (typeof settings.notifications === 'boolean') this.notifications.set(settings.notifications);
        if (typeof settings.autoUpdate    === 'boolean') this.autoUpdate.set(settings.autoUpdate);
        if (typeof settings.twoStepAuth   === 'boolean') this.twoStepAuth.set(settings.twoStepAuth);
      }
    } catch (e) {
      console.error('Error loading settings:', e);
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
    const next = modes[(currentIdx + 1) % modes.length];
    this.mode.set(next);
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
    this.showResetModal.set(true);
  }

  confirmReset() {
    this.language.set('Español');
    this.mode.set('Automático');
    this.notifications.set(true);
    this.autoUpdate.set(true);
    this.twoStepAuth.set(true);
    localStorage.removeItem('user_settings');
    this.showResetModal.set(false);
  }

  cancelReset() {
    this.showResetModal.set(false);
  }
}
