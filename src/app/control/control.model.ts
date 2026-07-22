export interface AparatoTipo {
  sk_aparato_tipo_id: number;
  nombre_tipo: string;
  icono: string;
  es_asistente: boolean;
  soporta_bluetooth: boolean;
  soporta_wifi: boolean;
  palabras_clave_busqueda: string | null;
}

export interface DispositivoControl {
  id: number;
  sk_aparato_id: number;
  nombre_aparato: string;
  tipo_aparato: string;
  icono: string;
  encendido: boolean;
  ubicacion: string;
  mac_bluetooth: string;
  nombre_bluetooth: string;
  comando_bluetooth?: string;

  // Opcionales según tipo
  volumen?: number;
  brillo?: number;
  tono?: 'warm' | 'cool';
  reproduciendo?: string;

  // Estados independientes para MultiSocket
  estado_contacto_1?: boolean;
  estado_contacto_2?: boolean;
  estado_contacto_3?: boolean;
  estado_contacto_4?: boolean;
}

// Mantener los anteriores por compatibilidad si es necesario,
// pero usaremos DispositivoControl para la lógica genérica.
export interface Categoria {
  nombre_aparato: string;
  cantidad: number;
  emoji: string;
  color: string;
  bg: string;
}

export interface Luz extends DispositivoControl {}
export interface Bocina extends DispositivoControl {}
export interface Ventilador extends DispositivoControl {}
