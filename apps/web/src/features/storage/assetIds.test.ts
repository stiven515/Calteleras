import { describe, expect, it } from 'vitest';
import { assetIdsInValues, isAssetId } from './assetIds';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';

describe('assetIds', () => {
  it('reconoce UUID y descarta lo demás', () => {
    expect(isAssetId(A)).toBe(true);
    expect(isAssetId('hola')).toBe(false);
    expect(isAssetId(null)).toBe(false);
    expect(isAssetId(`${A}x`)).toBe(false);
  });
  it('extrae ids únicos de los valores', () => {
    expect(assetIdsInValues({ photo: A, logo: B, again: A, title: 'texto', flag: true, none: null })).toEqual([A, B]);
  });
});
