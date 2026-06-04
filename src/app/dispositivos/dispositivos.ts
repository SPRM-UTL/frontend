import { Component, computed, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DevicesService } from './devices.service';
import { Device } from './device.model';

@Component({
  selector: 'app-dispositivos',
  imports: [CommonModule, FormsModule],
  templateUrl: './dispositivos.html',
  styleUrl: './dispositivos.css'
})
export class Dispositivos implements OnInit {

  private devicesService = inject(DevicesService);

  readonly searchQuery = signal('');

  readonly filteredDevices = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return q
      ? this.devicesService.devices().filter(d =>
          d.nombreAparato.toLowerCase().includes(q) ||
          d.tipoAparato.toLowerCase().includes(q)   ||
          d.accionNombre.toLowerCase().includes(q)
        )
      : this.devicesService.devices();
  });

  readonly loading = this.devicesService.loading;
  readonly error   = this.devicesService.error;

  ngOnInit(): void { this.devicesService.loadDevices(); }

  onSearch(value: string): void { this.searchQuery.set(value); }

  togglePower(device: Device): void { this.devicesService.togglePower(device); }
}