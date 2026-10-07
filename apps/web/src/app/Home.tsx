import { Link } from 'react-router-dom';
import { es } from '../i18n/es';

export function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{es.home.title}</h1>
      <p className="mt-6 text-lg text-black/70">{es.home.subtitle}</p>
      <Link
        to="/crear"
        className="mt-10 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
      >
        {es.home.cta}
      </Link>
    </main>
  );
}
