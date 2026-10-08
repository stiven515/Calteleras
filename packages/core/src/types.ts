export type FormatId =
  | 'yt-thumb'
  | 'ig-post'
  | 'ig-carousel'
  | 'yt-banner'
  | 'fb-cover'
  | 'ig-story';

/** Rectángulo en fracciones 0–1 del lienzo. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Dónde se ve la pieza: define qué zonas seguras aplican. */
export type SafeZoneView = 'mobile' | 'desktop' | 'profile-grid';

export interface SafeZone {
  id: string;
  label: string;
  /** Vistas en las que esta zona es relevante. */
  views: SafeZoneView[];
  /** keep-inside: el contenido importante debe quedar dentro. covered/cropped: zona que se tapa o se corta. */
  kind: 'keep-inside' | 'covered' | 'cropped';
  rect: Rect;
}

export interface FormatSpec {
  id: FormatId;
  label: string;
  /** Tamaño en píxeles de UNA imagen exportada. */
  width: number;
  height: number;
  slides?: { min: number; max: number; default: number };
  safeZones: SafeZone[];
}

export type FieldDef =
  | { key: string; type: 'text' | 'textarea'; label: string; maxLength?: number }
  | { key: string; type: 'image'; label: string }
  | { key: string; type: 'select'; label: string; options: string[] }
  | { key: string; type: 'toggle'; label: string };

export type FieldValues = Record<string, string | boolean | null>;

export interface Palette {
  bg: string;
  fg: string;
  accent: string;
  muted: string;
}

export interface FontPair {
  heading: string;
  body: string;
}

/** Documento persistido y compartido. Subir `v` exige migración. */
export interface Design {
  v: 1;
  id: string;
  title: string;
  templateId: string;
  formatId: FormatId;
  values: FieldValues;
  palette: Palette;
  fonts: FontPair;
  slides?: number;
  updatedAt: number;
}

/** Kit de marca: se guarda una vez y se aplica a cualquier plantilla. */
export interface BrandKit {
  v: 1;
  logoAssetId: string | null;
  palette: Palette | null;
  fonts: FontPair | null;
  updatedAt: number;
}
