import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlService } from './control.service';

@Component({
  selector: 'app-control',
  imports: [CommonModule],
  templateUrl: './control.html',
  styleUrl: './control.css'
})
export class Control implements OnInit {

  private controlService = inject(ControlService);

  readonly actividades = this.controlService.actividades;
  readonly loading     = this.controlService.loading;
  readonly error       = this.controlService.error;

  ngOnInit(): void { this.controlService.loadActividades(); }
}