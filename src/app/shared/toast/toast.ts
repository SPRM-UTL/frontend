import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { Subscription } from 'rxjs';
import { LucideDynamicIcon } from '@lucide/angular';
import { getToastIcon } from '../icon-map';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class ToastComponent implements OnInit, OnDestroy {

  visible = false;
  message = '';
  type: Toast['type'] = 'info';
  icon: any = null;

  private subscription?: Subscription;
  private timeoutId?: any;
  private cdr = inject(ChangeDetectorRef);

  constructor(private toastService: ToastService) { }

  ngOnInit(): void {
    this.subscription = this.toastService.toastState$.subscribe((toast) => {
      if (toast) {
        this.showToast(toast);
      } else {
        this.visible = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }

  private showToast(toast: Toast): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);

    // Reiniciar para que la animación se dispare si ya había uno
    this.visible = false;
    this.cdr.detectChanges();

    // Pequeño delay para permitir que el navegador procese el cambio y reinicie la transición
    setTimeout(() => {
      this.message = toast.message;
      this.type = toast.type;
      this.icon = getToastIcon(toast.icon, toast.type);

      this.visible = true;
      this.cdr.detectChanges();

      if (toast.duration && toast.duration > 0) {
        this.timeoutId = setTimeout(() => {
          this.visible = false;
          this.cdr.detectChanges();
        }, toast.duration);
      }
    }, 10);
  }

}
