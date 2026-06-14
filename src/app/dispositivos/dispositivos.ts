import { Component, computed, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DevicesService } from './devices.service';
import { Device } from './device.model';
import {
  LucideLightbulb,
  LucideTv,
  LucideSpeaker,
  LucideCamera,
  LucideLock,
  LucideFan,
  LucideWifi
} from '@lucide/angular';

@Component({
  selector: 'app-dispositivos',
  standalone: true, // Asegúrate de tener esto si usas Angular 17+
  imports: [CommonModule, FormsModule,
    LucideLightbulb,
    LucideTv,
    LucideSpeaker,
    LucideCamera,
    LucideLock,
    LucideFan,
    LucideWifi],
  templateUrl: './dispositivos.html',
  styleUrl: './dispositivos.css'
})
export class Dispositivos implements OnInit {

  private devicesService = inject(DevicesService);

  activeNav = 'dispositivos';
  readonly searchQuery = signal('');

  // La señal de dispositivos expuesta directamente para acceso fácil
  readonly devices = this.devicesService.devices;

  readonly filteredDevices = computed(() => {
    const allDevices = this.devices();
    
    // Verificación de seguridad: si es null, undefined o no es un array, retorna vacío
    if (!Array.isArray(allDevices)) return [];

    const q = this.searchQuery().toLowerCase().trim();

    // Si no hay búsqueda, retorna todo el array
    if (!q) return allDevices;

    return allDevices.filter(device => 
      device.nombre_aparato?.toLowerCase().includes(q) ||
      device.tipo_aparato?.toLowerCase().includes(q) ||
      device.nombre_bluetooth?.toLowerCase().includes(q)
    );
  });

  readonly loading = this.devicesService.loading;
  readonly error = this.devicesService.error;

  ngOnInit(): void {
    this.devicesService.loadDevices();
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }
}