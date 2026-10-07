import { describe, expect, it } from 'vitest';
import { MIME, exportFilename } from './export';

describe('exportFilename', () => {
  it('normaliza el nombre', () => {
    expect(exportFilename('Fe que mueve montañas!', 'png')).toBe('fe-que-mueve-montanas.png');
  });
  it('usa un nombre por defecto si queda vacío', () => {
    expect(exportFilename('???', 'jpg')).toBe('diseno.jpg');
  });
  it('numera las imágenes del carrusel', () => {
    expect(exportFilename('x', 'png', 0)).toBe('01.png');
    expect(exportFilename('x', 'png', 9)).toBe('10.png');
  });
});

describe('MIME', () => {
  it('mapea formatos', () => {
    expect(MIME.png).toBe('image/png');
    expect(MIME.jpg).toBe('image/jpeg');
  });
});
