import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, combineLatest } from 'rxjs';
import { LoaderService } from '../../services/loader.service';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.html',
  styleUrl: './loader.css'
})
export class LoaderComponent implements OnInit, OnDestroy {
  public loaderService = inject(LoaderService);
  private audioService = inject(AudioService);

  private cargaActiva = false;
  private loaderSub!: Subscription;

  ngOnInit(): void {
    this.loaderSub = combineLatest([
      this.loaderService.loading$,
      this.loaderService.playSound$
    ]).subscribe(([cargando, conSonido]) => {
      if (cargando && !this.cargaActiva) {
        this.cargaActiva = true;
        if (conSonido) {
          this.audioService.play('cargando');
        }
      } else if (!cargando && this.cargaActiva) {
        this.cargaActiva = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.loaderSub?.unsubscribe();
  }
}
