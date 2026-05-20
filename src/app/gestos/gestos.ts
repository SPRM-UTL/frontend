import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Gesto {
  id: number;
  nombre: string;
  emoji: string;
  dispositivo: string;
  dispositivoIconColor: string;
  dispositivoIconEmoji: string;
  accion: string;
  tiempo: string;
  estado: 'Activo' | 'Pausado';
}

@Component({
  selector: 'app-gestos',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './gestos.html',
  styleUrl: './gestos.css'
})
export class Gestos {
  activeNav = 'gestos';
  searchQuery = '';

  gestos: Gesto[] = [
    {
      id: 1,
      nombre: 'Saludo - Encender Luces',
      emoji: '👋',
      dispositivo: 'Luces del Salón',
      dispositivoIconColor: '#f97316',
      dispositivoIconEmoji: '💡',
      accion: 'Encender todas las luces',
      tiempo: 'Hace 2 minutos',
      estado: 'Activo'
    },
    {
      id: 2,
      nombre: 'Pulgar Arriba - TV',
      emoji: '👍',
      dispositivo: 'Smart TV Samsung',
      dispositivoIconColor: '#8b5cf6',
      dispositivoIconEmoji: '📺',
      accion: 'Encender televisión',
      tiempo: 'Hace 1 hora',
      estado: 'Activo'
    },
    {
      id: 3,
      nombre: 'Palma Abierta - Ventilador',
      emoji: '🖐',
      dispositivo: 'Ventilador Dormitorio',
      dispositivoIconColor: '#06b6d4',
      dispositivoIconEmoji: '🌀',
      accion: 'Apagar ventilador',
      tiempo: 'Hace 30 minutos',
      estado: 'Activo'
    },
    {
      id: 4,
      nombre: 'Dos Dedos - Cortinas',
      emoji: '✌️',
      dispositivo: 'Cortinas Inteligentes',
      dispositivoIconColor: '#10b981',
      dispositivoIconEmoji: '🪟',
      accion: 'Abrir cortinas',
      tiempo: 'Hace 3 horas',
      estado: 'Activo'
    },
    {
      id: 5,
      nombre: 'Puño Cerrado - Música',
      emoji: '✊',
      dispositivo: 'Altavoz Inteligente',
      dispositivoIconColor: '#ec4899',
      dispositivoIconEmoji: '🎵',
      accion: 'Reproducir música',
      tiempo: 'Hace 45 minutos',
      estado: 'Activo'
    },
    {
      id: 6,
      nombre: 'Señalar - Aire Acondicionado',
      emoji: '☝️',
      dispositivo: 'AC Habitación Principal',
      dispositivoIconColor: '#3b82f6',
      dispositivoIconEmoji: '❄️',
      accion: 'Ajustar temperatura a 22°C',
      tiempo: 'Hace 5 horas',
      estado: 'Pausado'
    }
  ];

  get gestosFiltrados(): Gesto[] {
    if (!this.searchQuery.trim()) return this.gestos;
    const q = this.searchQuery.toLowerCase();
    return this.gestos.filter(g =>
      g.nombre.toLowerCase().includes(q) ||
      g.dispositivo.toLowerCase().includes(q) ||
      g.accion.toLowerCase().includes(q)
    );
  }

  get totalActivos(): number {
    return this.gestos.filter(g => g.estado === 'Activo').length;
  }

  toggleEstado(gesto: Gesto) {
    gesto.estado = gesto.estado === 'Activo' ? 'Pausado' : 'Activo';
  }

  eliminarGesto(id: number) {
    this.gestos = this.gestos.filter(g => g.id !== id);
  }

  setActive(nav: string) {
    this.activeNav = nav;
  }
}
