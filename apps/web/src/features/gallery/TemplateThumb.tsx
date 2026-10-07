import { FORMATS } from '@cartelera/core';
import type { TemplateDef } from '@cartelera/templates';
import { PreviewStage } from '../editor/PreviewStage';

/** Miniatura viva: la propia plantilla renderizada con sus valores por defecto. */
export function TemplateThumb({ template }: { template: TemplateDef }) {
  const format = FORMATS[template.formats[0]!];
  return (
    <PreviewStage width={format.width} height={format.height}>
      <template.Component
        values={template.defaults}
        palette={template.palette}
        fonts={template.fonts}
        size={{ w: format.width, h: format.height }}
        assets={{}}
        mode="preview"
      />
    </PreviewStage>
  );
}
