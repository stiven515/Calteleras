import type { Palette } from './types';

export function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new RangeError(`Color inválido: ${hex}`);
  let h = m[1]!;
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Luminancia relativa WCAG 2.x. */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

export interface ContrastIssue {
  slot: 'fg' | 'muted' | 'accent';
  ratio: number;
  required: number;
}

/** Texto normal ≥ 4.5; texto secundario grande y acentos ≥ 3. */
const REQUIRED: Record<ContrastIssue['slot'], number> = { fg: 4.5, muted: 3, accent: 3 };

export function checkPalette(p: Palette): ContrastIssue[] {
  const issues: ContrastIssue[] = [];
  for (const slot of ['fg', 'muted', 'accent'] as const) {
    const ratio = contrastRatio(p[slot], p.bg);
    if (ratio < REQUIRED[slot]) issues.push({ slot, ratio, required: REQUIRED[slot] });
  }
  return issues;
}
