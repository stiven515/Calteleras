import { computeSlices, type FieldValues, type FontPair, type FormatSpec, type Palette } from '@cartelera/core';
import type { TemplateDef } from '@cartelera/templates';
import { SliceFrame } from '../editor/SliceFrame';
import { renderToBlob, type ExportFormat } from './export';

interface Options {
  template: TemplateDef;
  format: FormatSpec;
  slides: number;
  values: FieldValues;
  palette: Palette;
  fonts: FontPair;
  assets: Record<string, string>;
  ext: ExportFormat;
  onProgress?: (done: number, total: number) => void;
}

/** Elemento de UNA imagen del carrusel: ventana de 1080×1350 sobre el panorama completo. */
export function sliceElement(o: Omit<Options, 'ext' | 'onProgress'>, offsetX: number) {
  const { template, format, slides, values, palette, fonts, assets } = o;
  return (
    <SliceFrame width={format.width} height={format.height} offsetX={offsetX}>
      <template.Component
        values={values}
        palette={palette}
        fonts={fonts}
        size={{ w: format.width * slides, h: format.height }}
        slides={slides}
        slideWidth={format.width}
        assets={assets}
        mode="export"
      />
    </SliceFrame>
  );
}

/** Renderiza las N imágenes en orden, una a una (evita picos de memoria en móviles). */
export async function renderCarouselSlices(o: Options): Promise<Blob[]> {
  const parts = computeSlices(o.slides, o.format.width, o.format.height);
  const blobs: Blob[] = [];
  for (const p of parts) {
    blobs.push(
      await renderToBlob({
        element: sliceElement(o, p.offsetX),
        width: p.width,
        height: p.height,
        format: o.ext,
        background: o.palette.bg,
      }),
    );
    o.onProgress?.(p.index + 1, parts.length);
  }
  return blobs;
}
