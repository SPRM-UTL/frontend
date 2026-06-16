// ============================================
// Categorías mostradas en la parte superior
// ============================================
export interface Categoria {

  // Nombre mostrado al usuario
  nombre_aparato: string;

  // Cantidad de dispositivos
  cantidad: number;

  // Emoji de la categoría
  emoji: string;

  // Color principal
  color: string;

  // Color de fondo
  bg: string;
}

// ============================================
// Luces
// ============================================
export interface Luz {

  // Id único de la BD
  id: number;

  // Nombre visible
  nombre_aparato: string;

  // Ubicación física
  ubicacion: string;

  // Encendido / apagado
  encendido: boolean;

  // Brillo 0 - 100
  brillo: number;

  // Temperatura de color
  tono: 'warm' | 'cool';
}

// ============================================
// Bocinas
// ============================================
export interface Bocina {

  // Id único
  id: number;

  // Nombre
  nombre_aparato: string;

  // Ubicación
  ubicacion: string;

  // Estado
  encendido: boolean;

  // Volumen
  volumen: number;

  // Música actual
  reproduciendo: string;
}

// ============================================
// Ventiladores
// ============================================
export interface Ventilador {

  // Id único
  id: number;

  // Nombre
  nombre_aparato: string;

  // Ubicación
  ubicacion: string;

  // Encendido
  encendido: boolean;

  // Velocidad 1-5
  velocidad: number;
}