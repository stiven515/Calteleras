import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { autoFit } from '@cartelera/core';

interface Props {
  text: string;
  min: number;
  max: number;
  style?: CSSProperties;
}

/** Texto que ocupa el mayor tamaño posible dentro de su contenedor (el padre define ancho y alto). */
export function AutoFitText({ text, min, max, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(max);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const next = autoFit({
        min,
        max,
        fits: (s) => {
          el.style.fontSize = `${s}px`;
          return el.scrollHeight <= el.clientHeight && el.scrollWidth <= el.clientWidth;
        },
      });
      el.style.fontSize = `${next}px`;
      setSize(next);
    };
    fit();
    void document.fonts?.ready.then(fit);
  }, [text, min, max, style?.fontFamily]);

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        // Margen superior para que no se corten las tildes de mayúsculas (Á, Ñ) con line-height bajo.
        paddingTop: '0.12em',
        overflow: 'hidden',
        overflowWrap: 'anywhere',
        fontSize: size,
        ...style,
      }}
    >
      {text}
    </div>
  );
}
