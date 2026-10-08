import { unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { zipBytes, zipFiles } from './zip';

describe('zip', () => {
  it('conserva nombres, orden y contenido', () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([9, 8, 7, 6]);
    const out = unzipSync(zipBytes({ '01.png': a, '02.png': b }));
    expect(Object.keys(out)).toEqual(['01.png', '02.png']);
    expect(Array.from(out['01.png']!)).toEqual([1, 2, 3]);
    expect(Array.from(out['02.png']!)).toEqual([9, 8, 7, 6]);
  });
  it('zipFiles devuelve un Blob application/zip no vacío', () => {
    const blob = zipFiles({ '01.png': new Uint8Array([1]) });
    expect(blob.type).toBe('application/zip');
    expect(blob.size).toBeGreaterThan(0);
  });
});
