import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../services/loader.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Ajusta la ruta según donde estés

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {

  private routerSub!: Subscription;
  private authService = inject(AuthService);
  constructor(
    private router: Router,
    private loaderService: LoaderService
  ) {}
  // Este es el método que disparará tu HTML
  onLogout() {
    this.authService.logout();
  }
  ngOnInit() {
    this.routerSub = this.router.events.subscribe(event => {

      if (event instanceof NavigationStart) {
        this.loaderService.show();
      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => this.loaderService.hide(), 400);
      }
    });
  }

  ngOnDestroy() {
    this.routerSub.unsubscribe();
  }
}