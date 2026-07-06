import { Habitacion } from '../habitaciones/habitaciones.model';

export interface Casa {
  sk_casa_id: number;
  nombre_casa: string;
  habitaciones?: Habitacion[];
}
