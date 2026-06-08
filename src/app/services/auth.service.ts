import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router'; // Necesario para redirigir al cerrar sesión
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private apiUrl = 'http://localhost:5295/api/Auth';

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
        //Guardar token y calcular expiración
        if (response && response.token) { 
          localStorage.setItem('token', response.token);
          
          // Calculamos expiración: 30 minutos desde ahora (según tu middleware)
          const expirationDate = new Date(Date.now() + 30 * 60 * 1000);
          localStorage.setItem('token_exp', expirationDate.toString());
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
    }
    this.router.navigate(['/login']);
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