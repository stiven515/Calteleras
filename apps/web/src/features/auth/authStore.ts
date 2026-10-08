import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { cloudEnabled, supabase } from '../cloud/client';
import { createRemoteRepos } from '../cloud/remoteRepos';
import { runSync, scheduleSync, setRemote } from '../cloud/session';
import { moveLocalData } from '../cloud/sync';
import { clearAssetUrlCache } from '../storage/assets';
import { GUEST, createLocalRepos, deleteLocalDb, openLocalDb } from '../storage/localRepos';
import { requireRepos, useStorage } from '../storage/storageStore';
import { authErrorMessage, validateCredentials } from './messages';

interface AuthState {
  enabled: boolean;
  /** false hasta saber si hay una sesión guardada (evita parpadeos entre "Entrar" y "Mi cuenta"). */
  ready: boolean;
  user: { id: string; email: string } | null;
  busy: boolean;
  error: string | null;
  notice: string | null;
  init: () => void;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

/** Los cambios de sesión se procesan de uno en uno para que no se crucen los cambios de base local. */
let chain: Promise<void> = Promise.resolve();
let started = false;

async function applyUser(u: User | null): Promise<void> {
  const current = useAuth.getState().user;
  if ((u?.id ?? null) === (current?.id ?? null) && useStorage.getState().repos) return;

  clearAssetUrlCache();
  if (!u || !supabase) {
    setRemote(null);
    await useStorage.getState().switchTo(GUEST);
    useAuth.setState({ user: null, ready: true });
    return;
  }

  await useStorage.getState().switchTo(u.id);
  // Lo que se hizo como invitado pasa a la cuenta, y la base de invitado se vacía.
  const guestDb = await openLocalDb(GUEST);
  try {
    await moveLocalData(createLocalRepos(guestDb), requireRepos());
  } finally {
    guestDb.close();
  }
  await deleteLocalDb(GUEST);

  setRemote(createRemoteRepos(supabase, u.id));
  useAuth.setState({ user: { id: u.id, email: u.email ?? '' }, ready: true });
  void runSync();
}

export const useAuth = create<AuthState>((set) => ({
  enabled: cloudEnabled,
  ready: false,
  user: null,
  busy: false,
  error: null,
  notice: null,

  init() {
    if (started) return;
    started = true;
    if (!supabase) {
      void useStorage.getState().switchTo(GUEST).then(() => set({ ready: true }));
      return;
    }
    const enqueue = (u: User | null) => {
      chain = chain.then(() => applyUser(u)).catch(() => undefined);
    };
    void supabase.auth.getSession().then(({ data }) => enqueue(data.session?.user ?? null));
    supabase.auth.onAuthStateChange((_event, session) => enqueue(session?.user ?? null));
    window.addEventListener('online', () => scheduleSync(500));
  },

  async signUp(email, password) {
    const invalid = validateCredentials(email, password, 'signup');
    if (invalid || !supabase) return set({ error: invalid });
    set({ busy: true, error: null, notice: null });
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) set({ busy: false, error: authErrorMessage(error.message) });
    else set({ busy: false, notice: data.session ? null : 'Te enviamos un correo para confirmar tu cuenta. Ábrelo y vuelve a entrar.' });
  },

  async signIn(email, password) {
    const invalid = validateCredentials(email, password, 'signin');
    if (invalid || !supabase) return set({ error: invalid });
    set({ busy: true, error: null, notice: null });
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    set({ busy: false, error: error ? authErrorMessage(error.message) : null });
  },

  async signInWithGoogle() {
    if (!supabase) return;
    set({ error: null });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/cuenta` },
    });
    if (error) set({ error: authErrorMessage(error.message) });
  },

  async signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  },
}));
