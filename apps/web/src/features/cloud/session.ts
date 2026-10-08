import { create } from 'zustand';
import type { Repos } from '../storage/repos';
import { useStorage } from '../storage/storageStore';
import { syncBrand, syncDesigns } from './sync';

interface CloudState {
  /** off = sin sesión o sin nube configurada. */
  status: 'off' | 'idle' | 'syncing' | 'error';
  lastSyncAt: number | null;
  errors: string[];
}

export const useCloud = create<CloudState>(() => ({ status: 'off', lastSyncAt: null, errors: [] }));

let remote: Repos | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let inflight: Promise<void> | null = null;
let rerun = false;

export function setRemote(r: Repos | null): void {
  remote = r;
  useStorage.getState().setRemoteAssets(r ? r.assets : null);
  useCloud.setState({ status: r ? 'idle' : 'off', errors: [] });
}

async function once(): Promise<void> {
  const repos = useStorage.getState().repos;
  if (!remote || !repos) return;
  useCloud.setState({ status: 'syncing' });
  try {
    const r = await syncDesigns(repos, remote);
    await syncBrand(repos, remote);
    useCloud.setState({ status: r.errors.length ? 'error' : 'idle', lastSyncAt: Date.now(), errors: r.errors });
  } catch (e) {
    useCloud.setState({ status: 'error', errors: [e instanceof Error ? e.message : String(e)] });
  }
}

/**
 * Sincroniza y resuelve cuando termina. Si ya hay una en curso, pide una repetición (algo cambió
 * mientras tanto) y espera a que acabe todo: quien llama puede confiar en que la nube quedó al día.
 */
export function runSync(): Promise<void> {
  if (!remote || !useStorage.getState().repos) return Promise.resolve();
  if (inflight) {
    rerun = true;
    return inflight;
  }
  inflight = (async () => {
    do {
      rerun = false;
      await once();
    } while (rerun);
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

/** Agrupa cambios seguidos en una sola sincronización. Sin sesión no hace nada. */
export function scheduleSync(ms = 3000): void {
  if (!remote) return;
  clearTimeout(timer);
  timer = setTimeout(() => void runSync(), ms);
}
