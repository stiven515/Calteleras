import type { TemplateDef, TemplateProps } from '../types';
import { AutoFitText } from '../AutoFitText';

function IgEvento({ values, palette, fonts, size, assets }: TemplateProps) {
  const photo = typeof values.photo === 'string' ? assets[values.photo] : undefined;
  const kicker = String(values.kicker ?? '');
  const title = String(values.title ?? '');
  const date = String(values.date ?? '');
  const time = String(values.time ?? '');
  const place = String(values.place ?? '');

  const pill = {
    background: palette.accent,
    color: palette.bg,
    fontWeight: 800,
    fontSize: 40,
    padding: '12px 32px',
    borderRadius: 999,
  } as const;

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
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: 700,
          background: `linear-gradient(160deg, ${palette.accent} 0%, ${palette.muted} 100%)`,
          opacity: photo ? 1 : 0.35,
        }}
      />
      {photo && (
        <img src={photo} alt="" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 700, objectFit: 'cover' }} />
      )}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 520,
          width: '100%',
          height: 180,
          background: `linear-gradient(to bottom, transparent, ${palette.bg})`,
        }}
      />
      <div style={{ position: 'absolute', left: 72, right: 72, top: 700, bottom: 90, display: 'flex', flexDirection: 'column', gap: 28 }}>
        {kicker && (
          <div style={{ flex: 'none', color: palette.accent, fontSize: 36, fontWeight: 800, letterSpacing: 8, textTransform: 'uppercase' }}>
            {kicker}
          </div>
        )}
        <div style={{ flex: 1, minHeight: 0 }}>
          <AutoFitText
            text={title}
            min={64}
            max={170}
            style={{ fontFamily: fonts.heading, textTransform: 'uppercase', lineHeight: 1, fontWeight: 400 }}
          />
        </div>
        <div style={{ flex: 'none', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {date && <div style={pill}>{date}</div>}
          {time && <div style={{ ...pill, background: 'transparent', color: palette.fg, boxShadow: `inset 0 0 0 4px ${palette.accent}` }}>{time}</div>}
        </div>
        {place && <div style={{ flex: 'none', fontSize: 40, fontWeight: 600, color: palette.muted }}>{place}</div>}
      </div>
    </div>
  );
}

export const igEvento: TemplateDef = {
  id: 'ig-evento',
  name: 'Evento',
  formats: ['ig-post'],
  tags: ['evento', 'invitacion', 'cartel'],
  fields: [
    { key: 'kicker', type: 'text', label: 'Etiqueta superior', maxLength: 24 },
    { key: 'title', type: 'textarea', label: 'Título del evento', maxLength: 50 },
    { key: 'date', type: 'text', label: 'Fecha', maxLength: 24 },
    { key: 'time', type: 'text', label: 'Hora', maxLength: 20 },
    { key: 'place', type: 'text', label: 'Lugar', maxLength: 48 },
    { key: 'photo', type: 'image', label: 'Foto superior' },
  ],
  defaults: {
    kicker: 'Te invitamos',
    title: 'Noche de adoración',
    date: 'Sábado 14 de junio',
    time: '7:00 pm',
    place: 'Templo Central · Calle 10 #5-20',
    photo: null,
  },
  palette: { bg: '#12372a', fg: '#f4efe6', accent: '#e9b44c', muted: '#b9c9bf' },
  fonts: { heading: "'Anton', Impact, sans-serif", body: "'Inter Variable', system-ui, sans-serif" },
  Component: IgEvento,
};
