import type { TemplateDef, TemplateProps } from '../types';
import { AutoFitText } from '../AutoFitText';
import { slideContents, splitLines } from '../lines';

/** Línea ondulada continua: cruza todos los cortes y tiene un punto en el centro de cada slide. */
function wavePath(total: number, step: number, y: number, amp: number): string {
  let d = `M 0 ${y} Q ${step / 2} ${y - amp} ${step} ${y}`;
  for (let x = step * 2; x <= total; x += step) d += ` T ${x} ${y}`;
  return d;
}

function IgRuta({ values, palette, fonts, size, assets, slides = 1, slideWidth }: TemplateProps) {
  const sw = slideWidth ?? size.w;
  const photo = typeof values.photo === 'string' ? assets[values.photo] : undefined;
  const title = String(values.title ?? '');
  const subtitle = String(values.subtitle ?? '');
  const items = slideContents(splitLines(values.points), String(values.cta ?? ''), slides);
  const waveY = 1170;

  return (
    <div
      style={{
        width: size.w,
        height: size.h,
        position: 'relative',
        overflow: 'hidden',
        background: palette.bg,
        color: palette.fg,
        fontFamily: fonts.body,
      }}
    >
      {/* Elementos que cruzan el primer corte */}
      <div style={{ position: 'absolute', left: sw - 250, top: -70, width: 500, height: 500, borderRadius: '50%', background: palette.accent }} />
      <div style={{ position: 'absolute', left: sw + 60, top: 250, width: 220, height: 220, borderRadius: '50%', background: palette.muted, opacity: 0.55 }} />
      {photo && (
        <img
          src={photo}
          alt=""
          style={{ position: 'absolute', left: sw - 190, top: -10, width: 380, height: 380, borderRadius: '50%', objectFit: 'cover', border: `10px solid ${palette.bg}` }}
        />
      )}

      <svg width={size.w} height={size.h} style={{ position: 'absolute', left: 0, top: 0 }} aria-hidden="true">
        <path d={wavePath(size.w, sw / 2, waveY, 120)} fill="none" stroke={palette.accent} strokeWidth={10} strokeLinecap="round" />
        {Array.from({ length: slides }, (_, i) => (
          <circle key={i} cx={(i + 0.5) * sw} cy={waveY} r={26} fill={palette.bg} stroke={palette.accent} strokeWidth={10} />
        ))}
      </svg>

      {/* Slide 1: portada */}
      <div style={{ position: 'absolute', left: 72, top: 470, width: sw - 144, height: 440 }}>
        <AutoFitText text={title} min={80} max={200} style={{ fontFamily: fonts.heading, textTransform: 'uppercase', lineHeight: 1, fontWeight: 400 }} />
      </div>
      {subtitle && (
        <div style={{ position: 'absolute', left: 72, top: 930, width: sw - 144, height: 110 }}>
          <AutoFitText text={subtitle} min={28} max={48} style={{ color: palette.muted, fontWeight: 600, lineHeight: 1.2 }} />
        </div>
      )}

      {/* Slides 2..N */}
      {items.map((item, i) => {
        const left = (i + 1) * sw + 72;
        return (
          <div key={i}>
            {item.kind === 'point' && (
              <div style={{ position: 'absolute', left, top: 470, fontFamily: fonts.heading, fontSize: 190, lineHeight: 1, color: palette.accent }}>
                {String(i + 1).padStart(2, '0')}
              </div>
            )}
            <div style={{ position: 'absolute', left, top: item.kind === 'cta' ? 470 : 690, width: sw - 144, height: item.kind === 'cta' ? 560 : 360 }}>
              <AutoFitText
                text={item.text}
                min={44}
                max={item.kind === 'cta' ? 150 : 100}
                style={{
                  fontFamily: item.kind === 'cta' ? fonts.heading : fonts.body,
                  textTransform: item.kind === 'cta' ? 'uppercase' : 'none',
                  fontWeight: item.kind === 'cta' ? 400 : 700,
                  lineHeight: 1.1,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const igRuta: TemplateDef = {
  id: 'ig-ruta',
  name: 'Ruta',
  formats: ['ig-carousel'],
  tags: ['pasos', 'devocional', 'panoramico'],
  fields: [
    { key: 'title', type: 'textarea', label: 'Título de la portada', maxLength: 40 },
    { key: 'subtitle', type: 'text', label: 'Subtítulo', maxLength: 60 },
    { key: 'points', type: 'textarea', label: 'Un punto por línea (uno por slide)', maxLength: 400 },
    { key: 'cta', type: 'text', label: 'Mensaje final', maxLength: 40 },
    { key: 'photo', type: 'image', label: 'Foto en el círculo (opcional)' },
  ],
  defaults: {
    title: '3 hábitos para crecer en la fe',
    subtitle: 'Desliza para verlos →',
    points: 'Ora cada mañana antes de tu celular\nLee un capítulo de la Biblia\nServe a alguien esta semana',
    cta: 'Guárdalo y compártelo',
    photo: null,
  },
  palette: { bg: '#10243a', fg: '#ffffff', accent: '#ff7a59', muted: '#a9c1dd' },
  fonts: { heading: "'Anton', Impact, sans-serif", body: "'Inter Variable', system-ui, sans-serif" },
  Component: IgRuta,
};
