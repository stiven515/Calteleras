import { describe, expect, it } from 'vitest';
import { FORMATS, MVP_FORMATS, autoFit, availableViews, canvasSize, computeSlices, zonesForView } from './index';

describe('formats', () => {
  it('todas las zonas seguras están dentro del lienzo', () => {
    for (const f of Object.values(FORMATS)) {
      for (const z of f.safeZones) {
        const { x, y, w, h } = z.rect;
        expect(x).toBeGreaterThanOrEqual(0);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(x + w).toBeLessThanOrEqual(1.0001);
        expect(y + h).toBeLessThanOrEqual(1.0001);
      }
    }
  });
  it('la zona segura de la portada de YouTube mide 1546×423', () => {
    const f = FORMATS['yt-banner'];
    const r = f.safeZones[0]!.rect;
    expect(Math.round(r.w * f.width)).toBe(1546);
    expect(Math.round(r.h * f.height)).toBe(423);
  });
  it('toda zona declara al menos una vista', () => {
    for (const f of Object.values(FORMATS)) for (const z of f.safeZones) expect(z.views.length).toBeGreaterThan(0);
  });
  it('lista las vistas disponibles por formato', () => {
    expect(availableViews(FORMATS['yt-thumb'])).toEqual(['mobile', 'desktop']);
    expect(availableViews(FORMATS['ig-post'])).toEqual(['profile-grid']);
    expect(availableViews(FORMATS['ig-story'])).toEqual([]);
  });
  it('filtra zonas por vista', () => {
    expect(zonesForView(FORMATS['yt-thumb'], 'desktop').map((z) => z.id)).toEqual(['timestamp']);
    expect(zonesForView(FORMATS['yt-thumb'], 'profile-grid')).toEqual([]);
  });
  it('el MVP tiene 3 formatos', () => expect(MVP_FORMATS).toHaveLength(3));
  it('el carrusel multiplica el ancho por el número de slides', () => {
    expect(canvasSize(FORMATS['ig-carousel'], 4)).toEqual({ width: 4320, height: 1350 });
    expect(canvasSize(FORMATS['ig-post'], 4)).toEqual({ width: 1080, height: 1350 });
  });
});

describe('computeSlices', () => {
  it('desplaza el panorama por múltiplos exactos del ancho', () => {
    const s = computeSlices(3, 1080, 1350);
    expect(s.map((x) => x.offsetX)).toEqual([0, -1080, -2160]);
    expect(s.map((x) => x.filename('png'))).toEqual(['01.png', '02.png', '03.png']);
  });
  it('rechaza cantidades inválidas', () => {
    expect(() => computeSlices(0, 10, 10)).toThrow(RangeError);
  });
});

describe('autoFit', () => {
  it('devuelve el mayor tamaño que cabe', () => {
    expect(autoFit({ min: 10, max: 200, fits: (s) => s <= 73 })).toBe(73);
  });
  it('devuelve max si cabe completo y min si nada cabe', () => {
    expect(autoFit({ min: 10, max: 50, fits: () => true })).toBe(50);
    expect(autoFit({ min: 10, max: 50, fits: () => false })).toBe(10);
  });
});
