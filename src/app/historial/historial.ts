import { Component, computed, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistorialService } from './historial.service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class Historial implements OnInit {
  private historialService = inject(HistorialService);

  readonly searchQuery = signal('');

  readonly actividadesFiltradas = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const lista = this.historialService.actividades();
    if (!Array.isArray(lista)) return [];
    if (!q) return lista;

    return lista.filter(a =>
      (a.accion ?? '').toLowerCase().includes(q)      ||
      (a.dispositivo ?? '').toLowerCase().includes(q) ||
      (a.metodo ?? '').toLowerCase().includes(q)      ||
      (a.estado ?? '').toLowerCase().includes(q)
    );
  });

  readonly loading = this.historialService.loading;
  readonly error   = this.historialService.error;

  ngOnInit(): void {
    this.historialService.loadHistorial();
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  getIconPath(icono: string | undefined): string {
    if (!icono) return '/icons/sparkles.svg';
    const iconMap: Record<string, string> = {
      'lightbulb': 'lightbulb.svg',
      'tv': 'tv.svg',
      'speaker': 'speaker.svg',
      'fan': 'fan.svg',
      'camera': 'camera.svg',
      'lock': 'lock.svg',
      'wifi': 'wifi.svg',
      'bolt': 'bolt.svg',
      'hand': 'hand.svg'
    };
    return `/icons/${iconMap[icono] || 'sparkles.svg'}`;
  }

  getMethodIcon(metodo: string | undefined): string {
    const m = (metodo || '').toLowerCase();
    if (m.includes('gesto')) return '/icons/hand.svg';
    if (m.includes('app') || m.includes('móvil')) return '/icons/smartphone.svg';
    if (m.includes('auto')) return '/icons/bolt.svg';
    if (m.includes('voz')) return '/icons/mic.svg';
    return '/icons/sparkles.svg';
  }
}
