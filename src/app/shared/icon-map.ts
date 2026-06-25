import {
  LucideBan,
  LucideBell,
  LucideBolt,
  LucideCamera,
  LucideCheck,
  LucideCirclePlus,
  LucideClock,
  LucideCloudLightning,
  LucideFan,
  LucideHand,
  LucideHeadphones,
  LucideHelpCircle,
  LucideInfo,
  LucideLampFloor,
  LucideLightbulb,
  LucideLock,
  LucideMic,
  LucidePlug,
  LucideSmartphone,
  LucideSparkles,
  LucideSpeaker,
  LucideTriangleAlert,
  LucideTv,
  LucideTvMinimal,
  LucideWifi,
  LucideWind,
  LucideZap,
} from '@lucide/angular';

type LucideIcon = any;

const DEVICE_ICONS_BY_NAME: Record<string, LucideIcon> = {
  audifonos: LucideHeadphones,
  audífonos: LucideHeadphones,
  bocinas: LucideSpeaker,
  foco: LucideLightbulb,
  focos: LucideLightbulb,
  luz: LucideLightbulb,
  luces: LucideLampFloor,
  ventilador: LucideWind,
  television: LucideTvMinimal,
  televisión: LucideTvMinimal,
  tv: LucideTv,
  sockets: LucidePlug,
  socket: LucidePlug,
  asistente: LucideCirclePlus,
  predeterminado: LucideHelpCircle,
  headphones: LucideHeadphones,
  speaker: LucideSpeaker,
  lightbulb: LucideLightbulb,
  'lamp-floor': LucideLampFloor,
  wind: LucideWind,
  'tv-minimal': LucideTvMinimal,
  plug: LucidePlug,
  fan: LucideFan,
  lock: LucideLock,
  camera: LucideCamera,
  wifi: LucideWifi,
  'circle-plus': LucideCirclePlus,
  plus: LucideCirclePlus,
  'input-add': LucideCirclePlus,
  help: LucideHelpCircle,
  'help-circle': LucideHelpCircle,
  bocina: LucideSpeaker,
  ventiladores: LucideWind,
};

const TOAST_ICONS_BY_NAME: Record<string, LucideIcon> = {
  success: LucideCheck,
  check: LucideCheck,
  error: LucideBan,
  ban: LucideBan,
  warning: LucideTriangleAlert,
  'triangle-alert': LucideTriangleAlert,
  info: LucideInfo,
  loading: LucideClock,
  clock: LucideClock,
  hand: LucideHand,
  bell: LucideBell,
  sparkles: LucideSparkles,
};

function normalizeIconName(value: string | undefined): string {
  return (value ?? '')
    .trim()
    .replace(/^Lucide/, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/^\/?icons\//, '')
    .replace(/\.svg$/, '')
    .replace(/_/g, '-')
    .replace(/^ic-/, '');
}

export function getDeviceIcon(tipoOIcono: string | undefined): LucideIcon {
  const key = normalizeIconName(tipoOIcono);
  return DEVICE_ICONS_BY_NAME[key] ?? LucideHelpCircle;
}

export function getGestureIcon(icono: string | undefined): LucideIcon {
  const key = normalizeIconName(icono);

  if (key.includes('mano') || key.includes('hand') || key.includes('puño')) return LucideHand;
  if (key.includes('foco') || key.includes('luz') || key.includes('light')) return LucideLightbulb;
  if (key.includes('voz') || key.includes('mic')) return LucideMic;

  return LucideHand;
}

export function getToastIcon(icono: string | undefined, type: string = 'info'): LucideIcon {
  const key = normalizeIconName(icono || type);
  return TOAST_ICONS_BY_NAME[key] ?? TOAST_ICONS_BY_NAME[type] ?? LucideSparkles;
}

export function getActivityIcon(icono: string | undefined, estado?: string, accion?: string): LucideIcon {
  if (estado === 'Error') return LucideTriangleAlert;

  const direct = TOAST_ICONS_BY_NAME[normalizeIconName(icono)];
  if (direct) return direct;

  if (!icono && !accion) return LucideSparkles;

  const i = normalizeIconName(icono);
  const a = (accion ?? '').toLowerCase();

  if (i.includes('bolt') || i.includes('zap') || a.includes('encend') || a.includes(' on')) return LucideCloudLightning;
  if (i.includes('camera') || a.includes('camara') || a.includes('cámara') || a.includes('cam')) return LucideCamera;
  if (i.includes('wifi') || a.includes('wifi') || a.includes('red')) return LucideWifi;
  if (i.includes('lock') || a.includes('bloq') || a.includes('segur')) return LucideLock;
  if (i.includes('fan') || a.includes('ventil') || a.includes('aire')) return LucideFan;
  if (i.includes('speaker') || a.includes('altav') || a.includes('audio')) return LucideSpeaker;
  if (i.includes('tv') || a.includes('tv') || a.includes('tele')) return LucideTv;
  if (i.includes('lightbulb') || i.includes('light') || a.includes('luz') || a.includes('ilumin')) return LucideLightbulb;
  if (i.includes('headphones')) return LucideHeadphones;
  if (i.includes('lamp')) return LucideLampFloor;
  if (i.includes('wind')) return LucideWind;
  if (i.includes('plug')) return LucidePlug;
  if (i.includes('smartphone') || i.includes('phone')) return LucideSmartphone;
  if (i.includes('bell')) return LucideBell;

  return LucideSparkles;
}

export function getMethodIcon(metodo: string | undefined): LucideIcon {
  const m = (metodo ?? '').toLowerCase();

  if (m.includes('gesto')) return LucideHand;
  if (m.includes('app') || m.includes('movil') || m.includes('móvil')) return LucideSmartphone;
  if (m.includes('auto')) return LucideBolt;
  if (m.includes('voz')) return LucideMic;

  return LucideSparkles;
}

export const ALL_ICONS = [
  LucideBan, LucideBell, LucideBolt, LucideCamera, LucideCheck, LucideCirclePlus, LucideClock,
  LucideCloudLightning, LucideFan, LucideHand, LucideHeadphones, LucideHelpCircle, LucideInfo,
  LucideLampFloor, LucideLightbulb, LucideLock, LucideMic, LucidePlug, LucideSmartphone,
  LucideSparkles, LucideSpeaker, LucideTriangleAlert, LucideTv, LucideTvMinimal, LucideWifi,
  LucideWind, LucideZap,
];
