import { describe, expect, it } from 'vitest';
import { clamp, layoutCylinder, nearestIndex } from './cylinder';

describe('layoutCylinder', () => {
  it('coloca los centros uno tras otro con sus separaciones', () => {
    const l = layoutCylinder([{ width: 100 }, { width: 200, gapBefore: 20 }, { width: 100, gapBefore: 0 }], 1000);
    expect(l.centers).toEqual([50, 100 + 20 + 100, 100 + 20 + 200 + 50]);
    expect(l.total).toBe(420);
    expect(l.min).toBe(50);
    expect(l.max).toBe(370);
  });
  it('convierte la posición en ángulo con el radio', () => {
    const l = layoutCylinder([{ width: 200 }], 100);
    expect(l.angles[0]).toBeCloseTo(1, 10); // centro en 100 px, radio 100 → 1 rad
  });
  it('tarjetas contiguas (gap 0) quedan pegadas', () => {
    const l = layoutCylinder([{ width: 240 }, { width: 240, gapBefore: 0 }], 1300);
    expect(l.centers[1]! - l.centers[0]!).toBe(240);
  });
  it('rechaza entradas inválidas', () => {
    expect(() => layoutCylinder([], 100)).toThrow(RangeError);
    expect(() => layoutCylinder([{ width: 1 }], 0)).toThrow(RangeError);
  });
});

describe('clamp y nearestIndex', () => {
  it('limita al rango', () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
    expect(clamp(2, 0, 3)).toBe(2);
  });
  it('encuentra la tarjeta más cercana', () => {
    expect(nearestIndex([50, 170, 400], 0)).toBe(0);
    expect(nearestIndex([50, 170, 400], 130)).toBe(1);
    expect(nearestIndex([50, 170, 400], 999)).toBe(2);
  });
});
