export interface Gesto {
  skGestoId:              number;
  bkGestoId:              number;
  nombreGesto:            string;
  identificadorIa:        number;
  nivelConfianzaMinimo:   number;
  tipoDisparadorNombre:   string | null;
}

export interface GestoEstadoUpdate {
  skGestoId:            number;
  tipoDisparadorNombre: string | null;
}