/** Divide un texto multilínea en elementos no vacíos (uno por slide). */
export function splitLines(text: unknown): string[] {
  return String(text ?? '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * Contenido de cada slide a partir de la 2: los puntos en orden y, en la última, el cierre.
 * Slide 0 es la portada y no se calcula aquí.
 */
export function slideContents(points: string[], cta: string, slides: number): { kind: 'point' | 'cta'; text: string }[] {
  const out: { kind: 'point' | 'cta'; text: string }[] = [];
  for (let i = 1; i < slides; i++) {
    out.push(i === slides - 1 ? { kind: 'cta', text: cta } : { kind: 'point', text: points[i - 1] ?? '' });
  }
  return out;
}
