import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../core/config/app-config';
import { ENDPOINTS } from '../core/config/endpoints';

@Injectable({ providedIn: 'root' })
export class CamaraService {
  private socket?: WebSocket;

  connect(deviceKey: string, onFrame: (url: string) => void, onError: (e: Event) => void) {
    const wsUrl = APP_CONFIG.apiBaseUrl.replace('http', 'ws');
    this.socket = new WebSocket(`${wsUrl}${ENDPOINTS.camaraWs}/${deviceKey}`);
    this.socket.binaryType = 'blob';

    this.socket.onmessage = (event: MessageEvent) => {
      const blob: Blob = event.data;
      const url = URL.createObjectURL(blob);
      onFrame(url);
    };
    this.socket.onerror = onError;
  }

  disconnect() {
    this.socket?.close();
  }
}
