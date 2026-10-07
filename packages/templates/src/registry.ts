import type { FormatId } from '@cartelera/core';
import type { TemplateDef } from './types';
import { ytImpacto } from './yt-impacto';
import { ytVersiculo } from './yt-versiculo';
import { igEvento } from './ig-evento';
import { igRuta } from './ig-ruta';

export const TEMPLATES: TemplateDef[] = [ytImpacto, ytVersiculo, igEvento, igRuta];

export function getTemplate(id: string): TemplateDef | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function templatesFor(format: FormatId): TemplateDef[] {
  return TEMPLATES.filter((t) => t.formats.includes(format));
}
