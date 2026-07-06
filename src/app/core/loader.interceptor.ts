import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoaderService } from '../services/loader.service';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);

  // Solo mostrar loader si tiene la cabecera X-Show-Loader
  if (req.headers.has('X-Show-Loader')) {
    const showSound = req.headers.get('X-Show-Loader') === 'with-sound';
    const cleanReq = req.clone({
      headers: req.headers.delete('X-Show-Loader')
    });

    loaderService.show(showSound);
    return next(cleanReq).pipe(
      finalize(() => loaderService.hide())
    );
  }

  return next(req);
};
