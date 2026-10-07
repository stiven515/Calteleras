import { FORMATS, canvasSize } from '@cartelera/core';
import type { TemplateDef } from '@cartelera/templates';
import { PreviewStage } from '../editor/PreviewStage';

/** Miniatura viva: la propia plantilla renderizada con sus valores por defecto. */
export function TemplateThumb({ template }: { template: TemplateDef }) {
  const format = FORMATS[template.formats[0]!];
  const slides = format.slides?.default;
  const canvas = canvasSize(format, slides);
  return (
    <PreviewStage width={canvas.width} height={canvas.height}>
      <template.Component
        values={template.defaults}
        palette={template.palette}
        fonts={template.fonts}
        size={{ w: canvas.width, h: canvas.height }}
        slides={slides}
        slideWidth={slides ? format.width : undefined}
        assets={{}}
        mode="preview"
      />
    </PreviewStage>
  );
}
