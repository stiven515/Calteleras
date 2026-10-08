import { Link } from 'react-router-dom';
import { FORMATS, MVP_FORMATS } from '@cartelera/core';
import { templatesFor } from '@cartelera/templates';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { es } from '../../i18n/es';

export function FormatPicker() {
  useDocumentTitle(es.create.title);
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{es.create.title}</h1>
      <p className="mt-2 text-black/70">{es.create.subtitle}</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {MVP_FORMATS.map((id) => {
          const f = FORMATS[id];
          const count = templatesFor(id).length;
          return (
            <li key={id}>
              <Link
                to={`/crear/${id}`}
                className="block h-full rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/10 transition hover:ring-black focus:outline-none focus:ring-2 focus:ring-black"
              >
                <div
                  aria-hidden="true"
                  className="mb-4 flex items-center justify-center rounded-md bg-neutral-100"
                  style={{ aspectRatio: '16 / 10' }}
                >
                  <div
                    className="rounded-sm bg-black/80"
                    style={{ aspectRatio: `${f.width} / ${f.height}`, height: '70%', maxWidth: '85%' }}
                  />
                </div>
                <h2 className="font-semibold">{f.label}</h2>
                <p className="text-sm text-black/60">
                  {f.width}×{f.height}
                  {f.slides ? ` · ${es.create.carouselNote}` : ''}
                </p>
                <p className="mt-2 text-sm text-black">
                  {count > 0 ? es.create.templatesCount(count) : es.create.comingSoon}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
