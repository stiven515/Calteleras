import { Link } from 'react-router-dom';
import { FORMATS, MVP_FORMATS } from '@cartelera/core';
import { cloudEnabled } from '../features/cloud/client';
import { HeroCarousel } from '../features/landing/HeroCarousel';
import { es } from '../i18n/es';
import { useDocumentTitle } from './useDocumentTitle';

const textLink =
  'font-semibold underline decoration-2 underline-offset-[6px] hover:decoration-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2';

export function Home() {
  useDocumentTitle();
  const features = cloudEnabled ? es.home.features : es.home.features.slice(0, 5);

  return (
    <main>
      <section className="px-4 pb-4 pt-10 text-center md:pt-14">
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl md:text-6xl">
          {es.home.titleA} {es.home.titleB}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-neutral-600">{es.home.eyebrow}</p>
      </section>

      <HeroCarousel />

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 pt-10 md:grid-cols-[minmax(0,34rem)_auto] md:items-end md:justify-between md:px-8">
        <p className="text-neutral-700">{es.home.heroText}</p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <Link to="/crear" className={textLink}>{es.landing.ctaLink}</Link>
          <a href="#como" className={textLink}>{es.landing.howLink}</a>
        </div>
      </section>

      <section id="como" className="border-t border-black/10">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">{es.home.stepsTitle}</h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {es.home.steps.map((s, i) => (
              <li key={s.title} className="border-t border-black pt-5">
                <span className="text-sm font-semibold text-neutral-500" aria-hidden="true">0{i + 1}</span>
                <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-neutral-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-black/10">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">{es.home.featuresTitle}</h2>
          <ul className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <li key={f.title} className="border-t border-black pt-5">
                <h3 className="text-xl font-bold">{f.title}</h3>
                <p className="mt-2 text-neutral-600">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-black/10">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight">{es.home.formatsTitle}</h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {MVP_FORMATS.map((id) => {
              const f = FORMATS[id];
              return (
                <li key={id} className="rounded-full px-4 py-2 text-sm font-medium ring-1 ring-black/25">
                  {f.label} · {f.width}×{f.height}
                  {f.slides ? ' × N' : ''}
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-sm text-neutral-600">{es.home.formatsSoon}</p>
        </div>
      </section>

      <section className="bg-black text-white">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">{es.home.finalTitle}</h2>
          <p className="mt-4 text-lg text-neutral-300">{es.home.finalText}</p>
          <Link
            to="/crear"
            className="mt-8 inline-block rounded-full bg-white px-7 py-3 font-semibold text-black hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            {es.home.cta}
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-neutral-600">{es.home.footer}</footer>
    </main>
  );
}
