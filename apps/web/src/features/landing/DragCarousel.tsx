import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
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
  /** Radio del cilindro: más chico = más curvo. */
  radius?: number;
  /** Tarjeta (puede ser fraccionaria) que arranca en el centro. */
  startAt?: number;
  label: string;
}

const FADE = 'linear-gradient(to right, transparent 0, #000 4%, #000 96%, transparent 100%)';
const FRICTION_PER_FRAME = 0.94; // a 60 fps
const MIN_SPEED = 0.02; // px/ms
const AUTO_SPEED = 0.055; // px/ms ≈ 55 px/s: lento, para que se pueda mirar
const AUTO_EASE_MS = 700; // tiempo con que el movimiento automático arranca, se frena o invierte

/**
 * Galería que gira sobre un cilindro. Se arrastra con el puntero (con inercia) y, si no se toca,
 * se mueve sola de lado a lado. Es decorativa: las tarjetas se ocultan a lectores de pantalla.
 *
 * Movimiento automático (WCAG 2.2.2): se detiene al pasar el cursor, al enfocar, al arrastrar,
 * cuando la pestaña o el carrusel no están a la vista y con `prefers-reduced-motion`; además hay un botón de pausa.
 * El movimiento escribe directo en el DOM (sin re-render por cuadro).
 */
