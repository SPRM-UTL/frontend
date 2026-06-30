import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AlertNotificationService } from '../services/alert-notification.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const alertService = inject(AlertNotificationService);
  const authService = inject(AuthService);
  const isAuthRequest = /\/api\/auth\/(login|register)\b/i.test(req.url);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401 && !isAuthRequest) {
        authService.expireSession();
      } else if (err.status === 0) {
        alertService.error('No se pudo establecer conexión con el servidor.');
      } else if (err.status >= 500) {
        alertService.error('Error interno del servidor. Por favor, intenta más tarde.');
      } else if (err.status >= 400 && err.status < 500) {
        // Mejorar manejo de errores 4xx extrayendo el mensaje del backend
        const errorMessage = err.error?.message || err.error?.error || err.error || 'Ocurrió un error en la solicitud.';
        const textMessage = typeof errorMessage === 'string' ? errorMessage : 'Datos de solicitud inválidos.';
        alertService.error(textMessage);
      } else {
        alertService.error('Ocurrió un error inesperado.');
      }

      return throwError(() => err);
    })
  );
};
