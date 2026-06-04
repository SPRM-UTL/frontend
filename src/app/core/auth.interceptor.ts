import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  return next(req).pipe(
    catchError((err) => {
    if (err.status === 401) {

        if (isPlatformBrowser(platformId)) {
          localStorage.removeItem('token');
        }

        router.navigateByUrl('/');
      }
      return throwError(() => err);
    })
  );
};