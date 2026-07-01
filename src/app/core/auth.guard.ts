import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const requireActiveSession = (returnUrl: string) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  authService.clearSession();

  return router.createUrlTree(['/sesion-expirada'], {
    queryParams: returnUrl && !returnUrl.startsWith('/sesion-expirada')
      ? { returnUrl }
      : undefined,
  });
};

export const authGuard: CanActivateFn = (_route, state) =>
  requireActiveSession(state.url);

export const authChildGuard: CanActivateChildFn = (_route, state) =>
  requireActiveSession(state.url);
