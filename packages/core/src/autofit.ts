export interface AutoFitOptions {
  min: number;
  max: number;
  /** Devuelve true si el texto cabe al tamaño de fuente dado. */
  fits: (fontSize: number) => boolean;
}

/** Búsqueda binaria del mayor tamaño entero que cabe; devuelve `min` si ninguno cabe. */
export function autoFit({ min, max, fits }: AutoFitOptions): number {
  let lo = Math.floor(min);
  let hi = Math.floor(max);
  if (lo > hi) throw new RangeError('min no puede ser mayor que max');
  if (fits(hi)) return hi;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (fits(mid)) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}
