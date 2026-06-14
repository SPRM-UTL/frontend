export interface Gesto {
  sk_gesto_id: number;
  bk_gesto_id: number;
  nombre_gesto: string;
  identificador_ia: number;
  nivel_confianza_minimo: number;
  tipo_disparador_nombre: string;
  sk_aparato_id: number | null;

  estado?: 'Activo' | 'Pausado';
  icono?: string;
  dispositivoIconColor?: string;
  dispositivoIconEmoji?: string;
  tiempo?: string;
}