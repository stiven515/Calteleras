import { describe, expect, it } from 'vitest';
import { fitWithin, migrateBrandKit, migrateDesign } from './index';

const good = {
  v: 1,
  id: 'a',
  title: 'Mi diseño',
  templateId: 'yt-impacto',
  formatId: 'yt-thumb',
  values: { title: 'Hola' },
  palette: { bg: '#000000', fg: '#ffffff', accent: '#ff0000', muted: '#999999' },
  fonts: { heading: 'A', body: 'B' },
  updatedAt: 5,
};

describe('migrateDesign', () => {
  it('acepta un diseño válido', () => {
    expect(migrateDesign(good)).toEqual(good);
  });
  it('rechaza versiones futuras y basura sin lanzar', () => {
    expect(migrateDesign({ ...good, v: 2 })).toBeNull();
    expect(migrateDesign(null)).toBeNull();
    expect(migrateDesign('x')).toBeNull();
    expect(migrateDesign([])).toBeNull();
  });
  it('rechaza paletas con colores inválidos', () => {
    expect(migrateDesign({ ...good, palette: { ...good.palette, bg: 'rojo' } })).toBeNull();
  });
  it('rellena título y fecha ausentes', () => {
    const { title: _t, updatedAt: _u, ...rest } = good;
    expect(migrateDesign(rest)).toMatchObject({ title: 'Sin título', updatedAt: 0 });
  });
  it('conserva slides numéricos', () => {
    expect(migrateDesign({ ...good, slides: 4 })?.slides).toBe(4);
    expect(migrateDesign({ ...good, slides: 'x' })?.slides).toBeUndefined();
  });
});

describe('migrateBrandKit', () => {
  it('normaliza un kit parcial', () => {
    expect(migrateBrandKit({ v: 1 })).toEqual({ v: 1, logoAssetId: null, palette: null, fonts: null, updatedAt: 0 });
  });
  it('rechaza otra versión', () => {
    expect(migrateBrandKit({ v: 3 })).toBeNull();
  });
});

describe('fitWithin', () => {
  it('no agranda', () => expect(fitWithin(800, 600, 2560)).toEqual({ width: 800, height: 600 }));
  it('reduce por el lado mayor conservando proporción', () => {
    expect(fitWithin(5120, 2880, 2560)).toEqual({ width: 2560, height: 1440 });
    expect(fitWithin(3000, 6000, 2560)).toEqual({ width: 1280, height: 2560 });
  });
  it('rechaza dimensiones inválidas', () => expect(() => fitWithin(0, 5, 10)).toThrow(RangeError));
});
