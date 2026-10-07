import { zonesForView, type FormatSpec, type SafeZone, type SafeZoneView } from '@cartelera/core';

const pct = (n: number) => `${n * 100}%`;

function Zone({ zone }: { zone: SafeZone }) {
  const { x, y, w, h } = zone.rect;
  const box = { left: pct(x), top: pct(y), width: pct(w), height: pct(h) };
  if (zone.kind === 'keep-inside') {
    return (
      <div className="absolute outline-dashed outline-2 outline-white" style={{ ...box, boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)' }}>
        <span className="absolute left-1 top-1 rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold text-black">
          {zone.label}
        </span>
      </div>
    );
  }
  return (
    <div
      className="absolute border-2 border-red-500"
      style={{
        ...box,
        background: 'repeating-linear-gradient(45deg, rgba(239,68,68,0.55) 0 6px, rgba(239,68,68,0.15) 6px 12px)',
      }}
    >
      <span
        className={`absolute whitespace-nowrap rounded bg-red-600 px-1.5 py-0.5 text-[11px] font-semibold text-white ${
          x > 0.5 ? 'right-0' : 'left-0'
        } ${y > 0.5 ? 'bottom-full' : 'top-full'}`}
      >
        {zone.label}
      </span>
    </div>
  );
}

/** Capa visual de ayuda: solo existe en la vista previa, nunca en la exportación. */
export function SafeZoneOverlay({ format, view }: { format: FormatSpec; view: SafeZoneView }) {
  const zones = zonesForView(format, view);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {zones.map((z) => (
        <Zone key={z.id} zone={z} />
      ))}
    </div>
  );
}
