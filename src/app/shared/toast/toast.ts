import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class ToastComponent implements OnInit {

  visible = false;
  isClosing = false;
  message = '';
  type: Toast['type'] = 'info';
  icon = '';
  private timeoutId: any;
  private closingTimeoutId: any;

  constructor(
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  ngOnInit(): void {

    this.toastService.toastState$
      .subscribe((toast) => {
        this.zone.run(() => {
          if (this.timeoutId) clearTimeout(this.timeoutId);
          if (this.closingTimeoutId) clearTimeout(this.closingTimeoutId);

          this.message = toast.message;
          this.type = toast.type;

          // Asignar icono por defecto si no se provee uno
          if (toast.icon) {
            this.icon = toast.icon;
          } else {
            switch (this.type) {
              case 'success': this.icon = '/icons/check.svg'; break;
              case 'error':   this.icon = '/icons/triangle-alert.svg'; break;
              case 'warning': this.icon = '/icons/triangle-alert.svg'; break;
              default:        this.icon = '/icons/sparkles.svg'; break;
            }
          }

          this.visible = true;
          this.isClosing = false;
          this.cdr.detectChanges();

        this.timeoutId = setTimeout(() => {
          this.close();
        }, toast.duration || 3000);
        });
      });
  }

  close() {
    if (this.isClosing || !this.visible) return;
    if (this.timeoutId) clearTimeout(this.timeoutId);

    this.isClosing = true;
    this.cdr.detectChanges();

    this.closingTimeoutId = setTimeout(() => {
      this.visible = false;
      this.isClosing = false;
      this.cdr.detectChanges();
    }, 500); // Un poco más de tiempo para asegurar la animación
  }
}
