import type { TemplateDef, TemplateProps } from '../types';
import { AutoFitText } from '../AutoFitText';
import { Logo, assetOf } from '../Logo';

function YtVersiculo({ values, palette, fonts, size, assets }: TemplateProps) {
  const photo = assetOf(values, 'photo', assets);
  const logo = assetOf(values, 'logo', assets);
  const verse = String(values.verse ?? '');
  const reference = String(values.reference ?? '');
  const channel = String(values.channel ?? '');

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
      {photo && (
        <>
          <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: palette.bg, opacity: 0.72 }} />
        </>
      )}
      <Logo src={logo} style={{ position: 'absolute', right: 120, top: 56, height: 76, maxWidth: 240 }} />
      <div style={{ position: 'absolute', left: 120, right: 120, top: 64, bottom: 64, display: 'flex', flexDirection: 'column' }}>
        {channel && (
          <div style={{ height: 40, flex: 'none', color: palette.accent, fontWeight: 700, fontSize: 28, letterSpacing: 6, textTransform: 'uppercase' }}>
            {channel}
          </div>
        )}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', margin: '16px 0' }}>
          <div style={{ width: '100%', height: '100%' }}>
            <AutoFitText
              text={`“${verse}”`}
              min={36}
              max={110}
              style={{ fontFamily: fonts.heading, lineHeight: 1.2, fontWeight: 700, display: 'flex', alignItems: 'center' }}
            />
          </div>
        </div>
        <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 80, height: 6, background: palette.accent }} />
          <div style={{ fontSize: 40, fontWeight: 600, color: palette.muted }}>{reference}</div>
        </div>
      </div>
    </div>
  );
}

export const ytVersiculo: TemplateDef = {
  id: 'yt-versiculo',
  name: 'Versículo',
  formats: ['yt-thumb'],
  tags: ['versiculo', 'devocional', 'elegante'],
  fields: [
    { key: 'channel', type: 'text', label: 'Nombre del canal', maxLength: 28 },
    { key: 'verse', type: 'textarea', label: 'Versículo', maxLength: 160 },
    { key: 'reference', type: 'text', label: 'Cita', maxLength: 32 },
    { key: 'photo', type: 'image', label: 'Foto de fondo (opcional)' },
    { key: 'logo', type: 'image', label: 'Tu logo' },
  ],
  defaults: {
    channel: 'Iglesia Vida Nueva',
    verse: 'Todo lo puedo en Cristo que me fortalece.',
    reference: 'Filipenses 4:13',
    photo: null,
    logo: null,
  },
  palette: { bg: '#f7f1e3', fg: '#2b2118', accent: '#b4532a', muted: '#6b5a48' },
  fonts: { heading: "'Playfair Display', Georgia, serif", body: "'Inter Variable', system-ui, sans-serif" },
  Component: YtVersiculo,
};
