import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { authInterceptor } from './core/auth.interceptor';
import { tokenInterceptor } from './core/token.interceptor';
import { loaderInterceptor } from './core/loader.interceptor';
import { provideLucideIcons } from '@lucide/angular';
import { ALL_ICONS } from './shared/icon-map';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([tokenInterceptor, authInterceptor, loaderInterceptor])),
    provideLucideIcons(...ALL_ICONS)
  ]
};
