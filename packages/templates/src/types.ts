import type { ComponentType } from 'react';
import type { FieldDef, FieldValues, FontPair, FormatId, Palette } from '@cartelera/core';

export interface TemplateProps {
  values: FieldValues;
  palette: Palette;
  fonts: FontPair;
  /** Tamaño real del lienzo en píxeles (en carrusel, N × ancho). */
  size: { w: number; h: number };
  /** id de asset → URL utilizable en <img>. */
  assets: Record<string, string>;
  mode: 'preview' | 'export';
}

/** Manifiesto: datos puros, sin código de render. */
export interface TemplateManifest {
  id: string;
  name: string;
  formats: FormatId[];
  tags: string[];
  fields: FieldDef[];
  defaults: FieldValues;
  palette: Palette;
  fonts: FontPair;
}

export interface TemplateDef extends TemplateManifest {
  Component: ComponentType<TemplateProps>;
}
