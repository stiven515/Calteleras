import { useCallback, useEffect, useMemo, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { clamp, layoutCylinder, nearestIndex, type CylinderItem } from '../../lib/cylinder';
import { es } from '../../i18n/es';

export interface CarouselCard extends CylinderItem {
  key: string;
  node: ReactNode;
}

interface Props {
  cards: CarouselCard[];
  /** Alto de las tarjetas en px. */
  cardHeight: number;
  /** Radio del cilindro: más grande = más plano. */
  radius?: number;
  /** Tarjeta (puede ser fraccionaria) que arranca en el centro. */
  startAt?: number;
  label: string;
}

const FADE = 'linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%)';
const FRICTION = 0.94;
const MIN_SPEED = 0.02; // px/ms

/**
 * Galería que gira sobre un cilindro y se arrastra con el puntero (inercia incluida).
 * Es decorativa: las tarjetas se ocultan a lectores de pantalla; los botones y las flechas del teclado
 * hacen de alternativa al arrastre. El movimiento escribe directo en el DOM (sin re-render por cuadro).
 */
export function DragCarousel({ cards, cardHeight, radius = 1300, startAt = 0, label }: Props) {
  const layout = useMemo(() => layoutCylinder(cards, radius), [cards, radius]);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = useRef(false);

  const startOffset = useMemo(() => {
    const lo = Math.floor(startAt);
    const hi = Math.min(lo + 1, layout.centers.length - 1);
    const t = startAt - lo;
    return layout.centers[lo]! * (1 - t) + layout.centers[hi]! * t;
  }, [layout, startAt]);

  const s = useRef({ offset: startOffset, velocity: 0, dragging: false, lastX: 0, lastT: 0, raf: 0, moved: 0 });

  const apply = useCallback(() => {
    const el = stageRef.current;
    if (el) el.style.transform = `translateZ(${-radius}px) rotateY(${-s.current.offset / radius}rad)`;
  }, [radius]);

  const stop = () => {
    cancelAnimationFrame(s.current.raf);
    s.current.raf = 0;
  };

  const clampOffset = useCallback((v: number) => clamp(v, layout.min, layout.max), [layout]);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    s.current.offset = clampOffset(startOffset);
    apply();
    return stop;
  }, [apply, clampOffset, startOffset]);

  const inertia = useCallback(() => {
    const st = s.current;
    const step = () => {
      st.offset = clampOffset(st.offset + st.velocity * 16);
      st.velocity *= FRICTION;
      if (st.offset === layout.min || st.offset === layout.max) st.velocity = 0;
      apply();
      st.raf = Math.abs(st.velocity) > MIN_SPEED ? requestAnimationFrame(step) : 0;
    };
    st.raf = requestAnimationFrame(step);
  }, [apply, clampOffset, layout]);

  const goTo = useCallback(
    (index: number) => {
      const target = layout.centers[clamp(index, 0, layout.centers.length - 1)]!;
      stop();
      if (reduced.current) {
        s.current.offset = target;
        apply();
        return;
      }
      const from = s.current.offset;
      const t0 = performance.now();
      const dur = 650;
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - t, 3); // ease-out cúbico
        s.current.offset = from + (target - from) * e;
        apply();
        s.current.raf = t < 1 ? requestAnimationFrame(tick) : 0;
      };
      s.current.raf = requestAnimationFrame(tick);
    },
    [apply, layout],
  );

  const step = (dir: 1 | -1) => goTo(nearestIndex(layout.centers, s.current.offset) + dir);

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    stop();
    const st = s.current;
    st.dragging = true;
    st.velocity = 0;
    st.lastX = e.clientX;
    st.lastT = performance.now();
    st.moved = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const st = s.current;
    if (!st.dragging) return;
    const now = performance.now();
    const dx = e.clientX - st.lastX;
    const dt = Math.max(1, now - st.lastT);
    st.offset = clampOffset(st.offset - dx);
    st.velocity = 0.8 * st.velocity + 0.2 * (-dx / dt); // suaviza para que la inercia no dé saltos
    st.lastX = e.clientX;
    st.lastT = now;
    st.moved += Math.abs(dx);
    apply();
  };

  const onUp = () => {
    const st = s.current;
    if (!st.dragging) return;
    st.dragging = false;
    if (!reduced.current && Math.abs(st.velocity) > MIN_SPEED) inertia();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') (e.preventDefault(), step(1));
    else if (e.key === 'ArrowLeft') (e.preventDefault(), step(-1));
  };

  const btn =
    'flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl ring-1 ring-black/20 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black';

  return (
    <section aria-roledescription="carrusel" aria-label={label} className="relative select-none">
      <div
        tabIndex={0}
        role="group"
        aria-label={es.landing.carouselHint}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="relative cursor-grab overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-black active:cursor-grabbing"
        style={{
          height: cardHeight + 90,
          perspective: 1500,
          touchAction: 'pan-y',
          // Desvanece los bordes: refuerza la sensación de profundidad del cilindro.
          WebkitMaskImage: FADE,
          maskImage: FADE,
        }}
      >
        <div ref={stageRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d', willChange: 'transform' }} aria-hidden="true">
          {cards.map((c, i) => (
            <div
              key={c.key}
              className="absolute left-1/2 top-1/2"
              style={{
                width: c.width,
                height: cardHeight,
                marginLeft: -c.width / 2,
                marginTop: -cardHeight / 2,
                transform: `rotateY(${layout.angles[i]}rad) translateZ(${radius}px)`,
                backfaceVisibility: 'hidden',
              }}
              draggable={false}
            >
              {c.node}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-3">
        <button type="button" className={btn} aria-label={es.landing.prev} onClick={() => step(-1)}>←</button>
        <button type="button" className={btn} aria-label={es.landing.next} onClick={() => step(1)}>→</button>
      </div>
    </section>
  );
}
