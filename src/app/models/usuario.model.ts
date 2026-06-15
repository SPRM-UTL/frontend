export interface ApiResponse<T> {
  success: boolean;
  status: number;
  data: T;
}

export interface UsuarioData {
  id: number;
  nombre: string;
  correo: string;
}
