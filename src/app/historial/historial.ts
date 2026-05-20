import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Actividad {
  id: number;
  hora: string;
  accion: string;
  dispositivo: string;
  dispositivoEmoji: string;
  dispositivoColor: string;
  estado: 'Ejecutado' | 'Pendiente' | 'Error';
  metodo: 'Gesto' | 'App móvil' | 'Automatización';
}

@Component({
  selector: 'app-historial',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class Historial {
  activeNav = 'historial';
  searchQuery = '';

  actividades: Actividad[] = [
    { id: 1, hora: '12:30 PM', accion: 'Encender luces sala', dispositivo: 'Luces Sala', dispositivoEmoji: '💡', dispositivoColor: '#f97316', estado: 'Ejecutado', metodo: 'Gesto' },
    { id: 2, hora: '11:15 AM', accion: 'Smart TV apagada', dispositivo: 'Smart TV', dispositivoEmoji: '📺', dispositivoColor: '#8b5cf6', estado: 'Ejecutado', metodo: 'App móvil' },
    { id: 3, hora: '09:40 AM', accion: 'Reproducir música', dispositivo: 'Bocina Inteligente', dispositivoEmoji: '🎵', dispositivoColor: '#ec4899', estado: 'Pendiente', metodo: 'Gesto' },
    { id: 4, hora: '08:15 AM', accion: 'Ajustar temperatura 22°C', dispositivo: 'Aire Acondicionado', dispositivoEmoji: '❄️', dispositivoColor: '#3b82f6', estado: 'Ejecutado', metodo: 'Automatización' },
    { id: 5, hora: '07:30 AM', accion: 'Abrir cortinas', dispositivo: 'Cortinas Inteligentes', dispositivoEmoji: '🪟', dispositivoColor: '#10b981', estado: 'Ejecutado', metodo: 'Automatización' },
    { id: 6, hora: '07:00 AM', accion: 'Encender luces dormitorio', dispositivo: 'Luces Dormitorio', dispositivoEmoji: '💡', dispositivoColor: '#f97316', estado: 'Ejecutado', metodo: 'Gesto' },
    { id: 7, hora: '11:00 PM', accion: 'Apagar ventilador', dispositivo: 'Ventilador Dormitorio', dispositivoEmoji: '🌀', dispositivoColor: '#06b6d4', estado: 'Ejecutado', metodo: 'App móvil' },
    { id: 8, hora: '10:45 PM', accion: 'Modo noche activado', dispositivo: 'Sistema General', dispositivoEmoji: '🌙', dispositivoColor: '#6366f1', estado: 'Ejecutado', metodo: 'Automatización' },
    { id: 9, hora: '09:20 PM', accion: 'Bajar volumen TV', dispositivo: 'Smart TV', dispositivoEmoji: '📺', dispositivoColor: '#8b5cf6', estado: 'Error', metodo: 'Gesto' },
    { id: 10, hora: '08:00 PM', accion: 'Encender sistema sonido', dispositivo: 'Bocina Sala', dispositivoEmoji: '🔊', dispositivoColor: '#ec4899', estado: 'Ejecutado', metodo: 'App móvil' },
  ];

  get actividadesFiltradas(): Actividad[] {
    if (!this.searchQuery.trim()) return this.actividades;
    const q = this.searchQuery.toLowerCase();
    return this.actividades.filter(a =>
      a.accion.toLowerCase().includes(q) ||
      a.dispositivo.toLowerCase().includes(q) ||
      a.metodo.toLowerCase().includes(q) ||
      a.estado.toLowerCase().includes(q)
    );
  }

  setActive(nav: string) {
    this.activeNav = nav;
  }
}
