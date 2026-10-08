export interface FontOption {
  id: string;
  label: string;
  /** Valor para `font-family`. La fuente debe estar empaquetada en la app (así la exportación la incrusta). */
  stack: string;
}

export const HEADING_FONTS: FontOption[] = [
  { id: 'anton', label: 'Anton (impacto)', stack: "'Anton', Impact, sans-serif" },
  { id: 'bebas', label: 'Bebas Neue (condensada)', stack: "'Bebas Neue', Impact, sans-serif" },
  { id: 'playfair', label: 'Playfair Display (elegante)', stack: "'Playfair Display', Georgia, serif" },
  { id: 'montserrat', label: 'Montserrat (moderna)', stack: "'Montserrat Variable', system-ui, sans-serif" },
];

export const BODY_FONTS: FontOption[] = [
  { id: 'inter', label: 'Inter', stack: "'Inter Variable', system-ui, sans-serif" },
  { id: 'montserrat', label: 'Montserrat', stack: "'Montserrat Variable', system-ui, sans-serif" },
];

export function fontLabel(options: FontOption[], stack: string): string {
  return options.find((o) => o.stack === stack)?.label ?? stack;
}
