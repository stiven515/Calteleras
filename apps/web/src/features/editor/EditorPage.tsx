import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FORMATS, availableViews, canvasSize } from '@cartelera/core';
import { getTemplate } from '@cartelera/templates';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { es } from '../../i18n/es';
import { useEditor } from '../../stores/editorStore';
import { scheduleSync } from '../cloud/session';
import { resolveAssetUrls } from '../storage/assets';
import { useStorage } from '../storage/storageStore';
import { CutsOverlay } from './CutsOverlay';
import { assetIdsOf } from './design';
import { ExportBar } from './ExportBar';
import { FieldsPanel } from './FieldsPanel';
import { PreviewStage } from './PreviewStage';
import { SafeZoneControl } from './SafeZoneControl';
import { SafeZoneOverlay } from './SafeZoneOverlay';
import { SlideControls } from './SlideControls';
import { SlideStrip } from './SlideStrip';
import { useAutosave } from './useAutosave';

export function EditorPage() {
  const { templateId = '', designId } = useParams();
  const navigate = useNavigate();
  const template = getTemplate(templateId);
  const repos = useStorage((s) => s.repos);
  const { values, palette, fonts, assets, safeView, slides, showCuts, title, setTitle, templateId: loadedId } = useEditor();
  const [missing, setMissing] = useState(false);
  useDocumentTitle(template?.name);

  // Abre un diseño guardado o empieza uno nuevo.
  useEffect(() => {
    if (!template || !repos) return;
    let cancelled = false;
    setMissing(false);
    void (async () => {
      const s = useEditor.getState();
      if (!designId) {
        s.startNew(template);
        return;
      }
      if (s.designId === designId) return; // ya cargado (p. ej. tras el primer guardado)
      const d = await repos.designs.get(designId);
      if (cancelled) return;
      if (!d) return setMissing(true);
      const urls = await resolveAssetUrls(assetIdsOf(d, template));
      if (!cancelled) useEditor.getState().hydrate(d, urls);
    })();
    return () => {
      cancelled = true;
    };
  }, [template, designId, repos]);

  const status = useAutosave(template, (d) => {
    scheduleSync();
    if (!designId) navigate(`/editor/${d.templateId}/${d.id}`, { replace: true });
  });

  if (!template) {
    return (
      <main className="p-8">
        <p>{es.editor.notFound}</p>
        <Link className="text-black underline" to="/">{es.editor.back}</Link>
      </main>
    );
  }
  if (missing) {
    return (
      <main className="p-8">
        <p>{es.editor.designMissing}</p>
        <Link className="text-black underline" to="/cuenta">{es.editor.toMyDesigns}</Link>
      </main>
    );
  }

  const format = FORMATS[template.formats[0]!];
  const isCarousel = format.slides !== undefined;
  const canvas = canvasSize(format, slides);
  const activeView = safeView && availableViews(format).includes(safeView) ? safeView : null;
  const ready = loadedId === template.id && palette !== null && fonts !== null;

  let overlay;
  if (isCarousel) overlay = showCuts ? <CutsOverlay slides={slides} /> : undefined;
  else if (activeView) overlay = <SafeZoneOverlay format={format} view={activeView} />;

  return (
    // En celular la vista previa queda fija arriba (sticky) mientras se baja a editar; en escritorio
    // son dos columnas. Por eso la vista previa, los controles y el panel son hijos directos de la rejilla.
    <main className="mx-auto grid max-w-7xl grid-cols-1 gap-x-8 gap-y-4 p-4 md:grid-cols-[minmax(0,1fr)_360px] md:grid-rows-[auto_auto_auto_1fr] md:gap-y-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-2">
        <Link className="text-sm text-black underline" to={`/crear/${format.id}`}>
          {es.editor.otherTemplate}
        </Link>
        <p role="status" aria-live="polite" className="text-sm text-black/60">
          {es.editor.saveStatus[status]}
        </p>
      </div>
      <section
        aria-label="Vista previa"
        className="sticky top-0 z-10 -mx-4 bg-white px-4 pb-2 pt-2 md:static md:col-start-1 md:mx-0 md:bg-transparent md:p-0"
      >
        {ready && (
          <div
            className="mx-auto max-w-[var(--mw)] md:max-w-none"
            style={{ ['--mw' as string]: `calc(34vh * ${canvas.width / canvas.height})` }}
          >
            <PreviewStage width={canvas.width} height={canvas.height} overlay={overlay}>
              <template.Component
                values={values}
                palette={palette}
                fonts={fonts}
                size={{ w: canvas.width, h: canvas.height }}
                slides={isCarousel ? slides : undefined}
                slideWidth={isCarousel ? format.width : undefined}
                assets={assets}
                mode="preview"
              />
            </PreviewStage>
          </div>
        )}
      </section>
      <div className="md:col-start-1">
        {isCarousel ? (
          <>
            <SlideControls />
            <SlideStrip template={template} format={format} />
          </>
        ) : (
          <SafeZoneControl format={format} />
        )}
      </div>
      <aside className="space-y-6 rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/10 md:col-start-2 md:row-span-3 md:row-start-2">
        <div>
          <label htmlFor="design-title" className="mb-1 block text-sm font-medium">{es.editor.designName}</label>
          <input
            id="design-title"
            className="w-full rounded-md border border-black/15 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-black"
            value={title}
            maxLength={60}
            placeholder={es.editor.designNamePlaceholder}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <FieldsPanel template={template} />
        <ExportBar template={template} format={format} />
      </aside>
    </main>
  );
}
