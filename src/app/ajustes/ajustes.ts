import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DispositivosService } from '../dispositivos/dispositivos.service';
import { GestosService } from '../gestos/gestos.service';

@Component({
  selector: 'app-ajustes',
  standalone: true,
  imports: [CommonModule],
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

  // Dynamic Stats from services
  readonly totalDevices = computed(() => this.dispositivosService.devices().length);
  readonly totalGestos = computed(() => this.gestosService.gestos().length);

  cycleLanguage() {
    const langs = ['Español', 'Inglés', 'Francés'];
    const currentIdx = langs.indexOf(this.language());
    this.language.set(langs[(currentIdx + 1) % langs.length]);
  }

  cycleMode() {
    const modes = ['Automático', 'Claro', 'Oscuro'];
    const currentIdx = modes.indexOf(this.mode());
    this.mode.set(modes[(currentIdx + 1) % modes.length]);
  }

  toggleNotifications() {
    this.notifications.update(v => !v);
  }

  toggleAutoUpdate() {
    this.autoUpdate.update(v => !v);
  }

  toggleTwoStep() {
    this.twoStepAuth.update(v => !v);
  }

  resetSettings() {
    if (confirm('¿Estás seguro de que deseas restablecer todas las preferencias locales?')) {
      this.language.set('Español');
      this.mode.set('Automático');
      this.notifications.set(true);
      this.autoUpdate.set(true);
      this.twoStepAuth.set(true);
    }
  }
}

