import { create } from 'zustand';
import type { FieldValues, Palette } from '@cartelera/core';
import type { TemplateDef } from '@cartelera/templates';

interface EditorState {
  templateId: string | null;
  values: FieldValues;
  palette: Palette | null;
  /** assetId → objectURL (en sesión; la persistencia llega con IndexedDB). */
  assets: Record<string, string>;
  load: (t: TemplateDef) => void;
  setValue: (key: string, value: string | boolean | null) => void;
  setColor: (slot: keyof Palette, value: string) => void;
  addAsset: (file: Blob) => string;
}

export const useEditor = create<EditorState>((set, get) => ({
  templateId: null,
  values: {},
  palette: null,
  assets: {},
  load: (t) => {
    if (get().templateId === t.id) return;
    set({ templateId: t.id, values: { ...t.defaults }, palette: { ...t.palette } });
  },
  setValue: (key, value) => set((s) => ({ values: { ...s.values, [key]: value } })),
  setColor: (slot, value) => set((s) => (s.palette ? { palette: { ...s.palette, [slot]: value } } : s)),
  addAsset: (file) => {
    const id = crypto.randomUUID();
    const url = URL.createObjectURL(file);
    set((s) => ({ assets: { ...s.assets, [id]: url } }));
    return id;
  },
}));
