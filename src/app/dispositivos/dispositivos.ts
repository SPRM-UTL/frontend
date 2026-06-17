import { Component, computed, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DevicesService } from './devices.service';
import { Device } from './device.model';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-dispositivos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dispositivos.html',
  styleUrl: './dispositivos.css'
})
export class Dispositivos implements OnInit {

  private devicesService = inject(DevicesService);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  activeNav = 'dispositivos';
  readonly searchQuery = signal('');

  readonly devices = this.devicesService.devices;
  readonly mostrarModal = signal(false);

  readonly filteredDevices = computed(() => {
    const allDevices = this.devices();
    if (!Array.isArray(allDevices)) return [];
    const q = this.searchQuery().toLowerCase().trim();
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

    // Abrir modal si viene el parámetro 'add'
    this.route.queryParams.subscribe(params => {
      if (params['add'] === 'true') {
        this.abrirModal();
      }
    });
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  nuevoDispositivo = {
    nombre_aparato: '',
    tipo_aparato: '',
    accion_nombre: '',
    comando_bluetooth: '',
    icono: '',
    nombre_bluetooth: '',
    mac_bluetooth: '',
    fecha_sincronizacion: null
  };

  abrirModal(): void {
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
  }

  guardarDispositivo(): void {
    this.devicesService
      .createDevice(this.nuevoDispositivo)
      .subscribe({
        next: () => {
          this.toastService.success('Dispositivo agregado correctamente');
          this.cerrarModal();
          this.devicesService.loadDevices();
        },
        error: (err) => {
          this.toastService.error('Error al agregar el dispositivo');
          console.error(err);
        }
      });
  }

  getIconPath(icono: string | undefined): string {
    if (!icono) return '/icons/smartphone.svg';
    // Mapeo simple de nombres a archivos si es necesario,
    // o simplemente retornar el path si coinciden los nombres.
    const iconMap: Record<string, string> = {
      'lightbulb': 'lightbulb.svg',
      'tv': 'tv.svg',
      'speaker': 'speaker.svg',
      'camera': 'camera.svg',
      'lock': 'lock.svg',
      'fan': 'fan.svg',
      'wifi': 'wifi.svg'
    };
    return `/icons/${iconMap[icono] || 'smartphone.svg'}`;
  }
}
