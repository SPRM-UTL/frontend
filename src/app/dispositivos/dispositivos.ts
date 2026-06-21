import { Component, computed, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DispositivosService } from './dispositivos.service';
import { Dispositivo } from './dispositivos.model';

@Component({
  selector: 'app-dispositivos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dispositivos.html',
  styleUrl: './dispositivos.css'
})
export class Dispositivos implements OnInit {

  private devicesService = inject(DispositivosService);
  private route = inject(ActivatedRoute);

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


getIconPath(tipo: string | undefined): string {
  if (!tipo) return '/icons/smartphone.svg';

  const iconMap: Record<string, string> = {
    'Bocinas': 'speaker.svg',
    'Audífonos': 'earphones.svg',
    'Luces': 'lightbulb.svg',
    'Ventiladores': 'ventiladores.svg',
    'Cámara': 'camera.svg',
    'TV': 'tv.svg',
    'Cerradura': 'lock.svg'
  };

  return `/icons/${iconMap[tipo] || 'smartphone.svg'}`;
}
}
