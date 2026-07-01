import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LoaderService } from '../../services/loader.service';
import { AudioService }  from '../../services/audio.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.html',
  styleUrl: './loader.css'
})
export class LoaderComponent implements OnDestroy {

  public  loaderService = inject(LoaderService);
  private audioService  = inject(AudioService);

  private primeraVez   = true;
  private sonidoReproducido = false;
  private loaderSub!: Subscription;

  constructor() {
    this.loaderSub = this.loaderService.loading$.subscribe(cargando => {
      if (this.primeraVez) {
        this.primeraVez = false;
        return;
      }

      if (cargando && !this.sonidoReproducido) {
        this.sonidoReproducido = true;
        this.audioService.play('cargando');
      }
    });
  }

  ngOnDestroy(): void {
    this.loaderSub.unsubscribe();
  }
}
