import type { TemplateDef, TemplateProps } from '../types';
import { AutoFitText } from '../AutoFitText';
import { Logo, assetOf } from '../Logo';

function IgCita({ values, palette, fonts, size, assets }: TemplateProps) {
  const photo = assetOf(values, 'photo', assets);
  const logo = assetOf(values, 'logo', assets);
  const kicker = String(values.kicker ?? '');
  const quote = String(values.quote ?? '');
  const author = String(values.author ?? '');
  const role = String(values.role ?? '');

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
      <div
        aria-hidden="true"
        style={{ position: 'absolute', left: 56, top: 40, fontFamily: fonts.heading, fontSize: 520, lineHeight: 1, color: palette.accent, opacity: 0.9 }}
      >
        “
      </div>
      {kicker && (
        <div style={{ position: 'absolute', right: 80, top: 120, color: palette.muted, fontSize: 32, fontWeight: 700, letterSpacing: 6, textTransform: 'uppercase' }}>
          {kicker}
        </div>
      )}
      <div style={{ position: 'absolute', left: 88, right: 88, top: 330, height: 640 }}>
        <AutoFitText
          text={quote}
          min={48}
          max={110}
          style={{ fontFamily: fonts.heading, lineHeight: 1.18, fontWeight: 700, display: 'flex', alignItems: 'center' }}
        />
      </div>
      <div style={{ position: 'absolute', left: 88, right: 88, top: 1020, display: 'flex', alignItems: 'center', gap: 28 }}>
        {photo && (
          <img src={photo} alt="" style={{ width: 128, height: 128, borderRadius: '50%', objectFit: 'cover', flex: 'none', border: `6px solid ${palette.accent}` }} />
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 46, fontWeight: 800 }}>{author}</div>
          {role && <div style={{ fontSize: 34, color: palette.muted, fontWeight: 500 }}>{role}</div>}
        </div>
      </div>
      <Logo src={logo} style={{ position: 'absolute', right: 88, bottom: 100, height: 90, maxWidth: 260 }} />
    </div>
  );
}

export const igCita: TemplateDef = {
  id: 'ig-cita',
  name: 'Cita',
  formats: ['ig-post'],
  tags: ['frase', 'cita', 'inspiracion'],
  fields: [
    { key: 'kicker', type: 'text', label: 'Etiqueta superior', maxLength: 24 },
    { key: 'quote', type: 'textarea', label: 'Frase', maxLength: 180 },
    { key: 'author', type: 'text', label: 'Autor', maxLength: 40 },
    { key: 'role', type: 'text', label: 'Cargo o lugar (opcional)', maxLength: 48 },
    { key: 'photo', type: 'image', label: 'Foto del autor (opcional)' },
    { key: 'logo', type: 'image', label: 'Tu logo' },
  ],
  defaults: {
    kicker: 'Frase de la semana',
    quote: 'La fe no es ver el camino completo, es dar el primer paso confiando.',
    author: 'Pastora María Gómez',
    role: 'Iglesia Vida Nueva',
    photo: null,
    logo: null,
  },
  palette: { bg: '#f2e8d5', fg: '#1d1b16', accent: '#c2410c', muted: '#6d6455' },
  fonts: { heading: "'Playfair Display', Georgia, serif", body: "'Inter Variable', system-ui, sans-serif" },
  Component: IgCita,
};
