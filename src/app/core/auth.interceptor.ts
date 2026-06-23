import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { AlertNotificationService } from '../services/alert-notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const alertService = inject(AlertNotificationService);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        if (isPlatformBrowser(platformId)) {
          localStorage.removeItem('token');
        }
        router.navigateByUrl('/');
        alertService.warning('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
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
