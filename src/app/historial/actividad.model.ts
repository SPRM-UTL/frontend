export interface Actividad {
  id: number;
  hora: string;
  accion: string;
  dispositivo: string;
  icono: string;
  color: string;
  estado: 'Ejecutado' | 'Error';
  metodo: string;
  sk_aparato_id?: string;
  hora_periodo?: string | number;
}
