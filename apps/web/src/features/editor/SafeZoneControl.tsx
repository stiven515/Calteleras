import { availableViews, type FormatSpec, type SafeZoneView } from '@cartelera/core';
import { es } from '../../i18n/es';
import { useEditor } from '../../stores/editorStore';

export function SafeZoneControl({ format }: { format: FormatSpec }) {
  const views = availableViews(format);
  const safeView = useEditor((s) => s.safeView);
  const setSafeView = useEditor((s) => s.setSafeView);
  if (views.length === 0) return null;

  const active = safeView && views.includes(safeView) ? safeView : null;
  const options: { value: SafeZoneView | null; label: string }[] = [
    { value: null, label: es.safeZones.hide },
    ...views.map((v) => ({ value: v, label: es.safeZones.views[v] })),
  ];

  return (
    <div className="mt-4">
      <p id="sz-label" className="mb-2 text-sm font-medium">{es.safeZones.title}</p>
      <div role="radiogroup" aria-labelledby="sz-label" className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.label}
            type="button"
            role="radio"
            aria-checked={active === o.value}
            onClick={() => setSafeView(o.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ring-1 ring-black/15 ${active === o.value ? 'bg-black text-white' : 'bg-white'}`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {active && <p className="mt-2 text-sm text-black/70">{es.safeZones.help}</p>}
    </div>
  );
}
