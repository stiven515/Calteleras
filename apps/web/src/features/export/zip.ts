import { zipSync } from 'fflate';

/**
 * Empaqueta archivos en un ZIP. PNG/JPG ya vienen comprimidos, así que se almacenan sin recomprimir
 * (level 0): es más rápido y el tamaño casi no cambia.
 * El orden de las claves se conserva, que es el orden de subida en Instagram.
 */
export function zipBytes(files: Record<string, Uint8Array>): Uint8Array {
  return zipSync(files, { level: 0 });
}

export function zipFiles(files: Record<string, Uint8Array>): Blob {
  return new Blob([zipBytes(files) as BlobPart], { type: 'application/zip' });
}

export async function blobToBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}
