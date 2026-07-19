export interface Dispositivo {

  sk_aparato_id: number;

  nombre_aparato: string;

  tipo_aparato: string;

  accion_nombre: string;

  comando_bluetooth: string;

  icono: string;

  mac_bluetooth: string;

  nombre_bluetooth: string;

  volumen?: number;

  sk_habitacion_id?: number | null;

  fecha_sincronizacion: string | null;

  estado_encendido?: boolean;
}
