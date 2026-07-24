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
  LucidePower,
  LucideHome,
  LucideDoorOpen,
  LucidePlus,
  LucideTrash2,
  LucideMoreVertical,
  LucideEdit,
  LucideX,
  LucideSearch,
  LucideMapPin,
  LucideLayoutDashboard,
  LucideChevronRight,
  LucideChevronDown,
  LucideChevronLeft,
  LucideDownload,
  LucideMaximize,
  LucideSettings,
  LucideRotateCw,
  LucideRotateCcw,
  LucideVolume2,
  LucideVolumeX,
  LucidePause,
  LucidePlay,
  LucideBluetooth,
  LucideHash,
  LucideCalendarDays,
  LucideMenu,
  LucideSun,
  LucidePencil,
  LucideLogOut,
  LucideUser,
  LucideSofa,
  LucideBath,
  LucideBed,
  LucideUtensils,
  LucideCar,
  LucideTreePine,
  LucideImage,
  LucideSlidersHorizontal
} from '@lucide/angular';

type LucideIcon = any;

const DEVICE_ICONS_BY_NAME: Record<string, LucideIcon> = {
  audifonos: LucideHeadphones,
  audífonos: LucideHeadphones,
  bocinas: LucideSpeaker,
  bell: LucideBell,
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
  'input-add': LucideCirclePlus,
  help: LucideHelpCircle,
  'help-circle': LucideHelpCircle,
  bocina: LucideSpeaker,
  ventiladores: LucideWind,
  home: LucideHome,
  casa: LucideHome,
  'door-open': LucideDoorOpen,
  habitacion: LucideDoorOpen,
  plus: LucidePlus,
  edit: LucideEdit,
  trash: LucideTrash2,
  'trash-2': LucideTrash2,
  x: LucideX,
  search: LucideSearch,
  'layout-dashboard': LucideLayoutDashboard,
  'chevron-right': LucideChevronRight,
  'chevron-down': LucideChevronDown,
  'chevron-left': LucideChevronLeft,
  download: LucideDownload,
  maximize: LucideMaximize,
  settings: LucideSettings,
  'rotate-cw': LucideRotateCw,
  'rotate-ccw': LucideRotateCcw,
  'volume-2': LucideVolume2,
  'volume-x': LucideVolumeX,
  pause: LucidePause,
  play: LucidePlay,
  bluetooth: LucideBluetooth,
  hash: LucideHash,
  'calendar-days': LucideCalendarDays,
  menu: LucideMenu,
  sun: LucideSun,
  pencil: LucidePencil,
  'log-out': LucideLogOut,
  user: LucideUser,
  smartphone: LucideSmartphone,
  hand: LucideHand,
  bolt: LucideBolt,
  clock: LucideClock,
  ellipsis: LucideMoreVertical,
  'map-pin': LucideMapPin,
  check: LucideCheck,
  'check-circle': LucideCheck,
  info: LucideInfo,
  warning: LucideTriangleAlert,
  error: LucideBan,
  image: LucideImage,
  power: LucidePower,
  zap: LucideZap,
  // Iconos para habitaciones
  armchair: LucideSofa,
  sofa: LucideSofa,
  bath: LucideBath,
  bed: LucideBed,
  utensils: LucideUtensils,
  'utensils-crossed': LucideUtensils,
  car: LucideCar,
  'tree-pine': LucideTreePine,
  'sliders-horizontal': LucideSlidersHorizontal
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
  history: LucideClock,
  hand: LucideHand,
  bell: LucideBell,
  sparkles: LucideSparkles,
  sun: LucideSun,
  camera: LucideCamera,
  play: LucidePlay
};

function normalizeIconName(value: string | undefined): string {
  return (value ?? '')
    .trim()
    .replace(/^Lucide/, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/^\/?icons\//, '')
    .replace(/\\.svg$/, '')
    .replace(/_/g, '-')
    .replace(/^ic-/, '');
}

export function getDeviceIcon(tipoOIcono: string | undefined): LucideIcon {
  const key = normalizeIconName(tipoOIcono);
  return DEVICE_ICONS_BY_NAME[key] ?? TOAST_ICONS_BY_NAME[key] ?? LucideHelpCircle;
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
  const key = normalizeIconName(icono);
  return DEVICE_ICONS_BY_NAME[key] ?? LucideClock;
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
  LucideSparkles, LucideSpeaker, LucideTriangleAlert, LucideTv,  LucideTvMinimal, LucideWifi,
  LucideWind, LucideZap, LucidePower, LucideHome, LucideDoorOpen,
  LucidePlus, LucideTrash2, LucideEdit, LucideX, LucideSearch,
  LucideLayoutDashboard, LucideChevronRight, LucideChevronDown, LucideChevronLeft,
  LucideDownload, LucideMaximize, LucideSettings, LucideRotateCw, LucideRotateCcw,
  LucideVolume2, LucideVolumeX, LucidePause, LucidePlay, LucideBluetooth,
  LucideHash, LucideCalendarDays, LucideMenu, LucideSun, LucidePencil,
  LucideLogOut, LucideUser
];
