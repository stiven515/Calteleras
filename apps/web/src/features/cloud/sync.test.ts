import { describe, expect, it } from 'vitest';
import { aDesign, memoryRepos } from '../../testing/memoryRepos';
import { moveLocalData, syncBrand, syncDesigns } from './sync';

const UUID1 = '11111111-1111-4111-8111-111111111111';

describe('syncDesigns', () => {
  it('sube lo que solo existe en el dispositivo y baja lo que solo existe en la nube', async () => {
    const local = memoryRepos();
    const remote = memoryRepos();
    await local.designs.put(aDesign('solo-local', 1));
    await remote.designs.put(aDesign('solo-nube', 1));
    const r = await syncDesigns(local, remote);
    expect(r).toMatchObject({ pushed: 1, pulled: 1, errors: [] });
    expect(remote._designs.has('solo-local')).toBe(true);
    expect(local._designs.has('solo-nube')).toBe(true);
  });

  it('gana el más reciente en ambos sentidos', async () => {
    const local = memoryRepos();
    const remote = memoryRepos();
    await local.designs.put(aDesign('a', 10, { title: 'local nuevo' }));
    await remote.designs.put(aDesign('a', 5, { title: 'nube viejo' }));
    await local.designs.put(aDesign('b', 5, { title: 'local viejo' }));
    await remote.designs.put(aDesign('b', 10, { title: 'nube nuevo' }));
    await syncDesigns(local, remote);
    expect(remote._designs.get('a')?.title).toBe('local nuevo');
    expect(local._designs.get('b')?.title).toBe('nube nuevo');
  });

  it('es idempotente: una segunda sincronización no hace nada', async () => {
    const local = memoryRepos();
    const remote = memoryRepos();
    await local.designs.put(aDesign('a', 10));
    await syncDesigns(local, remote);
    expect(await syncDesigns(local, remote)).toMatchObject({ pushed: 0, pulled: 0 });
  });

  it('un borrado local se propaga a la nube y no se vuelve a descargar', async () => {
    const local = memoryRepos();
    const remote = memoryRepos();
    await remote.designs.put(aDesign('x', 5));
    await local.tombstones.add('x'); // se borró en el dispositivo
    const r = await syncDesigns(local, remote);
    expect(r.deleted).toBe(1);
    expect(remote._designs.has('x')).toBe(false);
    expect(local._designs.has('x')).toBe(false);
    expect(local._tombs.size).toBe(0);
  });

  it('si la nube falla al borrar, la lápida se conserva y el diseño no resucita', async () => {
    const local = memoryRepos();
    const remote = memoryRepos();
    await remote.designs.put(aDesign('x', 5));
    await local.tombstones.add('x');
    remote.designs.remove = async () => {
      throw new Error('sin conexión');
    };
    const r = await syncDesigns(local, remote);
    expect(r.errors).toHaveLength(1);
    expect(local._tombs.has('x')).toBe(true);
    expect(local._designs.has('x')).toBe(false);
  });

  it('un diseño que falla no detiene a los demás', async () => {
    const local = memoryRepos();
    const remote = memoryRepos({ failPutFor: ['malo'] });
    await local.designs.put(aDesign('malo', 1));
    await local.designs.put(aDesign('bueno', 1));
    const r = await syncDesigns(local, remote);
    expect(r.pushed).toBe(1);
    expect(r.errors).toHaveLength(1);
    expect(remote._designs.has('bueno')).toBe(true);
  });

  it('sube la imagen que usa un diseño y no repite la que ya está', async () => {
    const local = memoryRepos();
    const remote = memoryRepos();
    await local.assets.put(UUID1, new Blob(['x']));
    await local.designs.put(aDesign('a', 1, { values: { photo: UUID1, title: 'hola' } }));
    await syncDesigns(local, remote);
    expect(remote._assets.has(UUID1)).toBe(true);
  });

  it('no sube nada si el valor parece un id pero no hay imagen local', async () => {
    const local = memoryRepos();
    const remote = memoryRepos();
    await local.designs.put(aDesign('a', 1, { values: { photo: UUID1 } }));
    const r = await syncDesigns(local, remote);
    expect(r.errors).toEqual([]);
    expect(remote._assets.size).toBe(0);
  });
});

describe('syncBrand', () => {
  const kit = (updatedAt: number, logo: string | null = null) => ({ v: 1 as const, logoAssetId: logo, palette: null, fonts: null, updatedAt });

  it('gana el más reciente y sube el logo', async () => {
    const local = memoryRepos();
    const remote = memoryRepos();
    await local.assets.put(UUID1, new Blob(['logo']));
    await local.brand.put(kit(9, UUID1));
    await remote.brand.put(kit(3));
    await syncBrand(local, remote);
    expect(remote._kit.v?.updatedAt).toBe(9);
    expect(remote._assets.has(UUID1)).toBe(true);
  });

  it('baja el kit de la nube si es más nuevo', async () => {
    const local = memoryRepos();
    const remote = memoryRepos();
    await local.brand.put(kit(1));
    await remote.brand.put(kit(7));
    await syncBrand(local, remote);
    expect(local._kit.v?.updatedAt).toBe(7);
  });
});

describe('moveLocalData (invitado → cuenta)', () => {
  it('mueve diseños, imágenes, kit y lápidas', async () => {
    const guest = memoryRepos();
    const user = memoryRepos();
    await guest.designs.put(aDesign('a', 5));
    await guest.assets.put(UUID1, new Blob(['x']));
    await guest.brand.put({ v: 1, logoAssetId: null, palette: null, fonts: null, updatedAt: 2 });
    await guest.tombstones.add('z');
    const moved = await moveLocalData(guest, user);
    expect(moved).toBe(1);
    expect(user._designs.has('a')).toBe(true);
    expect(user._assets.has(UUID1)).toBe(true);
    expect(user._kit.v?.updatedAt).toBe(2);
    expect(user._tombs.has('z')).toBe(true);
  });

  it('no pisa un diseño más reciente de la cuenta', async () => {
    const guest = memoryRepos();
    const user = memoryRepos();
    await guest.designs.put(aDesign('a', 5, { title: 'invitado' }));
    await user.designs.put(aDesign('a', 9, { title: 'cuenta' }));
    expect(await moveLocalData(guest, user)).toBe(0);
    expect(user._designs.get('a')?.title).toBe('cuenta');
  });
});
