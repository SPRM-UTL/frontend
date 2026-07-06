import { AudioService } from './audio.service';

describe('AudioService', () => {
  it('debe usar sonidos locales en vez de URLs externas', () => {
    const service = new AudioService();
    const sonido = service['sounds']['notificacion'] as any;
    const src = sonido?._src?.[0] ?? '';

    expect(src).toContain('/audio/notificacion.wav');
  });
});
