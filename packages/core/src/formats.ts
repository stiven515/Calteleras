import type { FormatId, FormatSpec } from './types';

export const FORMATS: Record<FormatId, FormatSpec> = {
  'yt-thumb': {
    id: 'yt-thumb',
    label: 'Miniatura de YouTube',
    width: 1280,
    height: 720,
    safeZones: [
      {
        id: 'timestamp',
        label: 'Duración del video',
        kind: 'covered',
        rect: { x: 0.84, y: 0.86, w: 0.16, h: 0.14 },
      },
    ],
  },
  'ig-post': {
    id: 'ig-post',
    label: 'Post de Instagram',
    width: 1080,
    height: 1350,
    safeZones: [
      {
        id: 'grid-crop',
        label: 'Recorte en la cuadrícula del perfil (3:4)',
        kind: 'keep-inside',
        rect: { x: 0.0, y: 0.0417, w: 1, h: 0.9167 },
      },
    ],
  },
  'ig-carousel': {
    id: 'ig-carousel',
    label: 'Carrusel panorámico de Instagram',
    width: 1080,
    height: 1350,
    slides: { min: 2, max: 10, default: 3 },
    safeZones: [],
  },
  'yt-banner': {
    id: 'yt-banner',
    label: 'Portada de YouTube',
    width: 2560,
    height: 1440,
    safeZones: [
      {
        id: 'all-devices',
        label: 'Visible en todos los dispositivos',
        kind: 'keep-inside',
        rect: { x: (2560 - 1546) / 2 / 2560, y: (1440 - 423) / 2 / 1440, w: 1546 / 2560, h: 423 / 1440 },
      },
    ],
  },
  'fb-cover': { id: 'fb-cover', label: 'Portada de Facebook', width: 1640, height: 624, safeZones: [] },
  'ig-story': { id: 'ig-story', label: 'Historia o reel', width: 1080, height: 1920, safeZones: [] },
};

/** Formatos activos en el MVP. */
export const MVP_FORMATS: FormatId[] = ['yt-thumb', 'ig-post', 'ig-carousel'];

export function getFormat(id: FormatId): FormatSpec {
  return FORMATS[id];
}

/** Tamaño total del lienzo: en carrusel es N veces el ancho de una imagen. */
export function canvasSize(format: FormatSpec, slides = 1): { width: number; height: number } {
  return { width: format.width * (format.slides ? slides : 1), height: format.height };
}
