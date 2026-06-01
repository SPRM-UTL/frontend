export interface Actividad {
  id: number;
  hora: string;
  accion: string;
  dispositivo: string;
  icono: string;
  color: string;
  estado: 'Ejecutado' | 'Error';
  metodo: string;
}