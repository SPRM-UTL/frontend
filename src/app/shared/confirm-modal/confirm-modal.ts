import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmModalService } from '../../services/confirm-modal.service';
import { LucideDynamicIcon } from '@lucide/angular';
import { getDeviceIcon } from '../icon-map';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css'
})
export class ConfirmModalComponent {
  private confirmService = inject(ConfirmModalService);

  readonly state = this.confirmService.state;

  onConfirm() {
    this.confirmService.handleAction(true);
  }

  onCancel() {
    this.confirmService.handleAction(false);
  }

  getDeviceIcon = getDeviceIcon;
}
