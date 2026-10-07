import { describe, expect, it } from 'vitest';
import { slideContents, splitLines } from './lines';

describe('splitLines', () => {
  it('ignora líneas vacías y espacios', () => {
    expect(splitLines(' a \n\n b\r\nc ')).toEqual(['a', 'b', 'c']);
  });
  it('tolera valores no texto', () => {
    expect(splitLines(null)).toEqual([]);
  });
});

describe('slideContents', () => {
  it('reparte puntos y deja el cierre en la última slide', () => {
    expect(slideContents(['A', 'B'], 'FIN', 4)).toEqual([
      { kind: 'point', text: 'A' },
      { kind: 'point', text: 'B' },
      { kind: 'cta', text: 'FIN' },
    ]);
  });
  it('con 2 slides solo hay cierre', () => {
    expect(slideContents(['A'], 'FIN', 2)).toEqual([{ kind: 'cta', text: 'FIN' }]);
  });
  it('rellena con vacío si faltan puntos', () => {
    expect(slideContents([], 'FIN', 3)[0]).toEqual({ kind: 'point', text: '' });
  });
});
