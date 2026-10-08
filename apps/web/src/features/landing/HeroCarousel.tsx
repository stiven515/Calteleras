import { useMemo, useState } from 'react';
import { FORMATS } from '@cartelera/core';
import { getTemplate, type TemplateDef } from '@cartelera/templates';
import { es } from '../../i18n/es';
import { PreviewStage } from '../editor/PreviewStage';
import { SliceFrame } from '../editor/SliceFrame';
import { DragCarousel, type CarouselCard } from './DragCarousel';

const GAP = 18;
const SLICES = 4;

/** Alto de tarjeta según el ancho de pantalla (más bajo en celular para que se vean varias a la vez). */
export function cardHeightFor(viewportWidth: number): number {
  return viewportWidth < 640 ? 230 : 320;
}

function whole(t: TemplateDef, h: number): CarouselCard {
  const f = FORMATS[t.formats[0]!];
  return {
    key: t.id,
    width: Math.round((h * f.width) / f.height),
    gapBefore: GAP,
    node: (
      <PreviewStage width={f.width} height={f.height}>
        <t.Component values={t.defaults} palette={t.palette} fonts={t.fonts} size={{ w: f.width, h: f.height }} assets={{}} mode="preview" />
      </PreviewStage>
    ),
  };
}

/** Las 4 imágenes del carrusel panorámico, pegadas: al girar se ve que forman una sola pieza. */
function panorama(t: TemplateDef, h: number): CarouselCard[] {
  const f = FORMATS['ig-carousel'];
  return Array.from({ length: SLICES }, (_, i) => ({
    key: `${t.id}-${i}`,
    width: Math.round((h * f.width) / f.height),
    gapBefore: i === 0 ? GAP : 0,
    node: (
      <PreviewStage width={f.width} height={f.height} bare>
        <SliceFrame width={f.width} height={f.height} offsetX={-i * f.width}>
          <t.Component
            values={t.defaults}
            palette={t.palette}
            fonts={t.fonts}
            size={{ w: f.width * SLICES, h: f.height }}
            slides={SLICES}
            slideWidth={f.width}
            assets={{}}
            mode="preview"
          />
        </SliceFrame>
      </PreviewStage>
    ),
  }));
}

export function HeroCarousel() {
  const [h] = useState(() => cardHeightFor(window.innerWidth));
  const cards = useMemo(() => {
    const impacto = getTemplate('yt-impacto');
    const cita = getTemplate('ig-cita');
    const ruta = getTemplate('ig-ruta');
    const versiculo = getTemplate('yt-versiculo');
    const evento = getTemplate('ig-evento');
    return [
      impacto && whole(impacto, h),
      cita && whole(cita, h),
      ...(ruta ? panorama(ruta, h) : []),
      versiculo && whole(versiculo, h),
      evento && whole(evento, h),
    ].filter((c): c is CarouselCard => !!c);
  }, [h]);

  // Arranca entre la 2.ª y la 3.ª imagen del panorama, para que se vea la continuidad desde el primer instante.
  return <DragCarousel cards={cards} cardHeight={h} startAt={3.5} label={es.landing.carouselLabel} />;
}
