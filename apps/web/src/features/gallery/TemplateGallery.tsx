import { Link, useParams } from 'react-router-dom';
import { FORMATS, MVP_FORMATS, type FormatId } from '@cartelera/core';
import { templatesFor } from '@cartelera/templates';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { es } from '../../i18n/es';
import { TemplateThumb } from './TemplateThumb';

function isFormatId(v: string): v is FormatId {
  return (MVP_FORMATS as string[]).includes(v);
}

export function TemplateGallery() {
  const { formatId = '' } = useParams();
  useDocumentTitle(isFormatId(formatId) ? FORMATS[formatId].label : undefined);

  if (!isFormatId(formatId)) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <p>{es.create.unknownFormat}</p>
        <Link className="text-black underline" to="/crear">{es.create.changeFormat}</Link>
      </main>
    );
  }

  const format = FORMATS[formatId];
  const templates = templatesFor(formatId);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <Link className="text-sm text-black underline" to="/crear">{es.create.changeFormat}</Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{format.label}</h1>
      <p className="mt-2 text-black/70">{es.gallery.subtitle}</p>
      {templates.length === 0 ? (
        <p className="mt-8 rounded-lg bg-white p-6 ring-1 ring-black/10">{es.gallery.empty}</p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {templates.map((t) => (
            <li key={t.id}>
              <Link
                to={`/editor/${t.id}`}
                aria-label={es.gallery.use(t.name)}
                className="group block rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                <div className="transition group-hover:-translate-y-0.5">
                  <TemplateThumb template={t} />
                </div>
                <h2 className="mt-3 font-semibold">{t.name}</h2>
                <p className="text-sm text-black/60">{t.tags.join(' · ')}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
