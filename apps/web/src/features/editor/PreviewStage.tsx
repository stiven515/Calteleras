import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  width: number;
  height: number;
  children: ReactNode;
}

/** Muestra un lienzo de tamaño real escalado para caber en el contenedor. El export NO usa este escalado. */
export function PreviewStage({ width, height, children }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div
      ref={box}
      className="relative w-full overflow-hidden rounded-lg shadow-lg ring-1 ring-black/10"
      style={{ aspectRatio: `${width} / ${height}` }}
      role="img"
      aria-label="Vista previa del diseño"
    >
      <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
    </div>
  );
}
