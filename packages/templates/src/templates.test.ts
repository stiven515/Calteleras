import { describe, expect, it } from 'vitest';
import { FORMATS } from '@cartelera/core';
import { TEMPLATES } from './registry';

describe('plantillas', () => {
  it('ids únicos', () => {
    const ids = TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  for (const t of TEMPLATES) {
    describe(t.id, () => {
      it('declara solo formatos existentes', () => {
        for (const f of t.formats) expect(FORMATS[f]).toBeDefined();
      });
      it('todo campo tiene valor por defecto y viceversa', () => {
        const keys = t.fields.map((f) => f.key).sort();
        expect(Object.keys(t.defaults).sort()).toEqual(keys);
      });
      it('claves de campo únicas', () => {
        const keys = t.fields.map((f) => f.key);
        expect(new Set(keys).size).toBe(keys.length);
      });
    });
  }
});
