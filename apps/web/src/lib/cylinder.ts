export interface CylinderItem {
  width: number;
  /** Separación respecto a la tarjeta anterior (0 para que dos tarjetas se vean continuas). */
  gapBefore?: number;
}

export interface CylinderLayout {
  /** Posición del centro de cada tarjeta a lo largo del arco, medida desde el borde izquierdo (px). */
  centers: number[];
  /** Ángulo (rad) de cada tarjeta sobre el cilindro de radio `radius`. */
  angles: number[];
  /** Desplazamientos que dejan la primera / la última tarjeta en el centro. */
  min: number;
  max: number;
  total: number;
}

/** Reparte tarjetas de distinto ancho sobre un arco de cilindro, una tras otra. */
export function layoutCylinder(items: CylinderItem[], radius: number): CylinderLayout {
  if (items.length === 0) throw new RangeError('Se necesita al menos una tarjeta');
  if (radius <= 0) throw new RangeError('El radio debe ser positivo');
  const centers: number[] = [];
  let x = 0;
  items.forEach((it, i) => {
    if (i > 0) x += it.gapBefore ?? 0;
    centers.push(x + it.width / 2);
    x += it.width;
  });
  return {
    centers,
    angles: centers.map((c) => c / radius),
    min: centers[0]!,
    max: centers[centers.length - 1]!,
    total: x,
  };
}

export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** Índice de la tarjeta cuyo centro está más cerca del desplazamiento actual. */
export function nearestIndex(centers: number[], offset: number): number {
  let best = 0;
  for (let i = 1; i < centers.length; i++) {
    if (Math.abs(centers[i]! - offset) < Math.abs(centers[best]! - offset)) best = i;
  }
  return best;
}
