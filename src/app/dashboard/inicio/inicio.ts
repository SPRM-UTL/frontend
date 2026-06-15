import { Component, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicChartComponent } from '../../macros/dynamic-char.component';
import { InicioService } from './inicio.service'; // Asegúrate de la ruta correcta

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, DynamicChartComponent],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class Inicio {
  readonly dayLabel = this.formatDayLabel();
  readonly timeLabel = this.formatTimeLabel();

  // Configuración fija de gráficas
  actividadSeries = [{ name: 'Automatizaciones', data: [12, 18, 15, 22, 20, 25, 30] }];
  actividadCategorias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  eficienciaSeries = [85];
  eficienciaLabels = ['Eficiencia global'];
  eficienciaColors = ['#2bbfaa'];

  // Inyectamos el servicio de manera pública para poder usar sus signals en el template HTML
  constructor(public inicioService: InicioService) {

    // ✅ Se ejecuta de forma segura solo en el cliente evitando problemas con SSR
    afterNextRender(() => {
      const userId = Number(localStorage.getItem('userId') ?? 0);
      const token = localStorage.getItem('token') ?? '';

      this.inicializarDashboard(userId, token);
    });
  }

  private inicializarDashboard(userId: number, token: string): void {
    if (userId <= 0 || !token) {
      console.warn('No se puede cargar el dashboard: Falta sesión (userId o token)');
      return;
    }

    // Disparamos la carga centralizada de datos
    this.inicioService.loadInicio(userId, token);
  }

  private formatDayLabel(): string {
    const now = new Date();
    const label = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long'
    }).format(now);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  private formatTimeLabel(): string {
    const now = new Date();
    return new Intl.DateTimeFormat('es-ES', {
      hour: 'numeric', minute: '2-digit', hour12: true
    }).format(now).replace(/\./g, '').toUpperCase();
  }
}
