import { useState } from 'react';
import type { FormatSpec } from '@cartelera/core';
import type { TemplateDef } from '@cartelera/templates';
import { es } from '../../i18n/es';
import { useEditor } from '../../stores/editorStore';
import { downloadBlob, exportFilename, renderToBlob, type ExportFormat } from '../export/export';

export function ExportBar({ template, format }: { template: TemplateDef; format: FormatSpec }) {
  const [ext, setExt] = useState<ExportFormat>('png');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onExport() {
    const { values, palette, assets } = useEditor.getState();
    if (!palette) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await renderToBlob({
        element: (
          <template.Component
            values={values}
            palette={palette}
            fonts={template.fonts}
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
    } catch {
      setError(es.export.error);
    } finally {
      setBusy(false);
    }
  }

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
            className={`rounded-md px-4 py-2 text-sm font-medium ring-1 ring-black/15 ${ext === f ? 'bg-indigo-600 text-white' : 'bg-white'}`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onExport}
        disabled={busy}
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {busy ? es.export.working : `${es.export.download} ${ext.toUpperCase()} · ${format.width}×${format.height}`}
      </button>
      <p role="status" aria-live="polite" className="text-sm text-red-700">{error}</p>
    </section>
  );
}
