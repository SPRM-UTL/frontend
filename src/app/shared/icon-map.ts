/**
 * Registro centralizado de iconos Lucide.
 * Cada componente importa estas funciones para obtener el objeto icono
 * directamente y usarlo con <svg [lucideIcon]="icon">.
 * No se necesitan @switch ni cadenas intermedias.
 */
import {
  LucideHeadphones,
  LucideSpeaker,
  LucideLightbulb,
  LucideLampFloor,
  LucideWind,
  LucideTvMinimal,
  LucidePlug,
  LucideCirclePlus,
  LucideHelpCircle,
  LucideHand,
  LucideMic,
  LucideSmartphone,
  LucideSparkles,
  LucideTriangleAlert,
  LucideCloudLightning,
  LucideCamera,
  LucideWifi,
  LucideLock,
  LucideFan,
  LucideTv,
  LucideBolt,
  LucideBell,
  LucideZap,
} from '@lucide/angular';

/** Mapa de tipo de aparato (español) → icono Lucide */
export const CATEGORY_ICON_MAP: Record<string, any> = {
  'Audífonos':     LucideHeadphones,
  'Bocinas':       LucideSpeaker,
  'Focos':         LucideLightbulb,
  'Luces':         LucideLampFloor,
  'Ventilador':    LucideWind,
  'Televisión':    LucideTvMinimal,
  'Sockets':       LucidePlug,
  'Asistente':     LucideCirclePlus,
  'Predeterminado': LucideHelpCircle,
};

/** Devuelve el icono de dispositivo por tipo o icono raw del backend */
export function getDeviceIcon(tipoOIcono: string | undefined): any {
  if (!tipoOIcono) return LucideHelpCircle;
  // Primero intentar por categoría en español
  if (CATEGORY_ICON_MAP[tipoOIcono]) return CATEGORY_ICON_MAP[tipoOIcono];
  
  // Normalizaciones
  let i = tipoOIcono.toLowerCase().replace('_', '-');
  if (i === 'ic-default' || i === 'ic_default' || i === 'help-circle' || i === 'help') return LucideHelpCircle;
  if (i === 'ic-input-add' || i === 'ic_input_add' || i === 'plus-circle' || i === 'circle-plus' || i === 'plus') return LucideCirclePlus;

  if (i === 'headphones')  return LucideHeadphones;
  if (i === 'speaker')     return LucideSpeaker;
  if (i === 'lightbulb')   return LucideLightbulb;
  if (i === 'lamp-floor' || i === 'lamp_floor') return LucideLampFloor;
  if (i === 'wind')        return LucideWind;
  if (i === 'tv-minimal' || i === 'tv_minimal') return LucideTvMinimal;
  if (i === 'tv')          return LucideTv;
  if (i === 'plug')        return LucidePlug;
  if (i === 'fan')         return LucideFan;
  if (i === 'lock')        return LucideLock;
  if (i === 'camera')      return LucideCamera;
  if (i === 'wifi')        return LucideWifi;
  return LucideHelpCircle;
}

/** Devuelve el icono de gesto por nombre/campo icono del backend */
export function getGestureIcon(icono: string | undefined): any {
  if (!icono) return LucideHand;
  const i = icono.toLowerCase();
  if (i.includes('mano') || i.includes('hand') || i.includes('puño')) return LucideHand;
  if (i.includes('foco') || i.includes('luz'))  return LucideLightbulb;
  if (i.includes('voz')  || i.includes('mic'))  return LucideMic;
  return LucideHand;
}

/** Devuelve el icono de actividad/historial */
export function getActivityIcon(icono: string | undefined, estado?: string, accion?: string): any {
  if (estado === 'Error') return LucideTriangleAlert;
  if (!icono && !accion) return LucideSparkles;

  const i = (icono  ?? '').toLowerCase();
  const a = (accion ?? '').toLowerCase();

  if (i.includes('bolt') || i.includes('zap') || a.includes('encend') || a.includes(' on')) return LucideCloudLightning;
  if (i.includes('camera') || a.includes('cám') || a.includes('cam'))   return LucideCamera;
  if (i.includes('wifi')   || a.includes('wifi') || a.includes('red'))  return LucideWifi;
  if (i.includes('lock')   || a.includes('bloq') || a.includes('segur')) return LucideLock;
  if (i.includes('fan')    || a.includes('ventil') || a.includes('aire')) return LucideFan;
  if (i.includes('speaker')|| a.includes('altav') || a.includes('audio')) return LucideSpeaker;
  if (i.includes('tv')     || a.includes('tv')   || a.includes('tele'))  return LucideTv;
  if (i.includes('lightbulb') || i.includes('light') || a.includes('luz') || a.includes('ilumin')) return LucideLightbulb;
  if (i.includes('headphones')) return LucideHeadphones;
  if (i.includes('lamp'))       return LucideLampFloor;
  if (i.includes('wind'))       return LucideWind;
  if (i.includes('plug'))       return LucidePlug;
  if (i.includes('smartphone') || i.includes('phone')) return LucideSmartphone;
  if (i.includes('bell'))       return LucideBell;

  return LucideSparkles;
}

/** Icono de método de disparo (historial) */
export function getMethodIcon(metodo: string | undefined): any {
  const m = (metodo ?? '').toLowerCase();
  if (m.includes('gesto'))               return LucideHand;
  if (m.includes('app') || m.includes('móvil')) return LucideSmartphone;
  if (m.includes('auto'))                return LucideBolt;
  if (m.includes('voz'))                 return LucideMic;
  return LucideSparkles;
}

/** Todos los iconos que deben registrarse globalmente con provideLucideIcons */
export const ALL_ICONS = [
  LucideHeadphones, LucideSpeaker, LucideLightbulb, LucideLampFloor, LucideWind, LucideTvMinimal, LucidePlug,
  LucideCirclePlus, LucideHelpCircle, LucideHand, LucideMic, LucideSmartphone, LucideSparkles, LucideTriangleAlert,
  LucideCloudLightning, LucideCamera, LucideWifi, LucideLock, LucideFan, LucideTv, LucideBolt, LucideBell, LucideZap,
];
