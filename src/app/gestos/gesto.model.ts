export interface GestoMedia {
  sk_media_id: number;
  url_archivo: string;
  tipo_media: number; // 1: Foto, 2: Video
  extension: string;
}

export interface GestoDetalle {
  sk_gesto_detalle_id: number;
  sk_gesto_id: number;
  nombre_gesto: string;
  duracion_segundos: number;
  iluminacion_recomendada: string;
  distancia_recomendada: string;
  medios_referencia: GestoMedia[];
}

export interface Gesto {
  sk_gesto_id: number;
  bk_gesto_id: number;
  nombre_gesto: string;
  identificador_ia: number;
  nivel_confianza_minimo: number;
  tipo_disparador_nombre: string;
  sk_aparato_id: number | null;
  contacto_outlet?: number | null;

  estado?: 'Activo' | 'Pausado';
  activo?: boolean;
  icono?: string;
  dispositivoIconColor?: string;
  dispositivoIconEmoji?: string;
  tiempo?: string;
  descripcion?: string;
  observaciones?: string;

  // Campos para compatibilidad con el template y detalles dinámicos
  duracion_segundos?: number;
  iluminacion_requerida?: string;
  distancia_minima_m?: number;
  distancia_maxima_m?: number;
  precision_ia?: string;
  recomendaciones?: string[];
  videos?: string[];
  multimedia?: {
    fotos: string[];
    video_url?: string;
    video_duracion?: string;
  };

  // El detalle completo cargado de la API
  detalle?: GestoDetalle;
}
