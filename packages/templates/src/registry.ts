import type { FormatId } from '@cartelera/core';
import type { TemplateDef } from './types';
import { ytImpacto } from './yt-impacto';
import { ytVersiculo } from './yt-versiculo';

export const TEMPLATES: TemplateDef[] = [ytImpacto, ytVersiculo];

export function getTemplate(id: string): TemplateDef | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function templatesFor(format: FormatId): TemplateDef[] {
  return TEMPLATES.filter((t) => t.formats.includes(format));
}
