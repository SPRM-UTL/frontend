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

  // Dropdown Filter State
  readonly isFilterOpen = signal(false);
  readonly selectedFilter = signal('');
  readonly selectedFilterLabel = signal('Todos los tipos');

  // Mapeo de tipos de aparatos de la base de datos a nombres de archivos SVG reales en la carpeta /icons/
  readonly categoryIconMap: Record<string, string> = {
    'Audífonos': 'headphones',
    'Bocinas': 'speaker',
    'Focos': 'lightbulb',
    'Luces': 'lamp_floor',
    'Ventilador': 'wind',
    'Televisión': 'tv_minimal',
    'Sockets': 'plug',
    'Asistente': 'ic_input_add',
    'Predeterminado': 'ic_default'
  };

  readonly devices = this.devicesService.devices;
  readonly mostrarModal = signal(false);
  readonly selectedDevice = signal<Dispositivo | null>(null);

  readonly filteredDevices = computed(() => {
    let filtered = this.devices();
    if (!Array.isArray(filtered)) return [];

    const q = this.searchQuery().toLowerCase().trim();
    const type = this.selectedFilter();

    // Filtro por búsqueda
    if (q) {
      filtered = filtered.filter(device =>
        device.nombre_aparato?.toLowerCase().includes(q) ||
        device.tipo_aparato?.toLowerCase().includes(q) ||
        device.nombre_bluetooth?.toLowerCase().includes(q)
      );
    }

    // Filtro por tipo (Categoría)
    if (type) {
      filtered = filtered.filter(device => {
        const devIcon = (device.icono || '').toLowerCase().trim();
        const devType = (device.tipo_aparato || '').toLowerCase().trim();
        const mappedIcon = this.categoryIconMap[device.tipo_aparato || ''] || '';

        return devIcon === type ||
               devType === type.toLowerCase() ||
               mappedIcon === type ||
               (type === 'lamp_floor' && devType === 'luces') ||
               (type === 'ic_input_add' && devType === 'asistente') ||
               (type === 'ic_default' && devType === 'predeterminado');
      });
    }

    return filtered;
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

  // Dropdown Methods
  toggleFilter() {
    this.isFilterOpen.update(v => !v);
  }

  closeFilter() {
    this.isFilterOpen.set(false);
  }

  selectFilter(value: string, label: string) {
    this.selectedFilter.set(value);
    this.selectedFilterLabel.set(label);
    this.isFilterOpen.set(false);
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

  verDetalle(device: Dispositivo): void {
    this.selectedDevice.set(device);
  }

  cerrarDetalle(): void {
    this.selectedDevice.set(null);
  }


getIconPath(tipoOIcono: string | undefined): string {
  if (!tipoOIcono) return '/icons/ic_default.svg';
  const iconName = this.categoryIconMap[tipoOIcono] || tipoOIcono;
  return `/icons/${iconName}.svg`;
}
}
