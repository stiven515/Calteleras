import type { BrandKit, Design } from '@cartelera/core';
import type { LocalRepos } from './repos';

export type MemoryRepos = LocalRepos & {
  _designs: Map<string, Design>;
  _assets: Map<string, Blob>;
  _tombs: Set<string>;
  _kit: { v: BrandKit | null };
};

/**
 * Repositorios en memoria. Sirven de respaldo cuando el navegador no permite IndexedDB
 * (algunos modos privados, políticas de empresa) y para las pruebas: la app sigue funcionando,
 * pero nada sobrevive a recargar la página. `failPutFor` simula un fallo al guardar un diseño concreto.
 */
export function memoryRepos(opts: { failPutFor?: string[] } = {}): MemoryRepos {
  const designs = new Map<string, Design>();
  const assets = new Map<string, Blob>();
  const tombs = new Set<string>();
  const kit: { v: BrandKit | null } = { v: null };
  return {
    _designs: designs,
    _assets: assets,
    _tombs: tombs,
    _kit: kit,
    designs: {
      list: async () => [...designs.values()].sort((a, b) => b.updatedAt - a.updatedAt),
      get: async (id) => designs.get(id),
      put: async (d) => {
        if (opts.failPutFor?.includes(d.id)) throw new Error('fallo simulado');
        designs.set(d.id, d);
      },
      remove: async (id) => void designs.delete(id),
    },
    assets: {
      get: async (id) => assets.get(id),
      put: async (id, b) => void assets.set(id, b),
      has: async (id) => assets.has(id),
      ids: async () => [...assets.keys()],
    },
    brand: {
      get: async () => kit.v,
      put: async (k) => void (kit.v = k),
    },
    tombstones: {
      list: async () => [...tombs],
      add: async (id) => void tombs.add(id),
      clear: async (ids) => void ids.forEach((i) => tombs.delete(i)),
    },
  };
}
