import { create } from 'zustand';
import { FORMATS, type BrandKit, type Design, type FieldValues, type FontPair, type Palette, type SafeZoneView } from '@cartelera/core';
import type { TemplateDef } from '@cartelera/templates';

interface EditorState {
  /** Identidad del diseño que se está editando; null mientras no hay ninguno cargado. */
  designId: string | null;
  templateId: string | null;
  /** Vacío = título automático. */
  title: string;
  values: FieldValues;
  palette: Palette | null;
  fonts: FontPair | null;
  /** id de imagen → objectURL de esta sesión. */
  assets: Record<string, string>;
  /** Hay cambios sin guardar. Un diseño recién abierto no se guarda hasta que se edite algo. */
  dirty: boolean;
  /** Vista de zonas seguras mostrada en la vista previa (null = oculta). Solo ayuda visual. */
  safeView: SafeZoneView | null;
  /** Solo carrusel: número de imágenes y si se muestran las líneas de corte. */
  slides: number;
  slideLimits: { min: number; max: number };
  showCuts: boolean;

  startNew: (t: TemplateDef) => void;
  hydrate: (d: Design, assets: Record<string, string>) => void;
  setTitle: (title: string) => void;
  setValue: (key: string, value: string | boolean | null) => void;
  setColor: (slot: keyof Palette, value: string) => void;
  setFonts: (fonts: FontPair) => void;
  setSlides: (n: number) => void;
  setShowCuts: (v: boolean) => void;
  setSafeView: (v: SafeZoneView | null) => void;
  registerAsset: (id: string, url: string) => void;
  applyBrand: (kit: BrandKit, logoKey: string | null) => void;
  markSaved: () => void;
}

const limitsOf = (formatId: string) => FORMATS[formatId as keyof typeof FORMATS]?.slides ?? { min: 1, max: 1 };

export const useEditor = create<EditorState>((set, get) => ({
  designId: null,
  templateId: null,
  title: '',
  values: {},
  palette: null,
  fonts: null,
  assets: {},
  dirty: false,
  safeView: null,
  slides: 1,
  slideLimits: { min: 1, max: 1 },
  showCuts: true,

  startNew: (t) =>
    set((s) => ({
      designId: crypto.randomUUID(),
      templateId: t.id,
      title: '',
      values: { ...t.defaults },
      palette: { ...t.palette },
      fonts: { ...t.fonts },
      dirty: false,
      slides: FORMATS[t.formats[0]!].slides?.default ?? 1,
      slideLimits: limitsOf(t.formats[0]!),
      assets: s.assets,
    })),

  hydrate: (d, assets) =>
    set((s) => ({
      designId: d.id,
      templateId: d.templateId,
      title: d.title,
      values: { ...d.values },
      palette: { ...d.palette },
      fonts: { ...d.fonts },
      dirty: false,
      slides: d.slides ?? FORMATS[d.formatId].slides?.default ?? 1,
      slideLimits: limitsOf(d.formatId),
      assets: { ...s.assets, ...assets },
    })),

  setTitle: (title) => set({ title, dirty: true }),
  setValue: (key, value) => set((s) => ({ values: { ...s.values, [key]: value }, dirty: true })),
  setColor: (slot, value) => set((s) => (s.palette ? { palette: { ...s.palette, [slot]: value }, dirty: true } : s)),
  setFonts: (fonts) => set({ fonts, dirty: true }),
  setSlides: (n) => {
    const { min, max } = get().slideLimits;
    set({ slides: Math.min(max, Math.max(min, Math.round(n))), dirty: true });
  },
  setShowCuts: (showCuts) => set({ showCuts }),
  setSafeView: (safeView) => set({ safeView }),
  registerAsset: (id, url) => set((s) => ({ assets: { ...s.assets, [id]: url } })),

  /** Aplica el kit de marca: colores, fuentes y logo (si la plantilla tiene un campo `logo`). */
  applyBrand: (kit, logoKey) =>
    set((s) => ({
      palette: kit.palette ?? s.palette,
      fonts: kit.fonts ?? s.fonts,
      values: logoKey && kit.logoAssetId ? { ...s.values, [logoKey]: kit.logoAssetId } : s.values,
      dirty: true,
    })),

  markSaved: () => set({ dirty: false }),
}));
