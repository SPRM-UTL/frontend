// ─────────────────────────────────────────────
//  device.model.ts
//  Modelo de dominio para un dispositivo smart-home.
//  Tu compañero de backend sólo necesita hacer que
//  el API devuelva objetos que implementen esta forma.
// ─────────────────────────────────────────────

export interface Device {
  id: number;
  name: string;
  room: string;
  status: string;
  statusClass: string;
  power: string;
  lastActive: string;
  color: string;
  icon: string;
  powered: boolean;
}

// DTO que el backend enviará/recibirá para actualizar el estado de encendido
export interface DevicePowerUpdate {
  id: number;
  powered: boolean;
}