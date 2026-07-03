import { Component, OnDestroy, inject } from '@angular/core';
import {
  Router,
  RouterOutlet,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastComponent } from './shared/toast/toast';
import { LoaderComponent } from './shared/loader/loader';
import { LoaderService } from './services/loader.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, LoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnDestroy {
  private router = inject(Router);
  private loaderService = inject(LoaderService);
  private routerSub: Subscription;
  private safetyTimer?: any;
  private readonly loaderSafetyTimeoutMs = 8000;
  private readonly loaderHideDelayMs = 3400;

  constructor() {
    // El componente raíz NUNCA se destruye durante la navegación,
    // así que es el lugar correcto para gestionar el loader global.
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loaderService.show();
        // Timeout de seguridad: si en 8 segundos no termina, ocultar el loader
        clearTimeout(this.safetyTimer);
        this.safetyTimer = setTimeout(() => this.loaderService.hide(), this.loaderSafetyTimeoutMs);
      } else if (event instanceof NavigationEnd) {
        clearTimeout(this.safetyTimer);
        setTimeout(() => this.loaderService.hide(), this.loaderHideDelayMs);
      } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
        clearTimeout(this.safetyTimer);
        this.loaderService.hide();
      }
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    clearTimeout(this.safetyTimer);
  }
}

