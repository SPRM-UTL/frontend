import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  icon?: string;
  duration?: number; // 0 para persistente
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastSubject = new Subject<Toast | null>();

  toastState$ = this.toastSubject.asObservable();

  show(message: string, type: Toast['type'], icon?: string, duration: number = 3000) {
    this.toastSubject.next({ message, type, icon, duration });
  }

  success(message: string, icon: string = 'check') {
    this.show(message, 'success', icon);
  }

  error(message: string, icon: string = 'ban') {
    this.show(message, 'error', icon);
  }

  warning(message: string, icon: string = 'triangle-alert') {
    this.show(message, 'warning', icon);
  }

  info(message: string, icon: string = 'info') {
    this.show(message, 'info', icon);
  }

  loading(message: string, icon: string = 'clock') {
    this.show(message, 'loading', icon, 0); // Persistente hasta que se llame a hide() o success()
  }

  hide() {
    this.toastSubject.next(null);
  }
}
