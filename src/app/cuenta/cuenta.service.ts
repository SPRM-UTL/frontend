// cuenta.service.ts

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { APP_CONFIG } from '../core/config/app-config'; 
import { ENDPOINTS } from '../core/config/endpoints';
const BASE_URL = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.historial}`;

export interface UserProfile {
  nombre: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class CuentaService {

  readonly userName  = signal('');
  readonly userEmail = signal('');

  readonly loading = signal<boolean>(false);
  readonly error   = signal<string | null>(null);

  constructor(private http: HttpClient) {}
 
  // ─────────────────────────────────────────
  //  GET /api/cuenta/perfil
  //  Carga los datos del usuario al iniciar.
  // ─────────────────────────────────────────
  loadPerfil(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<UserProfile>(`${BASE_URL}/perfil`).subscribe({
      next: perfil => {
        this.userName.set(perfil.nombre);
        this.userEmail.set(perfil.email);
        this.loading.set(false);
      },
      error: err => {
        this.error.set('No se pudo cargar el perfil.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  // ─────────────────────────────────────────
  //  PATCH /api/cuenta/nombre
  // ─────────────────────────────────────────
  updateNombre(nombre: string): Observable<void> {
    return this.http.patch<void>(`${BASE_URL}/nombre`, { nombre }).pipe(
      tap(() => this.userName.set(nombre))
    );
  }

  // ─────────────────────────────────────────
  //  PATCH /api/cuenta/email
  // ─────────────────────────────────────────
  updateEmail(email: string): Observable<void> {
    return this.http.patch<void>(`${BASE_URL}/email`, { email }).pipe(
      tap(() => this.userEmail.set(email))
    );
  }

  // ─────────────────────────────────────────
  //  PATCH /api/cuenta/password
  // ─────────────────────────────────────────
  updatePassword(password: string): Observable<void> {
    return this.http.patch<void>(`${BASE_URL}/password`, { password });
  }
}