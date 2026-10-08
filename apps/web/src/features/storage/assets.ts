import { fitWithin } from '@cartelera/core';
import { requireRepos, useStorage } from './storageStore';

export const MAX_IMAGE_SIDE = 2560;

/** Reduce la imagen para no llenar la memoria ni el almacenamiento. WebP conserva transparencia (logos). */
export async function downscaleImage(file: Blob, max = MAX_IMAGE_SIDE): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  try {
    const { width, height } = fitWithin(bmp.width, bmp.height, max);
    if (width === bmp.width && height === bmp.height && file.size < 1_500_000) return file;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.9));
    return blob ?? file;
  } finally {
    bmp.close();
  }
}

/** Guarda una imagen subida por la persona y devuelve su id. */
export async function saveUploadedImage(file: Blob): Promise<{ id: string; url: string }> {
  const blob = await downscaleImage(file);
  const id = crypto.randomUUID();
  await requireRepos().assets.put(id, blob);
  return { id, url: URL.createObjectURL(blob) };
}

const urlCache = new Map<string, string>();

/** URL de una imagen guardada: primero local; si falta y hay sesión, la trae de la nube y la cachea local. */
export async function resolveAssetUrl(id: string): Promise<string | undefined> {
  const cached = urlCache.get(id);
  if (cached) return cached;
  const { repos, remoteAssets } = useStorage.getState();
  if (!repos) return undefined;
  let blob = await repos.assets.get(id);
  if (!blob && remoteAssets) {
    blob = await remoteAssets.get(id).catch(() => undefined);
    if (blob) await repos.assets.put(id, blob);
  }
  if (!blob) return undefined;
  const url = URL.createObjectURL(blob);
  urlCache.set(id, url);
  return url;
}

export async function resolveAssetUrls(ids: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  await Promise.all(
    ids.map(async (id) => {
      const u = await resolveAssetUrl(id);
      if (u) out[id] = u;
    }),
  );
  return out;
}

/** Al cambiar de usuario las URLs del anterior ya no valen. */
export function clearAssetUrlCache(): void {
  for (const u of urlCache.values()) URL.revokeObjectURL(u);
  urlCache.clear();
}
