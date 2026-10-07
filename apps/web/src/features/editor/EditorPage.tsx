import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FORMATS } from '@cartelera/core';
import { getTemplate } from '@cartelera/templates';
import { es } from '../../i18n/es';
import { useEditor } from '../../stores/editorStore';
import { ExportBar } from './ExportBar';
import { FieldsPanel } from './FieldsPanel';
import { PreviewStage } from './PreviewStage';

export function EditorPage() {
  const { templateId = '' } = useParams();
  const template = getTemplate(templateId);
  const { values, palette, assets, load } = useEditor();

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

  return (
    <main className="mx-auto grid max-w-7xl gap-8 p-4 md:grid-cols-[minmax(0,1fr)_360px] md:p-8">
      <section aria-label="Vista previa">
        {palette && (
          <PreviewStage width={format.width} height={format.height}>
            <template.Component
              values={values}
              palette={palette}
              fonts={template.fonts}
              size={{ w: format.width, h: format.height }}
              assets={assets}
              mode="preview"
            />
          </PreviewStage>
        )}
      </section>
      <aside className="space-y-6 rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/10">
        <FieldsPanel template={template} />
        <ExportBar template={template} format={format} />
      </aside>
    </main>
  );
}
