export interface Slice {
  index: number;
  /** Desplazamiento X del panorama dentro del contenedor de la imagen. */
  offsetX: number;
  width: number;
  height: number;
  /** Nombre de archivo numerado: 01.png, 02.png... */
  filename: (ext: 'png' | 'jpg') => string;
}

export function computeSlices(count: number, width: number, height: number): Slice[] {
  if (!Number.isInteger(count) || count < 1) throw new RangeError('count debe ser un entero >= 1');
  const pad = String(count).length < 2 ? 2 : String(count).length;
  return Array.from({ length: count }, (_, index) => ({
    index,
    offsetX: -index * width || 0, // evita -0
    width,
    height,
    filename: (ext) => `${String(index + 1).padStart(pad, '0')}.${ext}`,
  }));
}
