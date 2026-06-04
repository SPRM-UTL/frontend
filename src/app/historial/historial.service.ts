import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
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

  this.http.get<ApiResponse>(this.apiUrl)
    .pipe(
      map(response => response.data)
    )
    .subscribe({

      next: (data: Actividad[]) => {

        this.actividades.set(data);

        this.loading.set(false);
      },

      error: (err) => {

        console.error(err);

        this.error.set(
          'No se pudo cargar el historial.'
        );

        this.loading.set(false);
      }
    });
  }
}