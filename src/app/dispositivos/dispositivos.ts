import { Component, computed, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DevicesService } from './devices.service';   // ← minúscula
import { Device } from './device.model';

@Component({
  selector: 'app-dispositivos',
  imports: [CommonModule, FormsModule],
  templateUrl: './dispositivos.html',
  styleUrl: './dispositivos.css'
})
export class Dispositivos implements OnInit {

  private devicesService = inject(DevicesService);

  activeNav = 'dispositivos';

  readonly searchQuery = signal('');

  readonly filteredDevices = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return q
      ? this.devicesService.devices().filter(d =>
          d.name.toLowerCase().includes(q) ||
          d.room.toLowerCase().includes(q) ||
          d.status.toLowerCase().includes(q)
        )
      : this.devicesService.devices();
  });

  readonly loading = this.devicesService.loading;
  readonly error   = this.devicesService.error;

  ngOnInit(): void {
    this.devicesService.loadDevices();
  }

  setActive(nav: string): void {
    this.activeNav = nav;
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  togglePower(device: Device): void {
    this.devicesService.togglePower(device);
  }
}