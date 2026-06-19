export interface Gesto {
  sk_gesto_id: number;
  bk_gesto_id: number;
  nombre_gesto: string;
  identificador_ia: number;
  nivel_confianza_minimo: number;
  tipo_disparador_nombre: string;
  sk_aparato_id: number | null;

  estado?: 'Activo' | 'Pausado';
  activo?: boolean;
  icono?: string;
  dispositivoIconColor?: string;
  dispositivoIconEmoji?: string;
  tiempo?: string;
  descripcion?: string;
  observaciones?: string;

  // Nuevos campos según guía
  duracion_segundos?: number;
  iluminacion_requerida?: string;
  distancia_minima_m?: number;
  distancia_maxima_m?: number;
  precision_ia?: string;
  recomendaciones?: string[];
  fotos?: string[];
  videos?: string[];
  multimedia?: {
    fotos: string[];
    video_url?: string;
    video_duracion?: string;
  };
}
