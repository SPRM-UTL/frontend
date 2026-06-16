// Importa el decorador para que Angular sepa que esto es un servicio inyectable, y 'signal' para manejar estados reactivos.
import { Injectable, signal } from '@angular/core'; 
// Importa el módulo HTTP de Angular para poder hacer peticiones (GET, POST, PATCH, etc.) a un servidor externo/API.
import { HttpClient } from '@angular/common/http';
// Importa una función de RxJS que sirve para agrupar varias peticiones HTTP y esperar a que todas terminen al mismo tiempo.
import { forkJoin } from 'rxjs';
// Importa las interfaces o tipados (modelos de datos) para asegurar que la información que manejamos tenga la estructura correcta.
import { Luz, Bocina, Ventilador, Categoria } from './control.model';

// Define una constante con la ruta base de la API para no tener que escribir '/api/control' en cada petición.
const BASE_URL = 'http://localhost:5295/api/aparatos/control';

export interface ControlResponse {
  luces: Luz[];
  bocinas: Bocina[];
  ventiladores: Ventilador[];
}
export interface ApiResponse {
  success: boolean;
  status: number;
  data: ControlResponse;
}
// Decorador que registra este servicio en el sistema de inyección de dependencias de Angular a nivel global ('root').
@Injectable({ providedIn: 'root' })
export class ControlService {

  // 'readonly' evita que se reemplace la señal completa. 'signal<Categoria[]>([])' inicializa una señal reactiva con un arreglo vacío.
  readonly categorias = signal<Categoria[]>([]);
  // Crea una señal reactiva para almacenar la lista de luces conectadas.
  readonly luces      = signal<Luz[]>([]);
  // Crea una señal reactiva para almacenar la lista de televisiones.
  readonly bocinas        = signal<Bocina[]>([]);
  // Crea una señal reactiva para almacenar la lista de aires acondicionados (AC).
  readonly ventiladores        = signal<Ventilador[]>([]);

  // Señal booleana para saber si la aplicación está descargando datos (sirve para mostrar un spinner de carga en el HTML).
  readonly loading = signal<boolean>(false);
  // Señal que guarda un mensaje de error si algo sale mal, o 'null' si todo va bien.
  readonly error   = signal<string | null>(null);

  // El constructor recibe e inyecta de forma privada el servicio HttpClient de Angular para poder usar 'this.http'.
  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────
  //  GET /api/control  (carga todo de una vez)
  // ─────────────────────────────────────────
  // Método que limpia el estado anterior y arranca la descarga de todos los dispositivos.
  loadControl(): void {
    this.loading.set(true); // Cambia el estado de carga a verdadero (comienza la descarga).
    this.error.set(null);   // Limpia cualquier error del pasado antes de volver a intentar.

   this.http.get<ApiResponse>(BASE_URL)
    .subscribe({
      next: response => {

        this.luces.set(response.data.luces);
        this.bocinas.set(response.data.bocinas);
        this.ventiladores.set(response.data.ventiladores);

        this.loading.set(false);
      },
      error: err => {
          this.error.set('No se pudo cargar el control.');
          this.loading.set(false);
          console.error(err);
        }
    });
  }

  // ─────────────────────────────────────────
  //  PATCH /api/control/luces/:id
  // ─────────────────────────────────────────
  // Método para encender/apagar una luz mediante su ID.
  toggleLuz(id: number): void {
    // Hace una petición PATCH a (por ejemplo) /api/control/luces/5/toggle enviando un objeto vacío '{}'.
    this.http.patch(`${BASE_URL}/luces/${id}/toggle`, {}).subscribe({
      // 'updated' es el objeto de la luz con su nuevo estado modificado por la base de datos.
      next: (updated: any) => this.luces.update(list => list.map(l => l.id === id ? updated : l)),
      // Explicación de la línea de arriba: '.update' modifica el valor actual de la señal de luces.
      // Recorre la lista existente con '.map()'. Si encuentra la luz cuyo ID coincide, la reemplaza por la versión 'updated'.
      // Si el ID no coincide, deja la luz tal y como estaba ('l').
      error: err => { this.error.set('No se pudo cambiar el estado de la luz.'); console.error(err); }
    });
  }

  // Método para actualizar cualquier otra propiedad de una luz (ej. cambiarle el color o el brillo).
  updateLuz(updated: Luz): void {
    // Envía la luz completa modificada mediante un PATCH al endpoint con su ID (/api/control/luces/5).
    this.http.patch<Luz>(`${BASE_URL}/luces/${updated.id}`, updated).subscribe({
      // 'saved' es el objeto que el servidor guardó con éxito.
      next: saved => this.luces.update(list => list.map(l => l.id === saved.id ? saved : l)),
      // Al igual que antes, busca en la lista local de señales la luz que cambió y la reemplaza para refrescar la interfaz al instante.
      error: err => { this.error.set('No se pudo actualizar la luz.'); console.error(err); }
    });
  }

  // ─────────────────────────────────────────
  //  PATCH /api/control/bocinas/:id
  // ─────────────────────────────────────────
  // Hace exactamente lo mismo que toggleLuz, pero enfocado en el arreglo y endpoints de los Televisores.
  toggleBocina(id: number): void {
    this.http.patch(`${BASE_URL}/bocinas/${id}/toggle`, {}).subscribe({
      next: (updated: any) => this.bocinas.update(list => list.map(t => t.id === id ? updated : t)),
      error: err => { this.error.set('No se pudo cambiar el estado del Bocina.'); console.error(err); }
    });
  }

  // Hace exactamente lo mismo que updateLuz, pero actualizando el objeto de un Televisor específico.
  updateBocina(updated: Bocina): void {
    this.http.patch<Bocina>(`${BASE_URL}/bocinas/${updated.id}`, updated).subscribe({
      next: saved => this.bocinas.update(list => list.map(t => t.id === saved.id ? saved : t)),
      error: err => { this.error.set('No se pudo actualizar el Bocina.'); console.error(err); }
    });
  }

  // ─────────────────────────────────────────
  //  PATCH /api/control/acs/:id
  // ─────────────────────────────────────────
  // Hace exactamente lo mismo que los toggles anteriores, pero enfocado en los Aires Acondicionados.
  toggleVentilador(id: number): void {
    this.http.patch(`${BASE_URL}/ventiladores/${id}/toggle`, {}).subscribe({
      next: (updated: any) => this.ventiladores.update(list => list.map(a => a.id === id ? updated : a)),
      error: err => { this.error.set('No se pudo cambiar el estado del Ventilador.'); console.error(err); }
    });
  }

  // Hace exactamente lo mismo que los updates anteriores, pero guardando cambios específicos de un Aire Acondicionado (ej. cambiar temperatura).
  updateVentilador(updated: Ventilador): void {
    this.http.patch<Ventilador>(`${BASE_URL}/ventiladores/${updated.id}`, updated).subscribe({
      next: saved => this.ventiladores.update(list => list.map(a => a.id === saved.id ? saved : a)),
      error: err => { this.error.set('No se pudo actualizar el Ventilador.'); console.error(err); }
    });
  }
}