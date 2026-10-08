import { Link } from 'react-router-dom';
import { es } from '../i18n/es';
import { useDocumentTitle } from './useDocumentTitle';

export function NotFound() {
  useDocumentTitle(es.nav.notFoundTitle);
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight">{es.nav.notFoundTitle}</h1>
      <p className="mt-3 text-neutral-600">{es.nav.notFoundText}</p>
      <Link to="/" className="mt-8 inline-block rounded-full bg-black px-6 py-3 font-semibold text-white hover:bg-neutral-800">
        {es.nav.home}
      </Link>
    </main>
  );
}
