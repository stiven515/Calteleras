import { describe, expect, it } from 'vitest';
import { checkPalette, contrastRatio, hexToRgb } from './color';

describe('color', () => {
  it('parsea hex corto y largo', () => {
    expect(hexToRgb('#fff')).toEqual([255, 255, 255]);
    expect(hexToRgb('0f1b3d')).toEqual([15, 27, 61]);
  });
  it('rechaza colores inválidos', () => {
    expect(() => hexToRgb('azul')).toThrow(RangeError);
  });
  it('contraste negro/blanco es 21 y es simétrico', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#fff', '#000')).toBeCloseTo(21, 5);
  });
  it('mismo color da 1', () => {
    expect(contrastRatio('#336699', '#336699')).toBeCloseTo(1, 5);
  });
  it('detecta una paleta ilegible', () => {
    const issues = checkPalette({ bg: '#ffffff', fg: '#eeeeee', accent: '#ffff00', muted: '#dddddd' });
    expect(issues.map((i) => i.slot).sort()).toEqual(['accent', 'fg', 'muted']);
  });
  it('acepta una paleta legible', () => {
    expect(checkPalette({ bg: '#0f1b3d', fg: '#ffffff', accent: '#ffc233', muted: '#c7d2f0' })).toEqual([]);
  });
});
