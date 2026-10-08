import { BODY_FONTS, HEADING_FONTS, type FontOption } from '@cartelera/core';
import { es } from '../../i18n/es';
import { useEditor } from '../../stores/editorStore';

const select =
  'w-full rounded-md border border-black/15 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-black';

function FontSelect({ id, label, options, value, onChange }: { id: string; label: string; options: FontOption[]; value: string; onChange: (v: string) => void }) {
  // Si el diseño trae una fuente que no está en la lista (p. ej. de una versión futura), se conserva como opción.
  const known = options.some((o) => o.stack === value);
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      <select id={id} className={select} value={value} onChange={(e) => onChange(e.target.value)}>
        {!known && <option value={value}>{value}</option>}
        {options.map((o) => <option key={o.id} value={o.stack}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function TypographyPanel() {
  const fonts = useEditor((s) => s.fonts);
  const setFonts = useEditor((s) => s.setFonts);
  if (!fonts) return null;
  return (
    <section aria-labelledby="sec-type" className="space-y-3">
      <h2 id="sec-type" className="text-lg font-semibold">{es.brand.typography}</h2>
      <FontSelect id="f-head" label={es.brand.headingFont2} options={HEADING_FONTS} value={fonts.heading} onChange={(heading) => setFonts({ ...fonts, heading })} />
      <FontSelect id="f-body" label={es.brand.bodyFont2} options={BODY_FONTS} value={fonts.body} onChange={(body) => setFonts({ ...fonts, body })} />
    </section>
  );
}
