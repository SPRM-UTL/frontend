import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CasasService } from './casas.service';
import { Casa } from './casas.model';
import { HabitacionesService } from '../habitaciones/habitaciones.service';
import { Habitacion } from '../habitaciones/habitaciones.model';
import { ToastService } from '../services/toast.service';
import { ConfirmModalService } from '../services/confirm-modal.service';
import { DispositivosService } from '../dispositivos/dispositivos.service';
import { Dispositivo } from '../dispositivos/dispositivos.model';
import { getDeviceIcon } from '../shared/icon-map';
import { FindByIdPipe } from '../shared/pipes/find-by-id.pipe';
import { CountDevicesPipe } from '../shared/pipes/count-devices.pipe';
import {
  LucideDynamicIcon
} from '@lucide/angular';
import { SkeletonComponent } from 'boneyard-js/angular';

@Component({
  selector: 'app-casas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FindByIdPipe,
    CountDevicesPipe,
    LucideDynamicIcon,
    SkeletonComponent
  ],
  templateUrl: './casas.html',
  styleUrl: './casas.css'
})
export class Casas implements OnInit {
  private casasService = inject(CasasService);
  private habitacionesService = inject(HabitacionesService);
  private devicesService = inject(DispositivosService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmModalService);

  readonly casas = this.casasService.casas;
  readonly loading = this.casasService.loading;
  readonly error = this.casasService.error;
  readonly allDevices = this.devicesService.devices;

  readonly searchQuery = signal('');
  readonly selectedCasa = signal<Casa | null>(null);
  readonly selectedHabitacion = signal<Habitacion | null>(null);

  // Estados para los menús de opciones (Dropdowns)
  readonly activeCasaMenuId = signal<number | null>(null);
  readonly activeHabitacionMenuId = signal<number | null>(null);

  readonly showCasaModal = signal(false);
  readonly showHabitacionModal = signal(false);
  readonly showDeviceLinkModal = signal(false);
  readonly isEditing = signal(false);

  casaForm = { id: 0, nombre_casa: '' };
  habitacionForm = { id: 0, nombre_habitacion: '', sk_casa_id: 0 };

  linkingRoomId = 0;
  selectedDeviceIds = signal<number[]>([]);

  readonly availableDevices = computed(() => {
    return this.allDevices().filter(d => !d.sk_habitacion_id);
  });

  readonly habitacionesEnriquecidas = computed(() => {
    const list = this.habitacionesService.habitaciones();
    const allDevs = this.allDevices();

    return list.map(h => ({
      ...h,
      dispositivos: allDevs.filter(d => d.sk_habitacion_id === h.sk_habitacion_id)
    }));
  });

