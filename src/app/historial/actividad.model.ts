// actividad.model.ts

export interface Actividad {
  id: number;
  hora: string;
  accion: string;
  dispositivo: string;
  dispositivoEmoji: string;
  dispositivoColor: string;
  estado: 'Ejecutado' | 'Pendiente' | 'Error';
  metodo: 'Gesto' | 'App móvil' | 'Automatización';
}