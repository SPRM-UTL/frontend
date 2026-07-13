import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CamaraService } from './camara.service';

@Component({
  selector: 'app-camara',
  standalone: true,
  imports: [CommonModule],
  template: `<img *ngIf="frameUrl" [src]="frameUrl" style="width:100%;max-width:480px" />`
})
export class CamaraComponent implements OnInit, OnDestroy {
  @Input() deviceKey!: string;
  frameUrl: string | null = null;

  constructor(private camaraService: CamaraService) {}

  ngOnInit() {
    this.camaraService.connect(
      this.deviceKey,
      (url) => { this.frameUrl = url; },
      (err) => console.error('Error de cámara', err)
    );
  }

  ngOnDestroy() { 
    this.camaraService.disconnect(); 
    if (this.frameUrl) {
      URL.revokeObjectURL(this.frameUrl);
    }
  }
}
