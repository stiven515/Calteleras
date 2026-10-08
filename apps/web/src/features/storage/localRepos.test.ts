import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Design } from '@cartelera/core';
import { GUEST, createLocalRepos, deleteLocalDb, openLocalDb } from './localRepos';

const design = (id: string, updatedAt: number): Design => ({
  v: 1,
  id,
  title: id,
  templateId: 'yt-impacto',
  formatId: 'yt-thumb',
  values: {},
  palette: { bg: '#000000', fg: '#ffffff', accent: '#ff0000', muted: '#999999' },
  fonts: { heading: 'A', body: 'B' },
  updatedAt,
});

describe('localRepos', () => {
  let db: Awaited<ReturnType<typeof openLocalDb>>;
  let repos: ReturnType<typeof createLocalRepos>;
  beforeEach(async () => {
    await deleteLocalDb(GUEST);
    db = await openLocalDb(GUEST);
    repos = createLocalRepos(db);
  });
  // Sin cerrar la conexión, deleteDB del siguiente test queda bloqueado.
  afterEach(() => db.close());

  it('guarda, lee y lista diseños del más reciente al más antiguo', async () => {
    await repos.designs.put(design('a', 1));
    await repos.designs.put(design('b', 3));
    await repos.designs.put(design('c', 2));
    expect((await repos.designs.list()).map((d) => d.id)).toEqual(['b', 'c', 'a']);
    expect((await repos.designs.get('c'))?.title).toBe('c');
  });

  it('put con el mismo id actualiza en vez de duplicar', async () => {
    await repos.designs.put(design('a', 1));
    await repos.designs.put({ ...design('a', 2), title: 'nuevo' });
    const all = await repos.designs.list();
    expect(all).toHaveLength(1);
    expect(all[0]?.title).toBe('nuevo');
  });

  it('borra', async () => {
    await repos.designs.put(design('a', 1));
    await repos.designs.remove('a');
    expect(await repos.designs.get('a')).toBeUndefined();
  });

  it('ignora registros corruptos al listar', async () => {
    await repos.designs.put(design('ok', 1));
    await repos.designs.put({ id: 'roto', v: 99 } as unknown as Design);
    expect((await repos.designs.list()).map((d) => d.id)).toEqual(['ok']);
  });

  it('guarda y recupera imágenes', async () => {
    const blob = new Blob(['hola'], { type: 'image/png' });
    expect(await repos.assets.has('x')).toBe(false);
    await repos.assets.put('x', blob);
    expect(await repos.assets.has('x')).toBe(true);
    // fake-indexeddb no clona el Blob de jsdom (en un navegador sí); el round-trip real se verifica en el navegador.
    expect(await repos.assets.get('x')).toBeDefined();
    expect(await repos.assets.get('otro')).toBeUndefined();
  });

  it('kit de marca: null al inicio y persiste', async () => {
    expect(await repos.brand.get()).toBeNull();
    await repos.brand.put({ v: 1, logoAssetId: 'l', palette: null, fonts: null, updatedAt: 1 });
    expect((await repos.brand.get())?.logoAssetId).toBe('l');
  });

  it('lápidas: agrega y limpia', async () => {
    await repos.tombstones.add('a');
    await repos.tombstones.add('b');
    expect((await repos.tombstones.list()).sort()).toEqual(['a', 'b']);
    await repos.tombstones.clear(['a']);
    expect(await repos.tombstones.list()).toEqual(['b']);
  });
});
