import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private sounds: { [key: string]: HTMLAudioElement } = {};
  private duraciones: { [key: string]: number } = {};
  private timers: { [key: string]: number } = {};

  constructor() {
    this.precargarSonidos();
  }

  private precargarSonidos(): void {
    this.sounds = {
      notificacion: this.crearSonido('https://cdn.pixabay.com/audio/2025/07/13/audio_fad29823bb.mp3'),
      alerta: this.crearSonido('https://cdn.pixabay.com/audio/2026/06/07/audio_b87b692d45.mp3'),
      cargando: this.crearSonido('https://cdn.pixabay.com/audio/2024/07/26/audio_9d9081e630.mp3'),
      cargaCompleta: this.crearSonido('https://cdn.pixabay.com/audio/2024/07/26/audio_9d9081e630.mp3'),
      volumen: this.crearSonido('https://cdn.pixabay.com/audio/2025/07/13/audio_cea6b5579c.mp3'),
      interruptor: this.crearSonido('https://static.hooksounds.com/uploads/preview/sfx/Lighter-Switch-On-2_66fb25bbe734c5.78966954.mp3'),
      boton: this.crearSonido('https://cdn.pixabay.com/audio/2026/06/19/audio_7cc5dc75c8.mp3'),
    };

    this.duraciones = {
      notificacion: 1500,
      alerta: 700,
      cargando: 4000,
      cargaCompleta: 4000,
      volumen: 400,
      interruptor: 400,
      boton: 500,
    };
  }

  private crearSonido(ruta: string): HTMLAudioElement {
    const audio = new Audio(ruta);
    audio.preload = 'auto';
    audio.volume = 0.7;
    return audio;
  }

  play(nombre: string, volumen?: number): void {
    const sonido = this.sounds[nombre];
    if (!sonido) return;

    if (this.timers[nombre]) {
      clearTimeout(this.timers[nombre]);
    }

    try {
      const nivel = typeof volumen === 'number' ? Math.max(0, Math.min(1, volumen / 100)) : 0.7;
      sonido.volume = nombre === 'volumen' ? nivel : 0.7;
      sonido.pause();
      sonido.currentTime = 0;

      const promise = sonido.play();
      if (promise !== undefined) {
        promise.catch(() => {
          // Si falla (por ejemplo, autoplay bloqueado), intentamos un reload suave
          sonido.load();
          sonido.play().catch(() => {});
        });
      }

      if (nombre !== 'interruptor') {
        this.timers[nombre] = window.setTimeout(() => {
          sonido.pause();
          sonido.currentTime = 0;
        }, this.duraciones[nombre] ?? 700);
      }
    } catch (error) {
      // Ignorar errores silenciosamente
    }
  }

  stop(nombre: string): void {
    if (this.timers[nombre]) {
      clearTimeout(this.timers[nombre]);
      delete this.timers[nombre];
    }
    const sonido = this.sounds[nombre];
    if (sonido) {
      sonido.pause();
      sonido.currentTime = 0;
    }
  }
}