export function DragCarousel({ cards, cardHeight, radius = 1000, startAt = 0, label }: Props) {
  const layout = useMemo(() => layoutCylinder(cards, radius), [cards, radius]);
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [reduced, setReduced] = useState(false);
  const [playing, setPlaying] = useState(true);

  const startOffset = useMemo(() => {
    const lo = Math.floor(startAt);
    const hi = Math.min(lo + 1, layout.centers.length - 1);
    const t = startAt - lo;
    return layout.centers[lo]! * (1 - t) + layout.centers[hi]! * t;
  }, [layout, startAt]);

  const s = useRef({
    offset: startOffset,
    velocity: 0, // px/ms
    dragging: false,
    lastX: 0,
    lastT: 0,
    raf: 0,
    last: 0,
    autoDir: 1 as 1 | -1,
    hovering: false,
    visible: true,
    tweening: false,
    playing: true,
    reduced: false,
  });

  const apply = useCallback(() => {
    const el = stageRef.current;
    if (el) el.style.transform = `translateZ(${-radius}px) rotateY(${-s.current.offset / radius}rad)`;
  }, [radius]);

  // Recorrido permitido: que la fila de tarjetas siempre llene el ancho visible (sin escenario vacío en los extremos).
  const bounds = useRef({ lo: layout.min, hi: layout.max });
  const clampOffset = useCallback((v: number) => clamp(v, bounds.current.lo, bounds.current.hi), []);

  const updateBounds = useCallback(
    (viewportWidth: number) => {
      const half = (viewportWidth / 2) * 0.8; // el arco se acorta al curvarse en pantalla
      const lo = Math.min(Math.max(layout.min, half), layout.total / 2);
      const hi = Math.max(Math.min(layout.max, layout.total - half), layout.total / 2);
      bounds.current = { lo, hi };
      s.current.offset = clamp(s.current.offset, lo, hi);
    },
    [layout],
  );

  const isAuto = () => {
    const st = s.current;
    return st.playing && !st.reduced && !st.hovering && st.visible && !st.dragging && !st.tweening && !document.hidden;
  };

  const frame = useCallback(
    (now: number) => {
      const st = s.current;
      const dt = Math.min(64, now - st.last || 16);
      st.last = now;
      st.raf = 0;

      if (!st.dragging && !st.tweening) {
        if (isAuto()) {
          const target = st.autoDir * AUTO_SPEED;
          st.velocity += (target - st.velocity) * (1 - Math.exp(-dt / AUTO_EASE_MS));
        } else {
          st.velocity *= Math.pow(FRICTION_PER_FRAME, dt / 16);
        }
        const next = st.offset + st.velocity * dt;
        const bounded = clampOffset(next);
        if (bounded !== next) {
          st.velocity = 0;
          st.autoDir = bounded === bounds.current.hi ? -1 : 1; // al llegar a un extremo, vuelve hacia el otro
        }
        st.offset = bounded;
        apply();
      }

      const keepGoing = isAuto() || Math.abs(st.velocity) > MIN_SPEED || st.dragging;
      if (keepGoing) st.raf = requestAnimationFrame(frame);
    },
    [apply, clampOffset],
  );

  /** Arranca el bucle de animación si hace falta y no está corriendo. */
  const kick = useCallback(() => {
    const st = s.current;
    if (st.raf) return;
    st.last = performance.now();
    st.raf = requestAnimationFrame(frame);
  }, [frame]);

  const stop = () => {
    cancelAnimationFrame(s.current.raf);
    s.current.raf = 0;
  };

  // Preferencia de movimiento reducido (y cambios en vivo).
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      s.current.reduced = mq.matches;
      setReduced(mq.matches);
      kick();
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [kick]);

  // Posición inicial y arranque; el recorrido se recalcula si cambia el ancho de la pantalla.
  useEffect(() => {
    const el = rootRef.current;
    updateBounds(el?.clientWidth ?? window.innerWidth);
    s.current.offset = clampOffset(startOffset);
    apply();
    kick();
    const ro = el ? new ResizeObserver(() => (updateBounds(el.clientWidth), apply())) : undefined;
    if (el) ro?.observe(el);
    return () => {
      ro?.disconnect();
      stop();
    };
  }, [apply, clampOffset, startOffset, kick, updateBounds]);

  // Pausa cuando el carrusel no está a la vista o la pestaña está oculta.
  useEffect(() => {
    const el = rootRef.current;
    const onVisibility = () => kick();
    document.addEventListener('visibilitychange', onVisibility);
    let io: IntersectionObserver | undefined;
    if (el && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(([entry]) => {
        s.current.visible = !!entry?.isIntersecting;
        kick();
      });
      io.observe(el);
    }
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      io?.disconnect();
    };
  }, [kick]);

  const setPlay = (value: boolean) => {
    s.current.playing = value;
    setPlaying(value);
    kick();
  };

  const goTo = useCallback(
    (index: number) => {
      const st = s.current;
      const target = layout.centers[clamp(index, 0, layout.centers.length - 1)]!;
      stop();
      st.velocity = 0;
      if (st.reduced) {
        st.offset = target;
        apply();
        return;
      }
      st.tweening = true;
      const from = st.offset;
      const t0 = performance.now();
      const dur = 650;
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        st.offset = from + (target - from) * (1 - Math.pow(1 - t, 3)); // ease-out cúbico
        apply();
        if (t < 1) st.raf = requestAnimationFrame(tick);
        else {
          st.raf = 0;
          st.tweening = false;
          kick();
        }
      };
      st.raf = requestAnimationFrame(tick);
    },
    [apply, kick, layout],
  );

  const step = (dir: 1 | -1) => {
    setPlay(false); // quien usa el teclado toma el control: se detiene el movimiento automático
    goTo(nearestIndex(layout.centers, s.current.offset) + dir);
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const st = s.current;
    stop();
    st.dragging = true;
    st.tweening = false;
    st.velocity = 0;
    st.lastX = e.clientX;
    st.lastT = performance.now();
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
    if (Math.abs(dx) > 0) st.autoDir = dx < 0 ? 1 : -1; // el movimiento automático sigue en el sentido en que se arrastró
    st.lastX = e.clientX;
    st.lastT = now;
    apply();
  };

  const onUp = () => {
    const st = s.current;
    if (!st.dragging) return;
    st.dragging = false;
    if (st.reduced) st.velocity = 0;
    kick();
  };

  const setHover = (v: boolean) => {
    s.current.hovering = v;
    kick();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') (e.preventDefault(), step(1));
    else if (e.key === 'ArrowLeft') (e.preventDefault(), step(-1));
  };

  return (
    <section ref={rootRef} aria-roledescription="carrusel" aria-label={label} className="relative select-none">
      <div
        tabIndex={0}
        role="group"
        aria-label={es.landing.carouselHint}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        className="relative cursor-grab overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-black active:cursor-grabbing"
        style={{
          height: cardHeight + 70,
          perspective: 1400,
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

      {!reduced && (
        <div className="mt-1 flex justify-center">
          <button
            type="button"
            aria-pressed={!playing}
            onClick={() => setPlay(!playing)}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-600 underline decoration-1 underline-offset-4 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            {playing ? es.landing.pause : es.landing.play}
          </button>
        </div>
      )}
    </section>
  );
}
