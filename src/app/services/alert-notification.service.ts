import { Injectable, signal } from '@angular/core';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertNotification {
  id: number;
  type: AlertType;
  message: string;
  timestamp: Date;
  icon?: string;
  dismissed?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AlertNotificationService {
  private alertsSignal = signal<AlertNotification[]>([]);
  readonly alerts = this.alertsSignal.asReadonly();

  private nextId = 1;

  constructor() {}

  show(message: string, type: AlertType = 'info', icon?: string) {
    const newAlert: AlertNotification = {
      id: this.nextId++,
      type,
      message,
      timestamp: new Date(),
      icon: icon || this.getDefaultIcon(type),
      dismissed: false
    };

    this.alertsSignal.update(alerts => [newAlert, ...alerts]);
  }

  success(message: string, icon?: string) {
    this.show(message, 'success', icon);
  }

  error(message: string, icon?: string) {
    this.show(message, 'error', icon);
  }

  warning(message: string, icon?: string) {
    this.show(message, 'warning', icon);
  }

  info(message: string, icon?: string) {
    this.show(message, 'info', icon);
  }

  dismiss(id: number) {
    this.alertsSignal.update(alerts =>
      alerts.map(a => a.id === id ? { ...a, dismissed: true } : a)
    );
  }

  private getDefaultIcon(type: AlertType): string {
    switch (type) {
      case 'success': return '/icons/check.svg';
      case 'error': return '/icons/triangle-alert.svg';
      case 'warning': return '/icons/triangle-alert.svg';
      case 'info': return '/icons/info.svg';
      default: return '/icons/bell.svg';
    }
  }
}
