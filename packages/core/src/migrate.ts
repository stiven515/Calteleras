import type { BrandKit, Design, FontPair, Palette } from './types';

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const HEX = /^#[0-9a-f]{6}$/i;

function asPalette(v: unknown): Palette | null {
  if (!isObj(v)) return null;
  const { bg, fg, accent, muted } = v;
  if (![bg, fg, accent, muted].every((c) => isStr(c) && HEX.test(c))) return null;
  return { bg, fg, accent, muted } as Palette;
}

function asFonts(v: unknown): FontPair | null {
  return isObj(v) && isStr(v.heading) && isStr(v.body) ? { heading: v.heading, body: v.body } : null;
}

/**
 * Valida y normaliza un diseño venido de IndexedDB o de la nube.
 * Devuelve null si no se puede interpretar (versión futura o datos corruptos): nunca lanza.
 * Cuando exista la v2, aquí se encadenan las migraciones v1 → v2.
 */
export function migrateDesign(raw: unknown): Design | null {
  if (!isObj(raw) || raw.v !== 1) return null;
  const palette = asPalette(raw.palette);
  const fonts = asFonts(raw.fonts);
  if (!isStr(raw.id) || !isStr(raw.templateId) || !isStr(raw.formatId) || !isObj(raw.values) || !palette || !fonts) return null;
  const slides = typeof raw.slides === 'number' && Number.isFinite(raw.slides) ? raw.slides : undefined;
  return {
    v: 1,
    id: raw.id,
    title: isStr(raw.title) ? raw.title : 'Sin título',
    templateId: raw.templateId,
    formatId: raw.formatId as Design['formatId'],
    values: raw.values as Design['values'],
    palette,
    fonts,
    ...(slides !== undefined ? { slides } : {}),
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : 0,
  };
}

export function migrateBrandKit(raw: unknown): BrandKit | null {
  if (!isObj(raw) || raw.v !== 1) return null;
  return {
    v: 1,
    logoAssetId: isStr(raw.logoAssetId) ? raw.logoAssetId : null,
    palette: asPalette(raw.palette),
    fonts: asFonts(raw.fonts),
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : 0,
  };
}
