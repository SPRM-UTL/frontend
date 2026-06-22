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
      } else if (err.status === 0) {
        alertService.error('No se pudo establecer conexión con el servidor.');
      } else if (err.status >= 500) {
        alertService.error('Error interno del servidor. Por favor, intenta más tarde.');
      }

      return throwError(() => err);
    })
  );
};
