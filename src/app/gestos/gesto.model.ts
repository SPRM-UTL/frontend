// gesto.model.ts

export interface Gesto {
  id: number;
  nombre: string;
  emoji: string;
  dispositivo: string;
  dispositivoIconColor: string;
  dispositivoIconEmoji: string;
  accion: string;
  tiempo: string;
  estado: 'Activo' | 'Pausado';
}

export interface GestoEstadoUpdate {
  id: number;
  estado: 'Activo' | 'Pausado';
}