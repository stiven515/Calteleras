import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { migrateBrandKit, migrateDesign, type BrandKit, type Design } from '@cartelera/core';
import type { LocalRepos } from './repos';

interface Schema extends DBSchema {
  designs: { key: string; value: Design };
  assets: { key: string; value: { id: string; buf?: ArrayBuffer; type?: string; blob?: Blob } };
  brand: { key: string; value: BrandKit };
  tombstones: { key: string; value: { id: string; at: number } };
}

/** 'guest' para quien no ha iniciado sesión; el id de usuario en otro caso. Cada uno tiene su propia base. */
export type Principal = string;

export const GUEST: Principal = 'guest';
const dbName = (p: Principal) => `cartelera:${p}`;

export async function openLocalDb(principal: Principal): Promise<IDBPDatabase<Schema>> {
  return openDB<Schema>(dbName(principal), 1, {
    upgrade(db) {
      db.createObjectStore('designs', { keyPath: 'id' });
      db.createObjectStore('assets', { keyPath: 'id' });
      db.createObjectStore('brand');
      db.createObjectStore('tombstones', { keyPath: 'id' });
    },
  });
}

export async function deleteLocalDb(principal: Principal): Promise<void> {
  const { deleteDB } = await import('idb');
  await deleteDB(dbName(principal));
}

/** Bytes de un Blob (con alternativa para navegadores sin `Blob.arrayBuffer`). */
function toBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as ArrayBuffer);
    r.onerror = () => reject(r.error);
    r.readAsArrayBuffer(blob);
  });
}

export function createLocalRepos(db: IDBPDatabase<Schema>): LocalRepos {
  return {
    designs: {
      async list() {
        const all = await db.getAll('designs');
        // Lo corrupto o de una versión desconocida se ignora, no rompe la lista.
        return all.map(migrateDesign).filter((d): d is Design => d !== null).sort((a, b) => b.updatedAt - a.updatedAt);
      },
      async get(id) {
        const raw = await db.get('designs', id);
        return raw ? (migrateDesign(raw) ?? undefined) : undefined;
      },
      async put(design) {
        await db.put('designs', design);
      },
      async remove(id) {
        await db.delete('designs', id);
      },
    },
    assets: {
      async get(id) {
        const rec = await db.get('assets', id);
        if (!rec) return undefined;
        // Registros nuevos: bytes + tipo. Registros antiguos: el Blob tal cual.
        return rec.buf ? new Blob([rec.buf], { type: rec.type ?? '' }) : rec.blob;
      },
      async put(id, blob) {
        // Se guardan bytes y no el Blob: WebKit falla al guardar Blobs en IndexedDB en modo privado y
        // contextos efímeros, y las imágenes de la persona dejarían de poder subirse.
        await db.put('assets', { id, buf: await toBuffer(blob), type: blob.type });
      },
      async has(id) {
        return (await db.getKey('assets', id)) !== undefined;
      },
      async ids() {
        return (await db.getAllKeys('assets')) as string[];
      },
    },
    brand: {
      async get() {
        const raw = await db.get('brand', 'kit');
        return raw ? migrateBrandKit(raw) : null;
      },
      async put(kit) {
        await db.put('brand', kit, 'kit');
      },
    },
    tombstones: {
      async list() {
        return (await db.getAll('tombstones')).map((t) => t.id);
      },
      async add(id) {
        await db.put('tombstones', { id, at: Date.now() });
      },
      async clear(ids) {
        const tx = db.transaction('tombstones', 'readwrite');
        await Promise.all([...ids.map((id) => tx.store.delete(id)), tx.done]);
      },
    },
  };
}
