import { computeSlices, type FormatSpec } from '@cartelera/core';
import type { TemplateDef } from '@cartelera/templates';
import { es } from '../../i18n/es';
import { useEditor } from '../../stores/editorStore';
import { PreviewStage } from './PreviewStage';
import { SliceFrame } from './SliceFrame';

/** Cómo quedará cada imagen exportada, en el orden en que se suben a Instagram. */
export function SlideStrip({ template, format }: { template: TemplateDef; format: FormatSpec }) {
  const { values, palette, fonts, assets, slides } = useEditor();
  if (!palette || !fonts) return null;
  const parts = computeSlices(slides, format.width, format.height);

  return (
    <section aria-label={es.carousel.stripLabel} className="mt-6">
      <h2 className="mb-2 text-sm font-semibold">{es.carousel.stripLabel}</h2>
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {parts.map((p) => (
          <li key={p.index} className="min-w-0">
            <PreviewStage width={p.width} height={p.height}>
              <SliceFrame width={p.width} height={p.height} offsetX={p.offsetX}>
                <template.Component
                  values={values}
                  palette={palette}
                  fonts={fonts}
                  size={{ w: p.width * slides, h: p.height }}
                  slides={slides}
                  slideWidth={p.width}
                  assets={assets}
                  mode="preview"
                />
              </SliceFrame>
            </PreviewStage>
            <p className="mt-1 text-center text-xs text-black/60">{p.index + 1}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
