import type { FieldValues } from '@cartelera/core';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isAssetId = (v: unknown): v is string => typeof v === 'string' && UUID.test(v);

/**
 * Ids de imagen que aparecen en los valores de un diseño. Las imágenes se guardan con un UUID,
 * así que se reconocen sin depender de la plantilla (útil en sincronización y vistas públicas).
 */
export function assetIdsInValues(values: FieldValues): string[] {
  return [...new Set(Object.values(values).filter(isAssetId))];
}
