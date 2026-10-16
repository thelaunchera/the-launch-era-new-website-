import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { flushSync } from 'react-dom';
import { createPortal } from 'react-dom';
import { ArrowUpRight, ClipboardList, LayoutDashboard, SlidersHorizontal, X } from 'lucide-react';
import './process-view-transitions.css';

type Language = 'en' | 'es';
type TransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

const copy = {
  en: {
    hint: 'Tap a step to see what happens',
    explore: 'Explore step',
    close: 'Close step details',
    step: 'STEP',
    detail: 'WHAT TO EXPECT',
    steps: [
      {
        title: 'Share your business details.',
        summary: 'Complete the setup form after purchase.',
        detail: 'After purchasing, tell us about your cleaning business through the setup form. Your business information helps shape the system we prepare for you.',
        note: 'Your setup starts with the details you share.'
      },
      {
        title: 'We personalize your system.',
        summary: 'Your brand, services, prices, and booking flow.',
        detail: 'We tailor your setup around the business information you provide: your branding, cleaning services, pricing preferences, and booking process.',
        note: 'Built around your business, not a generic demo.'
      },
      {
        title: 'Open your workspace.',
        summary: 'Your access links arrive by email when ready.',
        detail: 'When your setup is ready, we send the access information by email so you can open your workspace and get familiar with your booking flow.',
        note: 'Your workspace is yours to explore.'
      }
    ]
  },
  es: {
    hint: 'Toca un paso para ver los detalles',
    explore: 'Explorar paso',
    close: 'Cerrar detalles del paso',
    step: 'PASO',
    detail: 'QUÉ PUEDES ESPERAR',
    steps: [
      {
        title: 'Comparte los datos de tu negocio.',
        summary: 'Completa el formulario de inicio después de comprar.',
        detail: 'Después de comprar, cuéntanos sobre tu negocio de limpieza en el formulario de inicio. Esa información nos ayuda a preparar tu sistema.',
        note: 'Todo empieza con los datos que compartes.'
      },
      {
        title: 'Personalizamos tu sistema.',
        summary: 'Tu marca, servicios, precios y flujo de reservas.',
        detail: 'Adaptamos la configuración según los datos de tu negocio: tu marca, servicios de limpieza, preferencias de precios y proceso de reservas.',
        note: 'Diseñado alrededor de tu negocio, no de un demo genérico.'
      },
      {
        title: 'Abre tu espacio de trabajo.',
        summary: 'Recibes tus enlaces por correo cuando esté listo.',
        detail: 'Cuando esté listo, recibirás un correo con los enlaces de acceso para abrir tu espacio de trabajo y conocer tu flujo de reservas.',
        note: 'Tu espacio listo para explorar.'
      }
    ]
  }
} as const;

