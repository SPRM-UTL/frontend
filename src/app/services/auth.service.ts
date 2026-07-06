import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { APP_CONFIG } from '../core/config/app-config';
import { ENDPOINTS } from '../core/config/endpoints';
import { LoaderService } from './loader.service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private apiUrl = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.auth}`;
  private readonly sessionKeys = ['token', 'nombre', 'userId', 'token_exp', 'user_image', 'user_email'];

  readonly showLogoutModal = signal(false);


  constructor(private http: HttpClient, private router: Router, private loaderService: LoaderService) {
    if (isPlatformBrowser(this.platformId)) {
      setInterval(() => {
        this.checkTokenExpiration();
      }, 60000);
    }
  }
  // En tu AuthService.ts
  login(correo: string, contrasenia: string): Observable<any> {
    const body = { correo, contrasenia };

    return this.http.post<any>(`${this.apiUrl}/login`, body).pipe(
      tap(response => {
        const payload = response?.data ?? response;
        const data = payload?.data ?? payload;

        const token = data?.token ?? payload?.token ?? '';
        const nombre = data?.nombre ?? payload?.nombre ?? data?.name ?? payload?.name
          ?? data?.usuario?.nombre ?? payload?.usuario?.nombre
          ?? data?.user?.nombre ?? payload?.user?.nombre
          ?? data?.user?.name ?? payload?.user?.name
          ?? '';
        const userId = data?.id ?? payload?.id ?? data?.userId ?? payload?.userId
          ?? data?.usuario?.id ?? payload?.usuario?.id
          ?? data?.user?.id ?? payload?.user?.id
          ?? data?.user?.userId ?? payload?.user?.userId;

        if (isPlatformBrowser(this.platformId)) {
          if (token) {
            localStorage.setItem('token', token);
            const expirationDate = new Date(Date.now() + 30 * 60 * 1000);
            localStorage.setItem('token_exp', expirationDate.toISOString());
          }

          if (nombre) {
            localStorage.setItem('nombre', nombre);
          }

          if (userId) {
            localStorage.setItem('userId', String(userId));
          }

          const userEmail = data?.correo ?? payload?.correo ?? data?.email ?? payload?.email ?? correo;
          if (userEmail) {
            localStorage.setItem('user_email', userEmail);
          }

          const rutaImagen = data?.ruta_imagen ?? payload?.ruta_imagen ?? data?.user?.ruta_imagen ?? '';
          if (rutaImagen) {
            localStorage.setItem('user_image', rutaImagen);
          }
        }
      })
    );
  }

  register(usuario: any)
  {
    return this.http.post(
      `${this.apiUrl}/register`,
      usuario
    );
  }

  confirmLogout() {
    this.showLogoutModal.set(true);
  }

  cancelLogout() {
    this.showLogoutModal.set(false);
  }

  logout() {
    this.showLogoutModal.set(false);
    // Ocultamos el loader ANTES de navegar para evitar que quede colgado
    // cuando el Dashboard se destruye y pierde su suscripción al router
    this.loaderService.hide();
    this.clearSession();
    this.router.navigate(['/']);
  }

  clearSession() {
    if (isPlatformBrowser(this.platformId)) {
      this.sessionKeys.forEach(key => localStorage.removeItem(key));
    }
  }

  // 2. MÉTODO PARA OBTENER FECHA: Decodifica el token (ejemplo simple)
  getTokenExpirationDate(): Date | null {
    if (!isPlatformBrowser(this.platformId)) return null; // 👈 ESTO EVITA EL ERROR

    const exp = localStorage.getItem('token_exp');
    if (!exp) return null;

    const expirationDate = new Date(exp);
    return Number.isNaN(expirationDate.getTime()) ? null : expirationDate;
  }

  getToken(): string {
    if (!isPlatformBrowser(this.platformId)) return '';

    return localStorage.getItem('token') ?? '';
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const expirationDate = this.getTokenExpirationDate();

    return !!token && !!expirationDate && expirationDate.getTime() > Date.now();
  }

  expireSession(returnUrl: string = this.router.url) {
    this.showLogoutModal.set(false);
    this.loaderService.hide();
    this.clearSession();

    if (!this.router.url.startsWith('/sesion-expirada')) {
      const queryParams = returnUrl && !returnUrl.startsWith('/sesion-expirada')
        ? { returnUrl }
        : undefined;

      this.router.navigate(['/sesion-expirada'], { queryParams });
    }
  }

  // 3. TU MÉTODO DE VERIFICACIÓN
  checkTokenExpiration() {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = this.getToken();
    const isProtectedRoute = this.router.url.startsWith('/dashboard');

    if ((token || isProtectedRoute) && !this.isAuthenticated()) {
      this.expireSession();
    }
  }
}
