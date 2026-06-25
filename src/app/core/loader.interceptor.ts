import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoaderService } from '../services/loader.service';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);

  // Saltar loader
  if (req.headers.has('X-Skip-Loader')) {
    const cleanReq = req.clone({
      headers: req.headers.delete('X-Skip-Loader')
    });

    return next(cleanReq);
  }

  loaderService.show();

  return next(req).pipe(
    finalize(() => loaderService.hide())
  );
};
