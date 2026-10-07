import type { TemplateDef, TemplateProps } from '../types';
import { AutoFitText } from '../AutoFitText';

function YtImpacto({ values, palette, fonts, size, assets }: TemplateProps) {
  const photo = typeof values.photo === 'string' ? assets[values.photo] : undefined;
  const title = String(values.title ?? '');
  const subtitle = String(values.subtitle ?? '');
  const badge = String(values.badge ?? '');

  return (
    <div
      style={{
        width: size.w,
        height: size.h,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(120deg, ${palette.bg} 0%, ${palette.bg} 55%, ${palette.accent} 160%)`,
        color: palette.fg,
        fontFamily: fonts.body,
      }}
    >
      {photo && (
        <img
          src={photo}
          alt=""
          style={{ position: 'absolute', right: 0, bottom: 0, height: '100%', width: '48%', objectFit: 'cover' }}
        />
      )}
      <div style={{ position: 'absolute', left: 64, top: 56, width: '56%', bottom: 56, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {badge && (
          <div
            style={{
              alignSelf: 'flex-start',
              background: palette.accent,
              color: palette.bg,
              fontFamily: fonts.heading,
              fontSize: 36,
              padding: '8px 22px',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            {badge}
          </div>
        )}
        <div style={{ flex: 1, minHeight: 0 }}>
          <AutoFitText
            text={title}
            min={48}
            max={200}
            style={{ fontFamily: fonts.heading, textTransform: 'uppercase', lineHeight: 0.98, fontWeight: 400 }}
          />
        </div>
        {subtitle && (
          <div style={{ height: 96, flex: 'none' }}>
            <AutoFitText text={subtitle} min={24} max={44} style={{ color: palette.muted, fontWeight: 600, lineHeight: 1.15 }} />
          </div>
        )}
      </div>
    </div>
  );
}

export const ytImpacto: TemplateDef = {
  id: 'yt-impacto',
  name: 'Impacto',
  formats: ['yt-thumb'],
  tags: ['predica', 'titulo-grande'],
  fields: [
    { key: 'badge', type: 'text', label: 'Etiqueta', maxLength: 18 },
    { key: 'title', type: 'textarea', label: 'Título', maxLength: 60 },
    { key: 'subtitle', type: 'text', label: 'Subtítulo', maxLength: 70 },
    { key: 'photo', type: 'image', label: 'Foto' },
  ],
  defaults: { badge: 'Nueva serie', title: 'Fe que mueve montañas', subtitle: 'Pastor Juan Pérez · Domingo 10:00 am', photo: null },
  palette: { bg: '#0f1b3d', fg: '#ffffff', accent: '#ffc233', muted: '#c7d2f0' },
  fonts: { heading: "'Anton', Impact, sans-serif", body: "'Inter Variable', system-ui, sans-serif" },
  Component: YtImpacto,
};
