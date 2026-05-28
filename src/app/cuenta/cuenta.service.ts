// cuenta.service.ts
//
// TODO (backend):
//   1. Inyectar HttpClient y reemplazar los bloques MOCK.
//   2. Actualizar BASE_URL con la URL real del API.

import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
// import { HttpClient } from '@angular/common/http';

const BASE_URL = '/api/cuenta';

export interface UserProfile {
  nombre: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class CuentaService {

  readonly userName  = signal('JOSUÉ ARMANDO RIVERA HERNÁNDEZ');
  readonly userEmail = signal('riverhernan16idgs@gmail.com');

  readonly loading = signal<boolean>(false);
  readonly error   = signal<string | null>(null);

  // constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────
  //  PATCH /api/cuenta/nombre
  // ─────────────────────────────────────────
  updateNombre(nombre: string): Observable<void> {
    // ── MOCK ──────────────────────────────────────────────────
    this.userName.set(nombre);
    return of(undefined);

    // ── BACKEND (descomentar) ─────────────────────────────────
    // return this.http.patch<void>(`${BASE_URL}/nombre`, { nombre }).pipe(
    //   tap(() => this.userName.set(nombre))
    // );
  }

  // ─────────────────────────────────────────
  //  PATCH /api/cuenta/email
  // ─────────────────────────────────────────
  updateEmail(email: string): Observable<void> {
    // ── MOCK ──────────────────────────────────────────────────
    this.userEmail.set(email);
    return of(undefined);

    // ── BACKEND (descomentar) ─────────────────────────────────
    // return this.http.patch<void>(`${BASE_URL}/email`, { email }).pipe(
    //   tap(() => this.userEmail.set(email))
    // );
  }

  // ─────────────────────────────────────────
  //  PATCH /api/cuenta/password
  // ─────────────────────────────────────────
  updatePassword(password: string): Observable<void> {
    // ── MOCK ──────────────────────────────────────────────────
    console.log('Password change requested');
    return of(undefined);

    // ── BACKEND (descomentar) ─────────────────────────────────
    // return this.http.patch<void>(`${BASE_URL}/password`, { password });
  }
}