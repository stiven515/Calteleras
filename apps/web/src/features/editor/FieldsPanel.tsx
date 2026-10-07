import { useId } from 'react';
import type { FieldDef, Palette } from '@cartelera/core';
import type { TemplateDef } from '@cartelera/templates';
import { es } from '../../i18n/es';
import { useEditor } from '../../stores/editorStore';

const input =
  'w-full rounded-md border border-black/15 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-600';
const label = 'mb-1 block text-sm font-medium';

function Field({ def }: { def: FieldDef }) {
  const id = useId();
  const value = useEditor((s) => s.values[def.key]);
  const setValue = useEditor((s) => s.setValue);
  const addAsset = useEditor((s) => s.addAsset);

  switch (def.type) {
    case 'text':
      return (
        <div>
          <label htmlFor={id} className={label}>{def.label}</label>
          <input id={id} className={input} maxLength={def.maxLength} value={String(value ?? '')} onChange={(e) => setValue(def.key, e.target.value)} />
        </div>
      );
    case 'textarea':
      return (
        <div>
          <label htmlFor={id} className={label}>{def.label}</label>
          <textarea id={id} rows={3} className={input} maxLength={def.maxLength} value={String(value ?? '')} onChange={(e) => setValue(def.key, e.target.value)} />
        </div>
      );
    case 'select':
      return (
        <div>
          <label htmlFor={id} className={label}>{def.label}</label>
          <select id={id} className={input} value={String(value ?? '')} onChange={(e) => setValue(def.key, e.target.value)}>
            {def.options.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      );
    case 'toggle':
      return (
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={value === true} onChange={(e) => setValue(def.key, e.target.checked)} />
          {def.label}
        </label>
      );
    case 'image':
      return (
        <div>
          <label htmlFor={id} className={label}>{def.label}</label>
          <input
            id={id}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-white"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setValue(def.key, addAsset(file));
            }}
          />
          {value ? (
            <button type="button" className="mt-2 text-sm text-indigo-700 underline" onClick={() => setValue(def.key, null)}>
              {es.editor.removeImage}
            </button>
          ) : null}
        </div>
      );
  }
}

export function FieldsPanel({ template }: { template: TemplateDef }) {
  const palette = useEditor((s) => s.palette);
  const setColor = useEditor((s) => s.setColor);

  return (
    <div className="space-y-6">
      <section aria-labelledby="sec-content" className="space-y-4">
        <h2 id="sec-content" className="text-lg font-semibold">{es.editor.fields}</h2>
        {template.fields.map((f) => <Field key={f.key} def={f} />)}
      </section>
      {palette && (
        <section aria-labelledby="sec-colors" className="space-y-3">
          <h2 id="sec-colors" className="text-lg font-semibold">{es.editor.palette}</h2>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(es.editor.colors) as (keyof Palette)[]).map((slot) => (
              <label key={slot} className="flex items-center gap-2 text-sm">
                <input type="color" value={palette[slot]} onChange={(e) => setColor(slot, e.target.value)} className="h-9 w-9 cursor-pointer rounded border border-black/15" />
                {es.editor.colors[slot]}
              </label>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
