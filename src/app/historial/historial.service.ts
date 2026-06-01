import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Actividad } from '../historial/actividad.model'; // Asegura que esta ruta sea la correcta

// Definimos la estructura exacta que el middleware entrega
interface ApiResponse {
  success: boolean;
  status: number;
  data: Actividad[];
}

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7299/api/Fact_Historico_Actividad';

  // Declaramos correctamente los signals dentro de la clase para quitar los errores en rojo
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public actividades = signal<Actividad[]>([]);

  loadHistorial(): void {
    this.loading.set(true);
    this.error.set(null);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Usamos el operador .pipe(map(...)) para extraer la propiedad .data antes de suscribirnos
    this.http.get<ApiResponse>(this.apiUrl, { headers })
      .pipe(
        map(response => response.data) // 🌟 Aquí entramos a la caja "data" que manda el middleware
      )
      .subscribe({
        next: (data: Actividad[]) => {
          this.actividades.set(data); // Guardamos solo el arreglo en el signal
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error al cargar historial', err);
          this.error.set('No se pudo cargar el historial de actividades.');
          this.loading.set(false);
        }
      });
  }
}