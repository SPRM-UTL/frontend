import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {

  const platformId = inject(PLATFORM_ID);

  let token = '';
  let tokenIsValid = false;

  if (isPlatformBrowser(platformId)) {
    token = localStorage.getItem('token') ?? '';
    const expiration = localStorage.getItem('token_exp');
    const expirationTime = expiration ? new Date(expiration).getTime() : NaN;

    tokenIsValid = !!token && !Number.isNaN(expirationTime) && expirationTime > Date.now();

    if (token && !tokenIsValid) {
      localStorage.removeItem('token');
      localStorage.removeItem('nombre');
      localStorage.removeItem('userId');
      localStorage.removeItem('token_exp');
    }
  }

  if (tokenIsValid) {

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
