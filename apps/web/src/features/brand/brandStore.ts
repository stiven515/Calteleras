import { create } from 'zustand';
import type { BrandKit, FontPair, Palette } from '@cartelera/core';
import { scheduleSync } from '../cloud/session';
import { resolveAssetUrl } from '../storage/assets';
import { requireRepos } from '../storage/storageStore';

interface BrandState {
  kit: BrandKit | null;
  logoUrl: string | undefined;
  loaded: boolean;
  load: () => Promise<void>;
  save: (next: { logoAssetId: string | null; palette: Palette | null; fonts: FontPair | null }) => Promise<void>;
  reset: () => void;
}

export const useBrand = create<BrandState>((set) => ({
  kit: null,
  logoUrl: undefined,
  loaded: false,

  async load() {
    const kit = await requireRepos().brand.get();
    const logoUrl = kit?.logoAssetId ? await resolveAssetUrl(kit.logoAssetId) : undefined;
    set({ kit, logoUrl, loaded: true });
  },

  async save(next) {
    const kit: BrandKit = { v: 1, ...next, updatedAt: Date.now() };
    await requireRepos().brand.put(kit);
    const logoUrl = kit.logoAssetId ? await resolveAssetUrl(kit.logoAssetId) : undefined;
    set({ kit, logoUrl, loaded: true });
    scheduleSync();
  },

  /** Al cambiar de usuario hay que olvidar el kit del anterior. */
  reset: () => set({ kit: null, logoUrl: undefined, loaded: false }),
}));

export function hasBrandContent(kit: BrandKit | null): kit is BrandKit {
  return !!kit && (kit.logoAssetId !== null || kit.palette !== null || kit.fonts !== null);
}
