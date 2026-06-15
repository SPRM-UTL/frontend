// control.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlService } from './control.service';
import { Luz, Tv, Ac } from './control.model';

@Component({
  selector: 'app-control',
  imports: [CommonModule, FormsModule],
  templateUrl: './control.html',
  styleUrl: './control.css'
})
export class Control implements OnInit {

  private controlService = inject(ControlService);

  readonly categorias = this.controlService.categorias;
  readonly luces      = this.controlService.luces;
  readonly tvs        = this.controlService.tvs;
  readonly acs        = this.controlService.acs;
  readonly loading    = this.controlService.loading;
  readonly error      = this.controlService.error;

  selectedCategoria = 'Luces';

  categoryIcon(nombre: string): string {
    const normalized = nombre.toLowerCase();
    if (normalized.includes('luz')) return 'lightbulb';
    if (normalized.includes('tv') || normalized.includes('entreten')) return 'tv';
    if (normalized.includes('clima') || normalized.includes('aire') || normalized.includes('vent')) return 'air-vent';
    return 'circle-user-round';
  }

  lightIcon(): string {
    return 'lightbulb';
  }

  tvIcon(): string {
    return 'tv';
  }

  acIcon(): string {
    return 'air-vent';
  }

  warmIcon(): string {
    return 'sun';
  }

  coolIcon(): string {
    return 'snowflake';
  }

  autoIcon(): string {
    return 'sparkles';
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

  // ── TVs ──
  toggleTv(tv: Tv): void { this.controlService.toggleTv(tv.id); }
  setApp(tv: Tv, app: string): void {
    this.controlService.updateTv({ ...tv, app });
  }
  onVolumenChange(tv: Tv, value: number): void {
    this.controlService.updateTv({ ...tv, volumen: value });
  }

  // ── ACs ──
  toggleAc(ac: Ac): void { this.controlService.toggleAc(ac.id); }
  setModo(ac: Ac, modo: 'cool' | 'heat' | 'auto'): void {
    this.controlService.updateAc({ ...ac, modo });
  }
  incrementTemp(ac: Ac): void {
    if (ac.encendido) this.controlService.updateAc({ ...ac, temp: ac.temp + 1 });
  }
  decrementTemp(ac: Ac): void {
    if (ac.encendido && ac.temp > 16) this.controlService.updateAc({ ...ac, temp: ac.temp - 1 });
  }
}
