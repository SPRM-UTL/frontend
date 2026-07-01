import { Injectable } from '@angular/core';
import { Howl, Howler } from 'howler';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private sounds: { [key: string]: Howl } = {};

  constructor() {
    this.precargarSonidos();
  }

  private precargarSonidos(): void {
    this.sounds = {

      notificacion: new Howl({
        src: ['https://cdn.pixabay.com/audio/2022/03/10/audio_270f815cac.mp3'],
        html5: true,
        volume: 0.6,
      }),

      alerta: new Howl({
        src: ['https://cdn.pixabay.com/audio/2021/08/09/audio_88447e769a.mp3'],
        html5: true,
        volume: 0.8,
      }),

      cargando: new Howl({
        src: ['https://cdn.pixabay.com/audio/2022/01/18/audio_d1718ab41b.mp3'],
        html5: true,
        volume: 0.4,
      }),

      cargaCompleta: new Howl({
        src: ['https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3'],
        html5: true,
        volume: 0.5,
      }),

    };
  }

  play(nombre: string): void {
    if (this.sounds[nombre]) {
      this.sounds[nombre].play();
    } else {
      console.warn(`Sonido "${nombre}" no encontrado`);
    }
  }

  stop(nombre: string): void {
    this.sounds[nombre]?.stop();
  }

  volumenGlobal(vol: number): void {
    Howler.volume(vol);
  }

  silenciar(estado: boolean): void {
    Howler.mute(estado);
  }
}
