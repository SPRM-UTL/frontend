import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ControlService } from './control.service';
import { Luz, Bocina, Ventilador } from './control.model';

type CategoriaSeleccionada =
  | 'Luces'
  | 'Bocinas'
  | 'Ventiladores';

@Component({
  selector: 'app-control',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './control.html',
  styleUrl: './control.css'
})
export class Control implements OnInit {

  private controlService = inject(ControlService);

  readonly categorias = this.controlService.categorias;
  readonly luces      = this.controlService.luces;
  readonly bocinas        = this.controlService.bocinas;
  readonly ventiladores        = this.controlService.ventiladores;
  readonly loading    = this.controlService.loading;
  readonly error      = this.controlService.error;

  categoriaSeleccionada: CategoriaSeleccionada = 'Luces';

  getCurrentDevices(): any[] {
    if (this.categoriaSeleccionada === 'Luces') return this.luces();
    if (this.categoriaSeleccionada === 'Bocinas') return this.bocinas();
    if (this.categoriaSeleccionada === 'Ventiladores') return this.ventiladores();
    return [];
  }

  getDeviceIcon(categoria: string): string {
    if (categoria === 'Luces') return '/icons/lightbulb.svg';
    if (categoria === 'Bocinas') return '/icons/speaker.svg';
    if (categoria === 'Ventiladores') return '/icons/fan.svg';
    return '/icons/smartphone.svg';
  }

  toggleDevice(device: any): void {
    if (this.categoriaSeleccionada === 'Luces') this.toggleLuz(device);
    if (this.categoriaSeleccionada === 'Bocinas') this.toggleBocina(device);
    if (this.categoriaSeleccionada === 'Ventiladores') this.toggleVentilador(device);
  }

  ngOnInit(): void {
    this.controlService.loadControl();
  }

  // ── Luces ──
  toggleLuz(luz: Luz): void { this.controlService.toggleLuz(luz.id); }
  setTono(luz: Luz, tono: 'warm' | 'cool'): void {
    this.controlService.updateLuz({ ...luz, tono });
  }
  onBrilloChange(luz: Luz, value: number): void {
    this.controlService.updateLuz({ ...luz, brillo: value });
  }

// ── Bocinas ──

// Encender / apagar
toggleBocina(bocina: Bocina): void {
  this.controlService.toggleBocina(bocina.id);
}

// Subir volumen
incrementVolumen(bocina: Bocina): void {

  // Evita pasar de 100
  if (bocina.volumen < 100) {

    this.controlService.updateBocina({
      ...bocina,
      volumen: bocina.volumen + 5
    });

  }
}

// Bajar volumen
decrementVolumen(bocina: Bocina): void {

  // Evita valores negativos
  if (bocina.volumen > 0) {

    this.controlService.updateBocina({
      ...bocina,
      volumen: bocina.volumen - 5
    });

  }
}

// Cambio desde slider
onVolumenChange(
  bocina: Bocina,
  value: number
): void {

  this.controlService.updateBocina({
    ...bocina,
    volumen: value
  });

}

  // ── Ventiladors ──
  toggleVentilador(Ventilador: Ventilador): void { this.controlService.toggleVentilador(Ventilador.id); }
  setModo(Ventilador: Ventilador): void {
    this.controlService.updateVentilador({ ...Ventilador });
  }
incrementVelocidad(
  ventilador: Ventilador
): void {

  if (ventilador.velocidad < 5) {

    this.controlService
        .updateVentilador({

      ...ventilador,

      velocidad:
        ventilador.velocidad + 1
    });

  }
}
decrementVelocidad(
  ventilador: Ventilador
): void {

  if (
    ventilador.encendido &&
    ventilador.velocidad > 1
  ) {

    this.controlService.updateVentilador({
      ...ventilador,
      velocidad: ventilador.velocidad - 1
    });

  }
}
}
