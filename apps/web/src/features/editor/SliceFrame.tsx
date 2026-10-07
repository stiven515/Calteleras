import type { ReactNode } from 'react';

interface Props {
  width: number;
  height: number;
  /** Desplazamiento X del panorama (negativo o 0), tal como lo da computeSlices. */
  offsetX: number;
  children: ReactNode;
}

/**
 * Una imagen del carrusel: ventana de tamaño real que muestra un tramo del panorama.
 * No escala nada; se usa tanto en la tira de vista previa (dentro de PreviewStage) como en la exportación.
 */
export function SliceFrame({ width, height, offsetX, children }: Props) {
  return (
    <div style={{ width, height, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', left: offsetX, top: 0 }}>{children}</div>
    </div>
  );
}
