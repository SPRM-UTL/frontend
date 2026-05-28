// control.model.ts

export interface Categoria {
  nombre: string;
  cantidad: number;
  emoji: string;
  color: string;
  bg: string;
}

export interface Luz {
  id: number;
  nombre: string;
  ubicacion: string;
  encendido: boolean;
  brillo: number;
  tono: 'warm' | 'cool';
}

export interface Tv {
  id: number;
  nombre: string;
  ubicacion: string;
  encendido: boolean;
  nowPlaying: string;
  volumen: number;
  app: string;
  apps: string[];
}

export interface Ac {
  id: number;
  nombre: string;
  ubicacion: string;
  encendido: boolean;
  temp: number;
  modo: 'cool' | 'heat' | 'auto';
  humedad: number;
}