import type { Design } from '@cartelera/core';
import { assetIdsInValues } from '../storage/assetIds';
import type { LocalRepos, Repos } from '../storage/repos';

export interface SyncResult {
  pushed: number;
  pulled: number;
  deleted: number;
  errors: string[];
}

/** Sube a la nube las imágenes que un diseño usa y que aún no están allí. Es independiente de la plantilla. */
async function pushAssets(valuesOwner: { values: Design['values'] }, local: LocalRepos, remote: Repos): Promise<void> {
  for (const id of assetIdsInValues(valuesOwner.values)) {
    if (!(await local.assets.has(id))) continue;
    if (await remote.assets.has(id)) continue;
    const blob = await local.assets.get(id);
    if (blob) await remote.assets.put(id, blob);
  }
}

/**
 * Sincronización "el último cambio gana" (por updatedAt) entre el dispositivo y la nube.
 * - Borrados pendientes (lápidas) se aplican primero y no se vuelven a descargar.
 * - Cada diseño falla por separado: un error no detiene el resto.
 * - Las imágenes se suben junto a su diseño y se descargan solo cuando hacen falta.
 */
export async function syncDesigns(local: LocalRepos, remote: Repos): Promise<SyncResult> {
  const result: SyncResult = { pushed: 0, pulled: 0, deleted: 0, errors: [] };
  const fail = (what: string, e: unknown) => result.errors.push(`${what}: ${e instanceof Error ? e.message : String(e)}`);

  const tombs = await local.tombstones.list();
  const done: string[] = [];
  for (const id of tombs) {
    try {
      await remote.designs.remove(id);
      done.push(id);
      result.deleted++;
    } catch (e) {
      fail(`borrar ${id}`, e);
    }
  }
  if (done.length) await local.tombstones.clear(done);
  const pendingDeletes = new Set(tombs.filter((id) => !done.includes(id)));

  const [mine, theirs] = await Promise.all([local.designs.list(), remote.designs.list()]);
  const l = new Map(mine.map((d) => [d.id, d]));
  const r = new Map(theirs.map((d) => [d.id, d]));

  for (const id of new Set([...l.keys(), ...r.keys()])) {
    if (pendingDeletes.has(id)) continue; // borrado local que aún no llegó a la nube: no resucitarlo
    const a = l.get(id);
    const b = r.get(id);
    try {
      if (a && (!b || a.updatedAt > b.updatedAt)) {
        await pushAssets(a, local, remote);
        await remote.designs.put(a);
        result.pushed++;
      } else if (b && (!a || b.updatedAt > a.updatedAt)) {
        await local.designs.put(b);
        result.pulled++;
      }
    } catch (e) {
      fail(`diseño ${id}`, e);
    }
  }
  return result;
}

/** Kit de marca: gana el más reciente; el logo se sube con él. */
export async function syncBrand(local: LocalRepos, remote: Repos): Promise<void> {
  const [a, b] = await Promise.all([local.brand.get(), remote.brand.get()]);
  if (a && (!b || a.updatedAt > b.updatedAt)) {
    if (a.logoAssetId && (await local.assets.has(a.logoAssetId)) && !(await remote.assets.has(a.logoAssetId))) {
      const blob = await local.assets.get(a.logoAssetId);
      if (blob) await remote.assets.put(a.logoAssetId, blob);
    }
    await remote.brand.put(a);
  } else if (b && (!a || b.updatedAt > a.updatedAt)) {
    await local.brand.put(b);
  }
}

/** Mueve lo guardado como invitado a la cuenta recién iniciada, sin pisar lo más reciente. */
export async function moveLocalData(from: LocalRepos, to: LocalRepos): Promise<number> {
  let moved = 0;
  for (const d of await from.designs.list()) {
    const existing = await to.designs.get(d.id);
    if (!existing || existing.updatedAt < d.updatedAt) {
      await to.designs.put(d);
      moved++;
    }
  }
  for (const id of await from.assets.ids()) {
    if (await to.assets.has(id)) continue;
    const blob = await from.assets.get(id);
    if (blob) await to.assets.put(id, blob);
  }
  const [kitFrom, kitTo] = await Promise.all([from.brand.get(), to.brand.get()]);
  if (kitFrom && (!kitTo || kitTo.updatedAt < kitFrom.updatedAt)) await to.brand.put(kitFrom);
  for (const id of await from.tombstones.list()) await to.tombstones.add(id);
  return moved;
}
