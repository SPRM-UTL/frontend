// cuenta.service.ts

import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { APP_CONFIG } from '../core/config/app-config';
import { ENDPOINTS } from '../core/config/endpoints';

import { isPlatformBrowser } from '@angular/common';

const BASE_URL = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.cuenta}`;

@Injectable({ providedIn: 'root' })
export class CuentaService {

  private platformId = inject(PLATFORM_ID);

  readonly userName  = signal('');
  readonly userEmail = signal('');
  readonly userImage = signal('');

  readonly loading = signal<boolean>(false);
  readonly error   = signal<string | null>(null);

  constructor(private http: HttpClient) {
    if (isPlatformBrowser(this.platformId)) {
      const storedImage = localStorage.getItem('user_image');
      if (storedImage) this.userImage.set(storedImage);

      const storedName = localStorage.getItem('nombre');
      if (storedName) this.userName.set(storedName);

      const storedEmail = localStorage.getItem('user_email');
      if (storedEmail) this.userEmail.set(storedEmail);
    }
  }

  private getUserId(): number | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  }

  private resolveImageUrl(value: string | null | undefined): string {
    if (!value) return '';

    if (/^(https?:\/\/|data:|blob:)/i.test(value)) {
      return value;
    }

    const apiBase = APP_CONFIG.apiBaseUrl.replace(/\/$/, '');
    const path = value.startsWith('/') ? value : `/${value}`;
    return `${apiBase}${path}`;
  }

  loadPerfil(): void {
    const userId = this.getUserId();
    if (!userId) {
      if(isPlatformBrowser (this.platformId)){
        this.error.set('No se encontró el ID de usuario.');
      }
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.http.get<any>(`${BASE_URL}/${userId}`).subscribe({
      next: response => {
        const payload = response?.data ?? response;
        const data = payload?.data ?? payload;

        const nombre = data.nombre || data.Nombre || data.nombre_usuario || payload.nombre || payload.Nombre || '';
        const correo = data.correo || data.Correo || data.email || data.Email || data.email_usuario || payload.correo || payload.Correo || payload.email || payload.Email || '';
        const imagen = this.resolveImageUrl(data.ruta_imagen || data.RutaImagen || data.rutaImagen || payload.ruta_imagen || payload.RutaImagen || payload.rutaImagen || '');

        this.userName.set(nombre);
        this.userEmail.set(correo);
        this.userImage.set(imagen);

        if (isPlatformBrowser(this.platformId)) {
          if (nombre) localStorage.setItem('nombre', nombre);
          if (correo) localStorage.setItem('user_email', correo);
          if (imagen) localStorage.setItem('user_image', imagen);
        }

        this.loading.set(false);
      },
      error: err => {
        this.error.set('No se pudo cargar el perfil.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  updatePerfil(datos: { Nombre?: string, Correo?: string, Contrasenia?: string, RutaImagen?: string }): Observable<any> {
    const userId = this.getUserId();
    if (!userId) {
      return new Observable(observer => observer.error(new Error('No hay ID de usuario')));
    }

    const payload: {
      Nombre: string;
      Correo: string;
      Contrasenia: string;
      RutaImagen?: string;
    } = {
      Nombre: datos.Nombre || this.userName(),
      Correo: datos.Correo || this.userEmail(),
      Contrasenia: datos.Contrasenia || ''
    };

    if (datos.RutaImagen !== undefined) {
      payload.RutaImagen = datos.RutaImagen;
    }

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
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('user_email', datos.Correo);
          }
        }
        if (datos.RutaImagen !== undefined) {
          this.userImage.set(datos.RutaImagen);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('user_image', datos.RutaImagen);
          }
        }
      })
    );
  }

  updateNombre(nombre: string): Observable<void> {
    return this.updatePerfil({ Nombre: nombre });
  }

  updateEmail(email: string): Observable<void> {
    return this.updatePerfil({ Correo: email });
  }

  updatePassword(password: string): Observable<void> {
    return this.updatePerfil({ Contrasenia: password });
  }

  uploadProfileImage(file: File): Observable<any> {
    const userId = this.getUserId();
    if (!userId) {
      return new Observable(observer => observer.error(new Error('No hay ID de usuario')));
    }

    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('usuarioId', String(userId));

    return this.http.post<any>(`${BASE_URL}/perfil/imagen`, formData).pipe(
      tap(response => {
        const payload = response?.data ?? response;
        const data = payload?.data ?? payload;
        const uploadedImage = this.resolveImageUrl(
          data?.url_imagen ||
          data?.UrlImagen ||
          data?.urlImagen ||
          data?.ruta_imagen ||
          data?.RutaImagen ||
          data?.rutaImagen ||
          ''
        );

        if (uploadedImage) {
          this.userImage.set(uploadedImage);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('user_image', uploadedImage);
          }
        }
      })
    );
  }
}
