import type { Design, FieldValues, FontPair, Palette } from '@cartelera/core';
import type { TemplateDef } from '@cartelera/templates';

export interface DesignSnapshot {
  designId: string;
  title: string;
  values: FieldValues;
  palette: Palette;
  fonts: FontPair;
  slides: number;
}

/** Título automático si la persona no puso uno: el primer texto significativo de la plantilla. */
export function deriveTitle(template: TemplateDef, values: FieldValues): string {
  for (const key of ['title', 'verse', 'subtitle']) {
    const v = values[key];
    if (typeof v === 'string' && v.trim()) return v.trim().replace(/\s+/g, ' ').slice(0, 48);
  }
  return template.name;
}

export function toDesign(s: DesignSnapshot, template: TemplateDef, now = Date.now()): Design {
  const carousel = template.formats.includes('ig-carousel');
  return {
    v: 1,
    id: s.designId,
    title: s.title.trim() || deriveTitle(template, s.values),
    templateId: template.id,
    formatId: template.formats[0]!,
    values: s.values,
    palette: s.palette,
    fonts: s.fonts,
    ...(carousel ? { slides: s.slides } : {}),
    updatedAt: now,
  };
}

/** IDs de imágenes que usa un diseño según los campos de tipo imagen de su plantilla. */
export function assetIdsOf(design: Pick<Design, 'values'>, template: TemplateDef): string[] {
  const ids: string[] = [];
  for (const f of template.fields) {
    if (f.type !== 'image') continue;
    const v = design.values[f.key];
    if (typeof v === 'string' && v) ids.push(v);
  }
  return ids;
}
