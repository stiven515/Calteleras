import { create } from 'zustand';
import { GUEST, createLocalRepos, openLocalDb, type Principal } from './localRepos';
import { memoryRepos } from './memoryRepos';
import type { AssetRepo, LocalRepos } from './repos';

interface StorageState {
  principal: Principal;
  repos: LocalRepos | null;
  /** false si el navegador no permitió IndexedDB y se usa memoria: todo se pierde al recargar. */
  persistent: boolean;
  /** Respaldo en la nube para imágenes que aún no están en este dispositivo (solo con sesión). */
  remoteAssets: AssetRepo | null;
  switchTo: (principal: Principal) => Promise<void>;
  setRemoteAssets: (r: AssetRepo | null) => void;
}

let current: Awaited<ReturnType<typeof openLocalDb>> | null = null;

export const useStorage = create<StorageState>((set, get) => ({
  principal: GUEST,
  repos: null,
  persistent: true,
  remoteAssets: null,
  async switchTo(principal) {
    if (get().repos && get().principal === principal) return;
    try {
      const db = await openLocalDb(principal);
      current?.close();
      current = db;
      set({ principal, repos: createLocalRepos(db), persistent: true, remoteAssets: null });
    } catch {
      // Sin IndexedDB (modo privado restrictivo, política del navegador…): la app sigue funcionando en memoria.
      current?.close();
      current = null;
      set({ principal, repos: memoryRepos(), persistent: false, remoteAssets: null });
    }
  },
  setRemoteAssets: (remoteAssets) => set({ remoteAssets }),
}));

export function requireRepos(): LocalRepos {
  const r = useStorage.getState().repos;
  if (!r) throw new Error('El almacenamiento aún no está listo');
  return r;
}
