import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AlertNotificationService } from '../services/alert-notification.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const alertService = inject(AlertNotificationService);
  const authService = inject(AuthService);
  const isAuthRequest = /\/api\/Auth\/(login|register)\b/i.test(req.url);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401 && !isAuthRequest) {
        //authService.expireSession();
      } else if (err.status === 0) {
        alertService.error('No se pudo establecer conexión con el servidor.');
      } else if (err.status >= 500) {
        alertService.error('Error interno del servidor. Por favor, intenta más tarde.');
      } else if (err.status >= 400 && err.status < 500) {
        // Manejo mejorado de errores para evitar mostrar [object Object]
        let message = 'Ocurrió un error en la solicitud.';

        if (err.error) {
          if (typeof err.error === 'string') {
            message = err.error;
          } else if (typeof err.error.message === 'string') {
            message = err.error.message;
          } else if (typeof err.error.data === 'string') {
            message = err.error.data;
          } else if (err.error.errors && typeof err.error.errors === 'object') {
            // Manejo de errores de validación de ASP.NET Core
            const firstErrorKey = Object.keys(err.error.errors)[0];
            const firstError = err.error.errors[firstErrorKey];
            message = Array.isArray(firstError) ? firstError[0] : (typeof firstError === 'string' ? firstError : message);
          }
        }

        alertService.error(message);
      } else {
        alertService.error('Ocurrió un error inesperado.');
      }

      return throwError(() => err);
    })
  );
};
