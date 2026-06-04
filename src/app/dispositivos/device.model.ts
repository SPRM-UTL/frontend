export interface Device {
  skAparatoId:      number;
  nombreAparato:    string;
  tipoAparato:      string;
  accionNombre:     string;
  comandoBluetooth: string;
}

export interface DevicePowerUpdate {
  skAparatoId:      number;
  comandoBluetooth: string;
}