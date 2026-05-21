import { Component, OnInit } from '@angular/core';
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

  message = '';

  type: Toast['type'] = 'info';

  constructor(private toastService: ToastService) { }

  ngOnInit(): void {

    this.toastService.toastState$
      .subscribe((toast) => {

        this.message = toast.message;
        this.type = toast.type;

        this.visible = true;

        setTimeout(() => {
          this.visible = false;
        }, 3000);
      });
  }
}