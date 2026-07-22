export interface AparatosConsumoHistorico {
  sk_consumo_id: number,
  sk_aparato_id: number,
  corriente_a: number,
  potencia_w: number,
  energia_wh: number,
  fecha_medicion: string
}

export interface ApiResponseConsumo {
  success: boolean;
  status: number;
  data: AparatosConsumoHistorico[];
}

export interface AparatoConsumoPunto {
  periodo: string;
  potencia_promedio_w: number;
  corriente_promedio_a: number;
  energia_consumida_wh: number;
}

export interface ConsumoPorDispositivo {
  aparato: string;
  totalEnergiaWh: number;
}

export interface AparatoConsumoResumen {
  granularidad: string;
  desde: string;
  hasta: string;
  puntos: AparatoConsumoPunto[];
}

export interface ApiResponseConsumoResumen {
  success: boolean;
  status: number;
  data: AparatoConsumoResumen;
}
