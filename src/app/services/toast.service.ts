import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastSubject = new Subject<Toast>();

  toastState$ = this.toastSubject.asObservable();

  show(message: string, type: Toast['type'], duration?: number, icon?: string) {
    this.toastSubject.next({ message, type, duration, icon });
  }

  success(message: string, duration?: number, icon?: string) {
    this.show(message, 'success', duration, icon);
  }

  error(message: string, duration?: number, icon?: string) {
    this.show(message, 'error', duration, icon);
  }

  warning(message: string, duration?: number, icon?: string) {
    this.show(message, 'warning', duration, icon);
  }

  info(message: string, duration?: number, icon?: string) {
    this.show(message, 'info', duration, icon);
  }
}
