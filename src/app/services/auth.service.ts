import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router'; // Necesario para redirigir al cerrar sesión
import { isPlatformBrowser } from '@angular/common';
import { APP_CONFIG } from '../core/config/app-config'; 
import { ENDPOINTS } from '../core/config/endpoints';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  //private apiUrl = 'http://localhost:5295/api/Auth';
  //private apiUrl = 'https://backend-neao.onrender.com/api/Auth';
  private apiUrl = `${APP_CONFIG.apiBaseUrl}${ENDPOINTS.auth}`;
  // En tu AuthService.ts
  constructor(private http: HttpClient, private router: Router) {
    // Ejecuta la verificación cada 60 segundos automáticamente
    setInterval(() => {
      this.checkTokenExpiration();
    }, 60000);
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

        if (token) {
          localStorage.setItem('token', token);
          const expirationDate = new Date(Date.now() + 30 * 60 * 1000);
          localStorage.setItem('token_exp', expirationDate.toString());
        }

        if (nombre) {
          localStorage.setItem('nombre', nombre);
        }

        if (userId) {
          localStorage.setItem('userId', String(userId));
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

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('nombre');
      localStorage.removeItem('userId');
      localStorage.removeItem('token_exp');
    }
    this.router.navigate(['/']);
  }

  // 2. MÉTODO PARA OBTENER FECHA: Decodifica el token (ejemplo simple)
  getTokenExpirationDate(): Date | null {
    if (!isPlatformBrowser(this.platformId)) return null; // 👈 ESTO EVITA EL ERROR

    const exp = localStorage.getItem('token_exp');
    return exp ? new Date(exp) : null;
  }

  // 3. TU MÉTODO DE VERIFICACIÓN
  checkTokenExpiration() {
    const expirationDate = this.getTokenExpirationDate();
    if (expirationDate && expirationDate < new Date()) {
      this.logout();
    }
  }
}
