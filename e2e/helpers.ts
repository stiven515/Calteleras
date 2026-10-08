import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { unzipSync } from 'fflate';
import type { Download } from '@playwright/test';

export async function readDownload(download: Download): Promise<Buffer> {
  const path = await download.path();
  return readFileSync(path);
}

export function pngSize(buf: Uint8Array): { width: number; height: number } {
  // Firma PNG (8 bytes) + chunk IHDR: ancho y alto en los bytes 16–23.
  const sig = Buffer.from(buf.slice(0, 8)).toString('hex');
  if (sig !== '89504e470d0a1a0a') throw new Error('No es un PNG');
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  return { width: dv.getUint32(16), height: dv.getUint32(20) };
}

export function unzip(buf: Buffer): Record<string, Uint8Array> {
  return unzipSync(new Uint8Array(buf));
}

/** Diferencia media absoluta entre dos columnas de píxeles (0 = idénticas). */
function columnDiff(a: PNG, xa: number, b: PNG, xb: number): number {
  let sum = 0;
  for (let y = 0; y < a.height; y++) {
    const ia = (y * a.width + xa) * 4;
    const ib = (y * b.width + xb) * 4;
    for (let c = 0; c < 3; c++) sum += Math.abs(a.data[ia + c]! - b.data[ib + c]!);
  }
  return sum / (a.height * 3);
}

/**
 * Continuidad entre dos imágenes consecutivas del carrusel: cuánto cambia el borde entre ellas
 * (`across`) frente a cuánto cambian dos columnas vecinas dentro de una misma imagen (`within`).
 * Si el corte es continuo, `across` es del mismo orden que `within`.
 */
export function seamMetrics(left: Uint8Array, right: Uint8Array): { across: number; within: number } {
  const a = PNG.sync.read(Buffer.from(left));
  const b = PNG.sync.read(Buffer.from(right));
  return {
    across: columnDiff(a, a.width - 1, b, 0),
    within: columnDiff(a, a.width - 2, a, a.width - 1),
  };
}

/** Porcentaje de píxeles que no son del color de fondo dominante: detecta imágenes en blanco. */
export function nonBackgroundRatio(buf: Uint8Array): number {
  const p = PNG.sync.read(Buffer.from(buf));
  const bg = [p.data[0]!, p.data[1]!, p.data[2]!];
  let diff = 0;
  for (let i = 0; i < p.data.length; i += 4) {
    if (Math.abs(p.data[i]! - bg[0]!) + Math.abs(p.data[i + 1]! - bg[1]!) + Math.abs(p.data[i + 2]! - bg[2]!) > 40) diff++;
  }
  return diff / (p.width * p.height);
}
