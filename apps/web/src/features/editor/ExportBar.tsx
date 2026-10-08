import { useState } from 'react';
import type { FormatSpec } from '@cartelera/core';
import type { TemplateDef } from '@cartelera/templates';
import { es } from '../../i18n/es';
import { useEditor } from '../../stores/editorStore';
import { downloadBlob, exportFilename, renderToBlob, type ExportFormat } from '../export/export';

export function ExportBar({ template, format }: { template: TemplateDef; format: FormatSpec }) {
  const [ext, setExt] = useState<ExportFormat>('png');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const slides = useEditor((s) => s.slides);
  const isCarousel = format.slides !== undefined;

  async function exportSingle() {
    const { values, palette, fonts, assets } = useEditor.getState();
    if (!palette || !fonts) return;
    const blob = await renderToBlob({
      element: (
        <template.Component
          values={values}
          palette={palette}
          fonts={fonts}
          size={{ w: format.width, h: format.height }}
          assets={assets}
          mode="export"
        />
      ),
      width: format.width,
      height: format.height,
      format: ext,
      background: palette.bg,
    });
    downloadBlob(blob, exportFilename(String(values.title ?? template.id), ext));
  }

  async function exportCarousel() {
    const { values, palette, fonts, assets, slides: count } = useEditor.getState();
    if (!palette || !fonts) return;
    const { renderCarouselSlices } = await import('../export/carousel');
    const { blobToBytes, zipFiles } = await import('../export/zip');
    const blobs = await renderCarouselSlices({
      template, format, slides: count, values, palette, fonts, assets, ext,
      onProgress: (done, total) => setProgress({ done, total }),
    });
    const files: Record<string, Uint8Array> = {};
    for (const [i, blob] of blobs.entries()) files[exportFilename('x', ext, i)] = await blobToBytes(blob);
    const base = exportFilename(String(values.title ?? template.id), 'png').replace(/\.png$/, '');
    downloadBlob(zipFiles(files), `${base}.zip`);
  }

  async function onExport() {
    setBusy(true);
    setError(null);
    setProgress(null);
    try {
      await (isCarousel ? exportCarousel() : exportSingle());
    } catch {
      setError(es.export.error);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  let label: string;
  if (busy) label = progress ? es.export.progress(progress.done, progress.total) : es.export.working;
  else if (isCarousel) label = es.export.downloadZip(slides, ext.toUpperCase());
  else label = `${es.export.download} ${ext.toUpperCase()} · ${format.width}×${format.height}`;

  return (
    <section aria-labelledby="sec-export" className="space-y-3 border-t border-black/10 pt-5">
      <h2 id="sec-export" className="text-lg font-semibold">{es.export.title}</h2>
      <div role="radiogroup" aria-label={es.export.formatLabel} className="flex gap-2">
        {(['png', 'jpg'] as const).map((f) => (
          <button
            key={f}
            type="button"
            role="radio"
            aria-checked={ext === f}
            onClick={() => setExt(f)}
            className={`rounded-md px-4 py-2 text-sm font-medium ring-1 ring-black/15 ${ext === f ? 'bg-black text-white' : 'bg-white'}`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onExport}
        disabled={busy}
        className="w-full rounded-full bg-black px-4 py-3 font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {label}
      </button>
      {isCarousel && <p className="text-sm text-black/70">{es.export.zipHint}</p>}
      <p role="status" aria-live="polite" className="text-sm text-red-700">{error}</p>
    </section>
  );
}
