import { useEffect, useState } from 'react';
import { BODY_FONTS, HEADING_FONTS, checkPalette, type Palette } from '@cartelera/core';
import { ytImpacto } from '@cartelera/templates';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { es } from '../../i18n/es';
import { PreviewStage } from '../editor/PreviewStage';
import { saveUploadedImage } from '../storage/assets';
import { useBrandKit } from './useBrandKit';

const select =
  'w-full rounded-md border border-black/15 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-black';
const card = 'rounded-xl bg-white p-5 ring-1 ring-black/10';

export function BrandKitPage() {
  const { kit, logoUrl, loaded, save } = useBrandKit();
  useDocumentTitle(es.nav.brand);

  const [logoId, setLogoId] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | undefined>();
  const [useColors, setUseColors] = useState(false);
  const [palette, setPalette] = useState<Palette>(ytImpacto.palette);
  const [useFonts, setUseFonts] = useState(false);
  const [fonts, setFonts] = useState(ytImpacto.fonts);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [uploadError, setUploadError] = useState(false);

  // Rellena el formulario con lo guardado cuando llega el kit.
  useEffect(() => {
    if (!loaded) return;
    setLogoId(kit?.logoAssetId ?? null);
    setLogoPreview(logoUrl);
    setUseColors(!!kit?.palette);
    setPalette(kit?.palette ?? ytImpacto.palette);
    setUseFonts(!!kit?.fonts);
    setFonts(kit?.fonts ?? ytImpacto.fonts);
  }, [loaded, kit, logoUrl]);

  const issues = useColors ? checkPalette(palette) : [];
  const shown = {
    palette: useColors ? palette : ytImpacto.palette,
    fonts: useFonts ? fonts : ytImpacto.fonts,
  };

  async function onSave() {
    setState('saving');
    try {
      await save({ logoAssetId: logoId, palette: useColors ? palette : null, fonts: useFonts ? fonts : null });
      setState('saved');
    } catch {
      setState('error');
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <p className="text-black/70">{es.brand.intro}</p>

        <section className={card} aria-labelledby="b-logo">
          <h2 id="b-logo" className="text-lg font-semibold">{es.brand.logo}</h2>
          <input
            aria-label={es.brand.logo}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="mt-3 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-black file:px-3 file:py-2 file:text-white"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploadError(false);
              try {
                const { id, url } = await saveUploadedImage(file);
                setLogoId(id);
                setLogoPreview(url);
              } catch {
                setUploadError(true);
              }
            }}
          />
          {uploadError && <p role="alert" className="mt-2 text-sm text-red-700">{es.editor.uploadError}</p>}
          {logoPreview && (
            <div className="mt-3 flex items-center gap-4">
              <img src={logoPreview} alt={es.brand.logoAlt} className="h-16 max-w-[12rem] rounded bg-black/5 object-contain p-1" />
              <button type="button" className="text-sm text-black underline" onClick={() => { setLogoId(null); setLogoPreview(undefined); }}>
                {es.editor.removeImage}
              </button>
            </div>
          )}
        </section>

        <section className={card} aria-labelledby="b-colors">
          <h2 id="b-colors" className="text-lg font-semibold">{es.brand.colors}</h2>
          <label className="mt-2 flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={useColors} onChange={(e) => setUseColors(e.target.checked)} />
            {es.brand.useColors}
          </label>
          {useColors && (
            <>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {(Object.keys(es.editor.colors) as (keyof Palette)[]).map((slot) => (
                  <label key={slot} className="flex items-center gap-2 text-sm">
                    <input
                      type="color"
                      value={palette[slot]}
                      onChange={(e) => setPalette({ ...palette, [slot]: e.target.value })}
                      className="h-9 w-9 cursor-pointer rounded border border-black/15"
                    />
                    {es.editor.colors[slot]}
                  </label>
                ))}
              </div>
              <div role="status" aria-live="polite">
                {issues.length > 0 && (
                  <ul className="mt-3 list-disc rounded-md bg-amber-50 p-3 pl-7 text-sm text-amber-900 ring-1 ring-amber-300">
                    {issues.map((i) => <li key={i.slot}>{es.editor.contrastIssue(i.slot, i.ratio)}</li>)}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>

        <section className={card} aria-labelledby="b-fonts">
          <h2 id="b-fonts" className="text-lg font-semibold">{es.brand.fonts}</h2>
          <label className="mt-2 flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={useFonts} onChange={(e) => setUseFonts(e.target.checked)} />
            {es.brand.useFonts}
          </label>
          {useFonts && (
            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor="b-head" className="mb-1 block text-sm font-medium">{es.brand.headingFont}</label>
                <select id="b-head" className={select} value={fonts.heading} onChange={(e) => setFonts({ ...fonts, heading: e.target.value })}>
                  {HEADING_FONTS.map((f) => <option key={f.id} value={f.stack}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="b-body" className="mb-1 block text-sm font-medium">{es.brand.bodyFont}</label>
                <select id="b-body" className={select} value={fonts.body} onChange={(e) => setFonts({ ...fonts, body: e.target.value })}>
                  {BODY_FONTS.map((f) => <option key={f.id} value={f.stack}>{f.label}</option>)}
                </select>
              </div>
            </div>
          )}
        </section>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={state === 'saving'}
            className="rounded-full bg-black px-5 py-2.5 font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {es.brand.save}
          </button>
          <p role="status" aria-live="polite" className="text-sm">
            {state === 'saved' && es.brand.saved}
            {state === 'error' && <span className="text-red-700">{es.brand.error}</span>}
          </p>
        </div>
      </div>

      <section aria-label={es.brand.previewTitle} className="lg:sticky lg:top-6 lg:self-start">
        <h2 className="mb-2 text-sm font-semibold">{es.brand.previewTitle}</h2>
        <PreviewStage width={1280} height={720}>
          <ytImpacto.Component
            values={{ ...ytImpacto.defaults, logo: logoId ?? null }}
            palette={shown.palette}
            fonts={shown.fonts}
            size={{ w: 1280, h: 720 }}
            assets={logoId && logoPreview ? { [logoId]: logoPreview } : {}}
            mode="preview"
          />
        </PreviewStage>
        <p className="mt-2 text-sm text-black/60">{es.brand.previewHelp}</p>
      </section>
    </div>
  );
}
