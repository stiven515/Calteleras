import type { BrandKit, Design } from '@cartelera/core';

/**
 * Contratos de persistencia. La interfaz no sabe si detrás hay IndexedDB o Supabase:
 * así se puede cambiar el backend (p. ej. a Laravel) sin tocar la UI.
 */
export interface DesignRepo {
  list(): Promise<Design[]>;
  get(id: string): Promise<Design | undefined>;
  put(design: Design): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface AssetRepo {
  get(id: string): Promise<Blob | undefined>;
  put(id: string, blob: Blob): Promise<void>;
  has(id: string): Promise<boolean>;
}

export interface BrandRepo {
  get(): Promise<BrandKit | null>;
  put(kit: BrandKit): Promise<void>;
}

export interface Repos {
  designs: DesignRepo;
  assets: AssetRepo;
  brand: BrandRepo;
}

/** Extra solo local: borrados pendientes de propagar a la nube. */
export interface Tombstones {
  list(): Promise<string[]>;
  add(id: string): Promise<void>;
  clear(ids: string[]): Promise<void>;
}

export interface LocalRepos extends Repos {
  assets: AssetRepo & { ids(): Promise<string[]> };
  tombstones: Tombstones;
}
