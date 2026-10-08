import { create } from 'zustand';
import { GUEST, createLocalRepos, openLocalDb, type Principal } from './localRepos';
import type { AssetRepo, LocalRepos } from './repos';

interface StorageState {
  principal: Principal;
  repos: LocalRepos | null;
  /** Respaldo en la nube para imágenes que aún no están en este dispositivo (solo con sesión). */
  remoteAssets: AssetRepo | null;
  switchTo: (principal: Principal) => Promise<void>;
  setRemoteAssets: (r: AssetRepo | null) => void;
}

let current: Awaited<ReturnType<typeof openLocalDb>> | null = null;

export const useStorage = create<StorageState>((set, get) => ({
  principal: GUEST,
  repos: null,
  remoteAssets: null,
  async switchTo(principal) {
    if (get().repos && get().principal === principal) return;
    const db = await openLocalDb(principal);
    current?.close();
    current = db;
    set({ principal, repos: createLocalRepos(db), remoteAssets: null });
  },
  setRemoteAssets: (remoteAssets) => set({ remoteAssets }),
}));

export function requireRepos(): LocalRepos {
  const r = useStorage.getState().repos;
  if (!r) throw new Error('El almacenamiento aún no está listo');
  return r;
}
