import type { CSSProperties } from 'react';
import type { FieldValues } from '@cartelera/core';

/** URL de la imagen que una plantilla tiene en el campo `key`, si existe. */
export function assetOf(values: FieldValues, key: string, assets: Record<string, string>): string | undefined {
  const id = values[key];
  return typeof id === 'string' && id ? assets[id] : undefined;
}

/** Logo de la persona: se ajusta al espacio dado sin deformarse. No dibuja nada si no hay logo. */
export function Logo({ src, style }: { src: string | undefined; style: CSSProperties }) {
  if (!src) return null;
  return <img src={src} alt="" style={{ objectFit: 'contain', ...style }} />;
}
