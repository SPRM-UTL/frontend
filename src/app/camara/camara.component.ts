import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CamaraService } from './camara.service';

@Component({
  selector: 'app-camara',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="position:relative;display:inline-block;width:100%;min-height:200px;background:#000;">
      <div *ngIf="!frameUrl" class="placeholder" style="color:var(--muted);text-align:center;padding:20px;font-size:13px;display:flex;align-items:center;justify-content:center;height:100%;">
        {{ statusText }}
      </div>
      <img *ngIf="frameUrl" [src]="frameUrl" (load)="onLoad()" (error)="onError()" style="width:100%;max-width:480px;display:block;margin:0 auto;" />
      <button
        *ngIf="frameUrl"
        (click)="toggleFlash()"
        [style.background]="flashOn ? '#facc15' : 'rgba(0,0,0,0.5)'"
        [style.color]="flashOn ? '#000' : '#fff'"
        style="position:absolute;top:8px;right:8px;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;z-index:2;"
        title="Flash">
        &#9889;
      </button>
    </div>`
})
export class CamaraComponent implements OnInit, OnDestroy {
  @Input() deviceKey!: string;
  @Input() aparatoId!: number;

  frameUrl: string | null = null;
  flashOn = false;
  statusText = 'Obteniendo IP...';
  
  private baseHost: string | null = null;
  private candidateUrls: string[] = [];
  private candidateIndex = 0;
  private connectToken = 0;
  
  private camaraService = inject(CamaraService);

  ngOnInit() {
    if (!this.aparatoId) {
      this.statusText = 'No se proporcionó ID de aparato.';
      console.warn('[CamaraComponent] No se proporcionó ID de aparato.');
      return;
    }
    
    console.log(`[CamaraComponent] Iniciando consulta de IP para aparatoId: ${this.aparatoId}`);
    this.camaraService.getConfiguracionRed(this.aparatoId).subscribe({
      next: (response) => {
        console.log('[CamaraComponent] Configuración recibida:', response);
        const config = response?.data || response; // Extraer 'data' si viene envuelto
        if (config && config.ip_address) {
          console.log(`[CamaraComponent] IP encontrada: ${config.ip_address}`);
          this.baseHost = config.ip_address;
          this.connect();
        } else {
          console.warn('[CamaraComponent] Configuración sin ip_address:', config);
          this.statusText = 'El dispositivo no tiene una IP registrada en la red.';
        }
      },
      error: (err) => {
        console.error('[CamaraComponent] Error obteniendo config de red:', err);
        this.statusText = 'Error al obtener IP de la cámara.';
      }
    });
  }

  ngOnDestroy() { 
    this.connectToken++;
  }

  connect() {
    if (!this.baseHost) return;
    
    this.connectToken++;
    const myToken = this.connectToken;

    this.candidateUrls = [
      `http://${this.baseHost}:81/stream`,
      `http://${this.baseHost}/stream`,
      `http://${this.baseHost}/`
    ];
    this.candidateIndex = 0;
    this.statusText = 'Conectando…';
    console.log(`[CamaraComponent] Preparando para probar las siguientes rutas:`, this.candidateUrls);
    this.tryNextCandidate(myToken);
  }

  tryNextCandidate(myToken: number) {
    if (myToken !== this.connectToken) return;
    if (this.candidateIndex >= this.candidateUrls.length) {
      this.frameUrl = null;
      this.statusText = 'No se pudo conectar al stream de la cámara. Revisá la IP y la red.';
      console.error(`[CamaraComponent] Se agotaron todas las rutas candidatas. Falló la conexión a la cámara en ${this.baseHost}.`);
      return;
    }
    
    const url = this.candidateUrls[this.candidateIndex];
    this.statusText = `Probando ${url} …`;
    
    this.frameUrl = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
    console.log(`[CamaraComponent] Intentando cargar iframe/img src: ${this.frameUrl}`);
  }

  onLoad() {
    console.log(`[CamaraComponent] ¡Éxito! El stream cargó correctamente de la URL: ${this.frameUrl}`);
  }

  onError() {
    console.warn(`[CamaraComponent] Error al cargar la imagen de la URL: ${this.frameUrl}`);
    const myToken = this.connectToken;
    this.candidateIndex++;
    this.tryNextCandidate(myToken);
  }

  toggleFlash() {
    this.flashOn = !this.flashOn;
    this.camaraService.sendLedCommand(this.deviceKey, this.flashOn);
  }
}
