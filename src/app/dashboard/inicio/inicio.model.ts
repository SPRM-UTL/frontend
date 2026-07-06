import { Actividad } from '../../historial/actividad.model';

export interface UltimoGesto {
  nombre: string;
  icono?: string;
  accionEjecutada: string;
  timestamp?: string;
}


// Esta se queda porque calcula un agregado ('veces_utilizado') que no viene en la BD de Device
export interface AparatoUtilizado {
  sk_aparato_id: number;
  nombre_aparato: string;
  tipo_aparato: string;
  icono: string;
  veces_utilizado: number;
}

// Agrupador final de estadísticas para el HTML del Dashboard
export interface DashboardStats {
  gestosGuardados: number;
  automatizaciones: number;
  dispositivosVinculados: number;
  accionesHoy: number;
  devicesOnline: number;
  activeAutomations: number;
  userName: string;
  dispositivosActivos: number;
  estadoConexion: 'En línea' | 'Desconectado';
  ultimoGesto: UltimoGesto | null;
  aparatosUtilizados: AparatoUtilizado[];
  actividadReciente: Actividad[]; // Usamos directamente tu interfaz Actividad
}
