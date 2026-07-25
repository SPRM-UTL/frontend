// dashboard.types.ts

export interface UnifiedNotification {
  id: string | number;
  type: 'activity' | 'alert';
  severity: 'success' | 'error' | 'warning' | 'info' | 'default';
  title: string;
  subtitle: string;
  timeLabel: string;
  icon: any;
  statusText?: string;
  originalId: string | number;
}

export interface WeatherInfo {
  temperature: string;
  summary: string;
  place: string;
  updatedAt: string;
  icon: any;
  cssClass: string;
}

export interface GeoPosition {
  latitude: number;
  longitude: number;
  isFallback: boolean;
}
