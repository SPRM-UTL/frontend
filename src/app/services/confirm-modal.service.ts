import { Injectable, signal } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmModalService {
  private confirmSubject = new Subject<boolean>();

  readonly state = signal<{
    isOpen: boolean;
    options: ConfirmOptions | null;
  }>({
    isOpen: false,
    options: null
  });

  confirm(options: ConfirmOptions): Observable<boolean> {
    this.state.set({
      isOpen: true,
      options: {
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        type: 'danger',
        icon: 'trash-2',
        ...options
      }
    });

    this.confirmSubject = new Subject<boolean>();
    return this.confirmSubject.asObservable();
  }

  handleAction(result: boolean) {
    this.state.update(s => ({ ...s, isOpen: false }));
    this.confirmSubject.next(result);
    this.confirmSubject.complete();
  }
}
