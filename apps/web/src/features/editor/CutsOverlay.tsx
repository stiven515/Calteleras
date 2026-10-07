/** Líneas de corte y número de cada imagen sobre el panorama. Solo ayuda visual: no se exporta. */
export function CutsOverlay({ slides }: { slides: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {Array.from({ length: slides }, (_, i) => (
        <span
          key={i}
          className="absolute top-1 -translate-x-1/2 rounded bg-black/70 px-2 py-0.5 text-xs font-semibold text-white"
          style={{ left: `${((i + 0.5) / slides) * 100}%` }}
        >
          {i + 1}
        </span>
      ))}
      {Array.from({ length: slides - 1 }, (_, i) => (
        <div
          key={i}
          className="absolute inset-y-0 border-l-2 border-dashed border-white/90 mix-blend-difference"
          style={{ left: `${((i + 1) / slides) * 100}%` }}
        />
      ))}
    </div>
  );
}