const icons = [ClipboardList, SlidersHorizontal, LayoutDashboard] as const;
const motionName = (index: number) => 'tle-process-' + index;
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function ProcessSteps({ lang = 'en' }: { lang?: Language }) {
  const strings = copy[lang];
  const [active, setActive] = useState<number | null>(null);
  const [shared, setShared] = useState<number | null>(null);
  const sourceThumbs = useRef<(HTMLSpanElement | null)[]>([]);
  const sourceButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const detailHero = useRef<HTMLDivElement | null>(null);
  const closeButton = useRef<HTMLButtonElement | null>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const transitioning = useRef(false);

  useEffect(() => {
    if (active === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = previousOverflow; };
  }, [active]);

  function changeStep(next: number | null, index: number) {
    if (transitioning.current) return;
    transitioning.current = true;
    const opening = next !== null;
    if (opening) returnFocus.current = sourceButtons.current[index];
    const from = opening ? sourceThumbs.current[index]?.getBoundingClientRect() : detailHero.current?.getBoundingClientRect();

    // Exactly one source gets the transition name before the browser takes its first snapshot.
    flushSync(() => setShared(index));
    const update = () => flushSync(() => setActive(next));
    const finish = () => {
      document.documentElement.classList.remove('tle-process-transitioning');
      transitioning.current = false;
      if (!opening) returnFocus.current?.focus({ preventScroll: true });
    };

    const browser = document as TransitionDocument;
    if (!reduceMotion() && typeof browser.startViewTransition === 'function') {
      document.documentElement.classList.add('tle-process-transitioning');
      try {
        const transition = browser.startViewTransition(update);
        void transition.finished.catch(() => {}).finally(finish);
        return;
      } catch {
        document.documentElement.classList.remove('tle-process-transitioning');
      }
    }

    // FLIP fallback: the same visual grows from its measured thumbnail rectangle.
    if (!opening && !reduceMotion() && from && detailHero.current?.animate) {
      const target = sourceThumbs.current[index]?.getBoundingClientRect();
      if (target) {
        const dx = target.left - from.left;
        const dy = target.top - from.top;
        const animation = detailHero.current.animate([
          { transform: 'translate(0, 0) scale(1, 1)', opacity: 1 },
          { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(' + (target.width / from.width) + ', ' + (target.height / from.height) + ')', opacity: 0.9 }
        ], { duration: 500, easing: 'cubic-bezier(.32,.72,0,1)', fill: 'forwards' });
        void animation.finished.catch(() => {}).finally(() => { update(); finish(); });
        return;
      }
    }
    update();
    if (opening && !reduceMotion() && from && detailHero.current?.animate) {
      const target = detailHero.current.getBoundingClientRect();
      const dx = from.left - target.left;
      const dy = from.top - target.top;
      const animation = detailHero.current.animate([
        { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(' + (from.width / target.width) + ', ' + (from.height / target.height) + ')', opacity: 0.9 },
        { transform: 'translate(0, 0) scale(1, 1)', opacity: 1 }
      ], { duration: 500, easing: 'cubic-bezier(.32,.72,0,1)' });
      void animation.finished.catch(() => {}).finally(finish);
    } else {
      finish();
    }
  }

  function onDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (active === null) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      changeStep(null, active);
    } else if (event.key === 'Tab') {
      const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'));
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (first && last && event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (first && last && !event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  }

  const selected = active === null ? null : strings.steps[active];
  const SelectedIcon = active === null ? null : icons[active];

  return <>
    <p className="tle-process-hint">{strings.hint}</p>
    <div className="process-grid tle-process-grid">
      {strings.steps.map((item, index) => {
        const Icon = icons[index];
        const number = String(index + 1).padStart(2, '0');
        const isSource = active === null && shared === index;
        return <button
          type="button"
          className="process-step tle-process-card"
          key={number}
          ref={(node) => { sourceButtons.current[index] = node; }}
          onClick={() => changeStep(index, index)}
          aria-haspopup="dialog"
          aria-expanded={active === index}
          aria-label={strings.explore + ' ' + number + ': ' + item.title}
        >
          <span className="process-number" aria-hidden="true">{number}</span>
          <span
            ref={(node) => { sourceThumbs.current[index] = node; }}
            className="tle-process-thumbnail"
            style={{ viewTransitionName: isSource ? motionName(index) : 'none' }}
            aria-hidden="true"
          ><Icon size={26} strokeWidth={1.7}/></span>
          <span className="tle-process-card-copy"><span className="tle-process-card-title">{item.title}</span><span className="tle-process-card-summary">{item.summary}</span></span>
          <span className="tle-process-card-arrow" aria-hidden="true"><ArrowUpRight size={18}/></span>
        </button>;
      })}
    </div>
    {active !== null && selected && SelectedIcon && createPortal(
      <div className="tle-process-overlay" onPointerDown={(event) => {
        if (event.target === event.currentTarget) changeStep(null, active);
      }}>
        <div
          className="tle-process-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tle-process-dialog-title"
          aria-describedby="tle-process-dialog-copy"
          onKeyDown={onDialogKeyDown}
        >
          <button ref={closeButton} type="button" className="tle-process-close" onClick={() => changeStep(null, active)} aria-label={strings.close}><X size={22}/></button>
          <div ref={detailHero} className="tle-process-detail-hero" style={{ viewTransitionName: shared === active ? motionName(active) : 'none' }}>
            <div className="tle-process-detail-art" aria-hidden="true"><SelectedIcon size={76} strokeWidth={1.25}/></div>
            <div className="tle-process-detail-index">{strings.step} {String(active + 1).padStart(2, '0')}</div>
          </div>
          <div className="tle-process-detail-body">
            <div className="tle-process-detail-label">{strings.detail}</div>
            <h3 id="tle-process-dialog-title">{selected.title}</h3>
            <p id="tle-process-dialog-copy">{selected.detail}</p>
            <div className="tle-process-detail-note">{selected.note}</div>
          </div>
        </div>
      </div>, document.body
    )}
  </>;
}
