// cuenta.service.ts

import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { APP_CONFIG } from '../core/config/app-config';
import { ENDPOINTS } from '../core/config/endpoints';

import { isPlatformBrowser } from '@angular/common';

const BASE_URL = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.cuenta}`;


// Interfaz para el perfil del usuario desde /api/usuarios/{id}
export interface UsuarioPerfil {
  id: number;
  nombre: string;
  correo: string;
  // otros campos que pueda devolver la API
}

@Injectable({ providedIn: 'root' })
export class CuentaService {

  private platformId = inject(PLATFORM_ID);

  readonly userName  = signal('');
  readonly userEmail = signal('');

  readonly loading = signal<boolean>(false);
  readonly error   = signal<string | null>(null);


  constructor(private http: HttpClient) {}

  // Obtiene el ID del usuario desde localStorage
  private getUserId(): number | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  }
  // Carga el perfil del usuario desde /api/usuarios/{id}

  loadPerfil(): void {
    const userId = this.getUserId();
    if (!userId) {
      if(isPlatformBrowser (this.platformId)){
        this.error.set('No se encontr� el ID de usuario.');
      }
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.http.get<any>(`${BASE_URL}/${userId}`).subscribe({
      next: response => {
        const payload = response?.data ?? response;
        // Manejamos tanto minúsculas como Mayúsculas por si la API cambia
        this.userName.set(payload.nombre || payload.Nombre || '');
        this.userEmail.set(payload.correo || payload.Correo || '');
        this.loading.set(false);
      },
      error: err => {
        this.error.set('No se pudo cargar el perfil.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  // Método unificado para actualizar perfil según documentación (PUT con llaves en Mayúsculas)
  updatePerfil(datos: { Nombre?: string, Correo?: string, Contrasenia?: string }): Observable<any> {
    const userId = this.getUserId();
    if (!userId) {
      return new Observable(observer => observer.error(new Error('No hay ID de usuario')));
    }

    const payload = {
      Nombre: datos.Nombre || this.userName(),
      Correo: datos.Correo || this.userEmail(),
      Contrasenia: datos.Contrasenia || ''
    };

    return this.http.put<any>(`${BASE_URL}/${userId}`, payload).pipe(
      tap(() => {
        if (datos.Nombre) {
          this.userName.set(datos.Nombre);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('nombre', datos.Nombre);
          }
        }
        if (datos.Correo) {
          this.userEmail.set(datos.Correo);
        }
      })
    );
  }

  // Actualiza el nombre del usuario
  updateNombre(nombre: string): Observable<void> {
    return this.updatePerfil({ Nombre: nombre });
  }

  // Actualiza el correo del usuario
  updateEmail(email: string): Observable<void> {
    return this.updatePerfil({ Correo: email });
  }

  // Actualiza la contraseña
  updatePassword(password: string): Observable<void> {
    return this.updatePerfil({ Contrasenia: password });
  }
}
