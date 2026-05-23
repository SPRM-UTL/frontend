import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //private apiUrl = 'https://localhost:7068/api/Auth';
  private apiUrl = 'https://localhost:7299/api/Auth';

  constructor(private http: HttpClient) { }

  login(correo: string, contrasenia: string): Observable<any> {

    const body = {
      correo,
      contrasenia
    };

    return this.http.post(`${this.apiUrl}/login`, body);
  }

  register(usuario: any)
  {
    return this.http.post(
      `${this.apiUrl}/register`,
      usuario
    );
  }
}