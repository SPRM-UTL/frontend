import { Dispositivo } from '../dispositivos/dispositivos.model';

export interface Habitacion {
  sk_habitacion_id: number;
  nombre_habitacion: string;
  sk_casa_id: number;
  dispositivos?: Dispositivo[];
}
