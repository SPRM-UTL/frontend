import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-control',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './control.html',
  styleUrl: './control.css'
})
export class Control {
  activeNav = 'control';

  // Categorías superiores
  categorias = [
    { nombre: 'Luces', cantidad: 8, emoji: '💡', color: '#f97316', bg: '#fff7ed' },
    { nombre: 'TV', cantidad: 2, emoji: '📺', color: '#8b5cf6', bg: '#f5f3ff' },
    { nombre: 'AC', cantidad: 3, emoji: '❄️', color: '#3b82f6', bg: '#eff6ff' },
    { nombre: 'Audio', cantidad: 4, emoji: '🎵', color: '#ec4899', bg: '#fdf2f8' },
    { nombre: 'Ventiladores', cantidad: 2, emoji: '🌀', color: '#06b6d4', bg: '#ecfeff' },
    { nombre: 'Cortinas', cantidad: 5, emoji: '🪟', color: '#10b981', bg: '#ecfdf5' },
  ];

  selectedCategoria = 'Luces';

  // ── LIGHTING ──
  luces = [
    { id: 1, nombre: 'Living Room Lights', ubicacion: 'Living Room • 8 bulbs', encendido: true, brillo: 75, tono: 'warm' as 'warm' | 'cool' },
    { id: 2, nombre: 'Bedroom Lights', ubicacion: 'Bedroom • 4 bulbs', encendido: false, brillo: 50, tono: 'cool' as 'warm' | 'cool' },
    { id: 3, nombre: 'Kitchen Lights', ubicacion: 'Kitchen • 6 bulbs', encendido: true, brillo: 100, tono: 'warm' as 'warm' | 'cool' },
  ];

  // ── ENTERTAINMENT ──
  tvs = [
    {
      id: 1, nombre: 'Living Room TV', ubicacion: 'Living Room', encendido: true,
      nowPlaying: 'Netflix', volumen: 45, app: 'Netflix' as string,
      apps: ['Netflix', 'YouTube', 'Prime', 'Disney+']
    },
    {
      id: 2, nombre: 'Bedroom TV', ubicacion: 'Bedroom', encendido: false,
      nowPlaying: '', volumen: 30, app: '',
      apps: ['Netflix', 'YouTube', 'Prime', 'Disney+']
    },
  ];

  // ── CLIMATE ──
  acs = [
    { id: 1, nombre: 'Living Room AC', ubicacion: 'Living Room', encendido: true, temp: 22, modo: 'cool' as 'cool' | 'heat' | 'auto', humedad: 55 },
    { id: 2, nombre: 'Bedroom AC', ubicacion: 'Bedroom', encendido: false, temp: 24, modo: 'auto' as 'cool' | 'heat' | 'auto', humedad: 48 },
  ];

  toggleLuz(luz: any) { luz.encendido = !luz.encendido; }
  toggleTv(tv: any) { tv.encendido = !tv.encendido; }
  toggleAc(ac: any) { ac.encendido = !ac.encendido; }

  setTono(luz: any, tono: 'warm' | 'cool') { luz.tono = tono; }
  setApp(tv: any, app: string) { tv.app = app; }
  setModo(ac: any, modo: 'cool' | 'heat' | 'auto') { ac.modo = modo; }

  incrementTemp(ac: any) { if (ac.encendido) ac.temp++; }
  decrementTemp(ac: any) { if (ac.encendido && ac.temp > 16) ac.temp--; }

  setActive(nav: string) { this.activeNav = nav; }
}
