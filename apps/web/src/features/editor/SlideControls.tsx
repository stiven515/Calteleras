import { es } from '../../i18n/es';
import { useEditor } from '../../stores/editorStore';

const btn =
  'h-9 w-9 rounded-md bg-white text-lg font-semibold ring-1 ring-black/15 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-black';

export function SlideControls() {
  const slides = useEditor((s) => s.slides);
  const { min, max } = useEditor((s) => s.slideLimits);
  const setSlides = useEditor((s) => s.setSlides);
  const showCuts = useEditor((s) => s.showCuts);
  const setShowCuts = useEditor((s) => s.setShowCuts);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
      <div className="flex items-center gap-3" role="group" aria-label={es.carousel.countLabel}>
        <span className="text-sm font-medium">{es.carousel.countLabel}</span>
        <button type="button" className={btn} aria-label={es.carousel.fewer} disabled={slides <= min} onClick={() => setSlides(slides - 1)}>
          −
        </button>
        <output aria-live="polite" className="w-6 text-center font-semibold">{slides}</output>
        <button type="button" className={btn} aria-label={es.carousel.more} disabled={slides >= max} onClick={() => setSlides(slides + 1)}>
          +
        </button>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={showCuts} onChange={(e) => setShowCuts(e.target.checked)} />
        {es.carousel.showCuts}
      </label>
    </div>
  );
}
