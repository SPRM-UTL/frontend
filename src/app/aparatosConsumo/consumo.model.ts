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
