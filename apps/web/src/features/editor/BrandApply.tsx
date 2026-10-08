import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { TemplateDef } from '@cartelera/templates';
import { es } from '../../i18n/es';
import { useEditor } from '../../stores/editorStore';
import { hasBrandContent } from '../brand/brandStore';
import { useBrandKit } from '../brand/useBrandKit';
import { resolveAssetUrl } from '../storage/assets';

/** Un clic para llevar colores, fuentes y logo de la marca de la persona a este diseño. */
export function BrandApply({ template }: { template: TemplateDef }) {
  const { kit, loaded } = useBrandKit();
  const applyBrand = useEditor((s) => s.applyBrand);
  const registerAsset = useEditor((s) => s.registerAsset);
  const [done, setDone] = useState(false);

  if (!loaded) return null;

  if (!hasBrandContent(kit)) {
    return (
      <p className="rounded-md bg-neutral-100 p-3 text-sm ring-1 ring-neutral-300">
        <Link to="/cuenta/marca" className="font-semibold text-black underline">{es.brand.create}</Link>
        {' — '}{es.brand.applyHelp}
      </p>
    );
  }

  const logoKey = template.fields.find((f) => f.type === 'image' && f.key === 'logo')?.key ?? null;

  async function apply() {
    if (!hasBrandContent(kit)) return;
    if (kit.logoAssetId) {
      const url = await resolveAssetUrl(kit.logoAssetId);
      if (url) registerAsset(kit.logoAssetId, url);
    }
    applyBrand(kit, logoKey);
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void apply()}
        className="w-full rounded-lg bg-neutral-100 px-4 py-2.5 font-semibold text-black ring-1 ring-neutral-300 hover:bg-neutral-200"
      >
        {es.brand.apply}
      </button>
      <p role="status" aria-live="polite" className="mt-1 text-xs text-black/60">
        {done ? es.brand.applied : es.brand.applyHelp}
      </p>
    </div>
  );
}