  readonly filteredCasas = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.casas();
    return this.casas().filter(c => c.nombre_casa.toLowerCase().includes(q));
  });

  ngOnInit(): void {
    this.casasService.loadCasas();
    this.devicesService.loadDevices();
  }

  onSearch(val: string): void {
    this.searchQuery.set(val);
  }

  toggleCasaMenu(event: Event, id: number) {
    event.stopPropagation();
    this.activeHabitacionMenuId.set(null); // Cerrar otros menús
    this.activeCasaMenuId.update(current => current === id ? null : id);
  }

  toggleHabitacionMenu(event: Event, id: number) {
    event.stopPropagation();
    this.activeCasaMenuId.set(null); // Cerrar otros menús
    this.activeHabitacionMenuId.update(current => current === id ? null : id);
  }

  closeMenus() {
    this.activeCasaMenuId.set(null);
    this.activeHabitacionMenuId.set(null);
  }

  openAddCasa() {
    this.isEditing.set(false);
    this.casaForm = { id: 0, nombre_casa: '' };
    this.showCasaModal.set(true);
  }

  openEditCasa(casa: Casa) {
    this.isEditing.set(true);
    this.casaForm = { id: casa.sk_casa_id, nombre_casa: casa.nombre_casa };
    this.showCasaModal.set(true);
  }

  saveCasa() {
    if (!this.casaForm.nombre_casa.trim()) {
      this.toastService.error('El nombre de la casa es obligatorio');
      return;
    }

    if (this.isEditing()) {
      this.casasService.updateCasa(this.casaForm.id, { nombre_casa: this.casaForm.nombre_casa }).subscribe({
        next: () => {
          this.toastService.success('Casa actualizada');

          if (this.selectedCasa()?.sk_casa_id === this.casaForm.id) {
            this.selectedCasa.update(casa =>
              casa
                ? {
                    ...casa,
                    nombre_casa: this.casaForm.nombre_casa
                  }
                : null
            );
          }

          this.showCasaModal.set(false);
        },
        error: () => this.toastService.error('Error al actualizar casa')
      });
    } else {
      this.casasService.createCasa({ nombre_casa: this.casaForm.nombre_casa }).subscribe({
        next: () => {
          this.toastService.success('Casa creada');
          this.showCasaModal.set(false);
        },
        error: () => this.toastService.error('Error al crear casa')
      });
    }
  }

  selectCasa(casa: Casa) {
    this.selectedCasa.set(casa);
    this.habitacionesService.loadHabitacionesByCasa(casa.sk_casa_id);
  }

  openAddHabitacion() {
    const casa = this.selectedCasa();
    if (!casa) return;
    this.isEditing.set(false);
    this.habitacionForm = { id: 0, nombre_habitacion: '', sk_casa_id: casa.sk_casa_id };
    this.selectedDeviceIds.set([]); // Reset seleccion al crear nueva
    this.showHabitacionModal.set(true);
  }

  openEditHabitacion(h: Habitacion) {
    this.isEditing.set(true);
    this.habitacionForm = { id: h.sk_habitacion_id, nombre_habitacion: h.nombre_habitacion, sk_casa_id: h.sk_casa_id };
    this.showHabitacionModal.set(true);
  }

  saveHabitacion() {
    if (!this.habitacionForm.nombre_habitacion.trim()) {
      this.toastService.error('El nombre de la habitación es obligatorio');
      return;
    }

    const obs = this.isEditing()
      ? this.habitacionesService.updateHabitacion(this.habitacionForm.id, { nombre_habitacion: this.habitacionForm.nombre_habitacion, sk_casa_id: this.habitacionForm.sk_casa_id })
      : this.habitacionesService.createHabitacion({ nombre_habitacion: this.habitacionForm.nombre_habitacion, sk_casa_id: this.habitacionForm.sk_casa_id });

    obs.subscribe({
      next: (res: any) => {
        this.toastService.success(this.isEditing() ? 'Habitación actualizada' : 'Habitación creada');

        // Si es nueva habitacion y hay dispositivos seleccionados, los vinculamos
        const newRoomId = res?.sk_habitacion_id || res?.data?.sk_habitacion_id;
        const deviceIds = this.selectedDeviceIds();

        if (!this.isEditing() && newRoomId && deviceIds.length > 0) {
          const linkObservables = deviceIds.map(id => this.devicesService.updateDeviceRoom(id, newRoomId));
          forkJoin(linkObservables).subscribe({
            next: () => {
              this.devicesService.loadDevices();
              if (this.selectedCasa()) {
                this.habitacionesService.loadHabitacionesByCasa(this.selectedCasa()!.sk_casa_id);
              }
            }
          });
        }

        this.showHabitacionModal.set(false);

        if (this.isEditing() && this.selectedHabitacion()?.sk_habitacion_id === this.habitacionForm.id) {
          this.selectedHabitacion.update(current => current ? { ...current, nombre_habitacion: this.habitacionForm.nombre_habitacion } : null);
        }
      },
      error: () => this.toastService.error('Error al procesar habitación')
    });
  }

  deleteCasa(casa: Casa) {
    this.confirmService.confirm({
      title: `¿Eliminar "${casa.nombre_casa}"?`,
      description: 'Esta acción eliminará todas las habitaciones y desvinculará los dispositivos asociados de forma permanente.',
      confirmText: 'Sí, eliminar',
      type: 'danger'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.casasService.deleteCasa(casa.sk_casa_id).subscribe({
          next: () => {
            this.toastService.success('Casa eliminada');
            if (this.selectedCasa()?.sk_casa_id === casa.sk_casa_id) {
              this.selectedCasa.set(null);
            }
          },
          error: () => this.toastService.error('Error al eliminar casa')
        });
      }
    });
  }

  deleteHabitacion(h: Habitacion) {
    this.confirmService.confirm({
      title: `¿Eliminar habitación "${h.nombre_habitacion}"?`,
      description: 'Esta acción desvinculará todos los dispositivos de esta habitación.',
      confirmText: 'Eliminar',
      type: 'danger',
      icon: 'door-open'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.habitacionesService.deleteHabitacion(h.sk_habitacion_id, h.sk_casa_id).subscribe({
          next: () => {
            this.toastService.success('Habitación eliminada');
            if (this.selectedHabitacion()?.sk_habitacion_id === h.sk_habitacion_id) {
              this.cerrarDetalleHabitacion();
            }
          },
          error: () => this.toastService.error('Error al eliminar habitación')
        });
      }
    });
  }

  getHabitacionIcon(nombre: string): any {
    const n = nombre.toLowerCase();
    if (n.includes('sala')) return 'armchair';
    if (n.includes('cocina')) return 'utensils-crossed';
    if (n.includes('baño') || n.includes('bano')) return 'bath';
    if (n.includes('dormitorio') || n.includes('cuarto')) return 'bed';
    if (n.includes('comedor')) return 'utensils';
    if (n.includes('cochera') || n.includes('garaje')) return 'car';
    if (n.includes('jardin') || n.includes('patio')) return 'tree-pine';
    return 'door-open';
  }

  verDetalleHabitacion(h: Habitacion) {
    this.selectedHabitacion.set(h);
  }

  cerrarDetalleHabitacion() {
    this.selectedHabitacion.set(null);
  }

  openLinkDevice(h: Habitacion) {
    this.linkingRoomId = h.sk_habitacion_id;
    this.selectedDeviceIds.set([]);
    this.showDeviceLinkModal.set(true);
  }

  toggleDeviceSelection(id: number) {
    this.selectedDeviceIds.update(ids =>
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    );
  }

  vincularDispositivo() {
    const ids = this.selectedDeviceIds();
    if (ids.length === 0) {
      this.toastService.error('Selecciona al menos un dispositivo');
      return;
    }

    const observables = ids.map(id => this.devicesService.updateDeviceRoom(id, this.linkingRoomId));

    forkJoin(observables).subscribe({
      next: () => {
        this.toastService.success(`${ids.length} dispositivo(s) vinculado(s)`);
        this.showDeviceLinkModal.set(false);

        // Recargamos datos globales para que el computed de habitacionesEnriquecidas se actualice
        this.devicesService.loadDevices();

        if (this.selectedCasa()) {
          this.habitacionesService.loadHabitacionesByCasa(this.selectedCasa()!.sk_casa_id);
        }

        // Actualizamos el modal de detalles si está abierto
        const h = this.selectedHabitacion();
        if (h && h.sk_habitacion_id === this.linkingRoomId) {
          this.selectedHabitacion.update(current => {
            if (!current) return null;
            // Los dispositivos se actualizarán automáticamente gracias al reload y al computed
            return { ...current };
          });
        }
      },
      error: () => this.toastService.error('Error al vincular dispositivos')
    });
  }

  desvincularDispositivo(devId: number) {
    this.confirmService.confirm({
      title: '¿Desvincular dispositivo?',
      description: 'El dispositivo dejará de estar asignado a esta habitación.',
      confirmText: 'Desvincular',
      type: 'warning',
      icon: 'plug'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.devicesService.updateDeviceRoom(devId, null).subscribe({
          next: () => {
            this.toastService.success('Dispositivo desvinculado');
            this.devicesService.loadDevices();
            if (this.selectedCasa()) {
              this.habitacionesService.loadHabitacionesByCasa(this.selectedCasa()!.sk_casa_id);
            }
          },
          error: () => this.toastService.error('Error al desvincular dispositivo')
        });
      }
    });
  }

  get habitacionLoading() { return this.habitacionesService.loading; }
  get habitacionesList() { return this.habitacionesEnriquecidas; }

  getDeviceIcon = getDeviceIcon;
}
