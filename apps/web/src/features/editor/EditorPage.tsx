import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FORMATS, availableViews, canvasSize } from '@cartelera/core';
import { getTemplate } from '@cartelera/templates';
import { es } from '../../i18n/es';
import { useEditor } from '../../stores/editorStore';
import { CutsOverlay } from './CutsOverlay';
import { ExportBar } from './ExportBar';
import { FieldsPanel } from './FieldsPanel';
import { PreviewStage } from './PreviewStage';
import { SafeZoneControl } from './SafeZoneControl';
import { SafeZoneOverlay } from './SafeZoneOverlay';
import { SlideControls } from './SlideControls';
import { SlideStrip } from './SlideStrip';

export function EditorPage() {
  const { templateId = '' } = useParams();
  const template = getTemplate(templateId);
  const { values, palette, assets, load, safeView, slides, showCuts } = useEditor();

  useEffect(() => {
    if (template) load(template);
  }, [template, load]);

  if (!template) {
    return (
      <main className="p-8">
        <p>{es.editor.notFound}</p>
        <Link className="text-indigo-700 underline" to="/">{es.editor.back}</Link>
      </main>
    );
  }

  const format = FORMATS[template.formats[0]!];
  const isCarousel = format.slides !== undefined;
  const canvas = canvasSize(format, slides);
  const activeView = safeView && availableViews(format).includes(safeView) ? safeView : null;

  let overlay;
  if (isCarousel) overlay = showCuts ? <CutsOverlay slides={slides} /> : undefined;
  else if (activeView) overlay = <SafeZoneOverlay format={format} view={activeView} />;

  return (
    <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 p-4 md:grid-cols-[minmax(0,1fr)_360px] md:p-8">
      <Link className="text-sm text-indigo-700 underline md:col-span-2" to={`/crear/${format.id}`}>
        {es.editor.otherTemplate}
      </Link>
      <section aria-label="Vista previa">
        {palette && (
          <PreviewStage width={canvas.width} height={canvas.height} overlay={overlay}>
            <template.Component
              values={values}
              palette={palette}
              fonts={template.fonts}
              size={{ w: canvas.width, h: canvas.height }}
              slides={isCarousel ? slides : undefined}
              slideWidth={isCarousel ? format.width : undefined}
              assets={assets}
              mode="preview"
            />
          </PreviewStage>
        )}
        {isCarousel ? (
          <>
            <SlideControls />
            <SlideStrip template={template} format={format} />
          </>
        ) : (
          <SafeZoneControl format={format} />
        )}
      </section>
      <aside className="space-y-6 rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/10">
        <FieldsPanel template={template} />
        {isCarousel ? (
          <p className="border-t border-black/10 pt-5 text-sm text-black/70">{es.carousel.exportSoon}</p>
        ) : (
          <ExportBar template={template} format={format} />
        )}
      </aside>
    </main>
  );
}
