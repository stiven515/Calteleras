import { useEffect } from 'react';
import { useStorage } from '../storage/storageStore';
import { useBrand } from './brandStore';

/** Carga el kit de marca de la persona actual y lo recarga si cambia de cuenta o termina una sincronización. */
export function useBrandKit() {
  const repos = useStorage((s) => s.repos);
  const state = useBrand();
  useEffect(() => {
    if (!repos) return;
    useBrand.getState().reset();
    void useBrand.getState().load();
  }, [repos]);
  return state;
}
