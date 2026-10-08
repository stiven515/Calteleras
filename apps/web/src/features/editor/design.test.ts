import { describe, expect, it } from 'vitest';
import { igRuta, ytImpacto } from '@cartelera/templates';
import { assetIdsOf, deriveTitle, toDesign } from './design';

const snap = (over = {}) => ({
  designId: 'd1',
  title: '',
  values: { ...ytImpacto.defaults },
  palette: ytImpacto.palette,
  fonts: ytImpacto.fonts,
  slides: 1,
  ...over,
});

describe('design', () => {
  it('deriva el título del primer texto', () => {
    expect(deriveTitle(ytImpacto, { title: '  Fe   que mueve  ' })).toBe('Fe que mueve');
    expect(deriveTitle(ytImpacto, { title: '', verse: '', subtitle: '' })).toBe('Impacto');
  });
  it('usa el título manual si existe', () => {
    expect(toDesign(snap({ title: 'Mío' }), ytImpacto).title).toBe('Mío');
  });
  it('solo guarda slides en carrusel', () => {
    expect(toDesign(snap(), ytImpacto).slides).toBeUndefined();
    expect(toDesign(snap({ slides: 5 }), igRuta).slides).toBe(5);
  });
  it('fija formato, plantilla y fecha', () => {
    const d = toDesign(snap(), ytImpacto, 123);
    expect(d).toMatchObject({ v: 1, id: 'd1', templateId: 'yt-impacto', formatId: 'yt-thumb', updatedAt: 123 });
  });
  it('lista los assets de los campos de imagen', () => {
    expect(assetIdsOf({ values: { photo: 'abc', title: 'x' } }, ytImpacto)).toEqual(['abc']);
    expect(assetIdsOf({ values: { photo: null } }, ytImpacto)).toEqual([]);
  });
});
