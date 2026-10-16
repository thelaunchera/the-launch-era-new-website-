import { useEffect, useRef, useState } from 'react';
import './smart-welcome-bundle.css';

/** The Launch Era marketing welcome, separate from tenant Booking Page Smart Welcome.
 * The promotion is gated by the existing read-only server pricing endpoint.
 * This component cannot create quotes, purchases, leads or customer records. */
const ART = '/assets/promo/tle-smart-welcome-bundle-flyer.jpg';
const PRICING = 'https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-booking-bundle-checkout';
const SEEN_KEY = 'tle:bundle-welcome:oct-2026:v1';

type Props = { lang?: 'en' | 'es' };

export function SmartWelcomeBundle({ lang = 'en' }: Props) {
  const [eligible, setEligible] = useState(false);
  const [open, setOpen] = useState(false);
  const [flyerFailed, setFlyerFailed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const es = lang === 'es';
  const href = '/booking-bundle/?lang=' + lang + '&bundle=ai-booking&source=smart-welcome';
  const cta = es ? 'Ver el paquete' : 'Get the bundle';
  const footnote = es
    ? '40% de descuento en la activación conjunta de Booking + AI Assistant. El plan mensual de IA mantiene su precio normal después de los primeros 30 días desde la entrega. El total se confirma antes de pagar.'
    : '40% off the combined Booking + AI Assistant activation. Regular AI monthly pricing follows after the first 30 days from delivery. Your total is confirmed before payment.';

  useEffect(() => {
    const controller = new AbortController();
    let popupTimer: ReturnType<typeof setTimeout> | undefined;
    // The website never advertises an inactive promotion or invents a price.
    fetch(PRICING, { method: 'GET', headers: { Accept: 'application/json' }, cache: 'no-store', signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('No promotion pricing');
        return response.json();
      })
      .then((pricing) => {
        if (controller.signal.aborted || pricing?.percent_off !== 40 || !pricing?.plans?.['ai-booking']) return;
        setEligible(true);
        let previouslySeen = false;
        try {
          previouslySeen = window.sessionStorage.getItem(SEEN_KEY) === 'seen';
        } catch { /* private browsing can disable storage */ }
        // Don't interrupt visitors arriving through direct section links.
        if (!previouslySeen && !window.location.hash) {
          popupTimer = window.setTimeout(() => {
            if (document.visibilityState !== 'visible' || controller.signal.aborted) return;
            setOpen(true);
            try { window.sessionStorage.setItem(SEEN_KEY, 'seen'); } catch { /* optional */ }
          }, 1100);
        }
      })
      .catch(() => { /* fail closed: checkout's live promotional terms are authoritative */ });
    return () => {
      controller.abort();
      if (popupTimer) window.clearTimeout(popupTimer);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return; }
      if (event.key !== 'Tab') return;
      const dialog = document.querySelector('.tle-bundle-welcome-dialog');
      if (!dialog) return;
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'));
      if (!controls.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', closeOnKey);
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnKey);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  if (!eligible) return null;

  return <>
    <section id="smart-welcome-bundle" className="tle-bundle-inline" aria-label={es ? 'Oferta de activación conjunta' : 'Combined activation offer'}>
      <div className="tle-bundle-inline-copy">
        <span className="tle-bundle-inline-discount">{es ? '40% MENOS' : '40% OFF'}</span>
        <div className="tle-bundle-inline-text">
          <span className="tle-bundle-inline-kicker">{es ? 'OFERTA DE ACTIVACIÓN CONJUNTA' : 'LIMITED-TIME COMBINED ACTIVATION'}</span>
          <h2>{es ? 'Un poco más de ayuda para tu negocio.' : 'A little extra help for your cleaning business.'}</h2>
          <p>{es ? 'Booking + Command Center, con AI Assistant opcional. El 40% de descuento aplica solo a la activación conjunta. La mensualidad estándar del AI Assistant se cobra después de los primeros 30 días desde la entrega.' : 'Booking + Command Center, with an optional AI Assistant. The 40% discount applies to the combined activation only. Standard AI monthly pricing still applies after the first 30 days from delivery.'}</p>
        </div>
      </div>
      <a className="tle-bundle-inline-cta" href={href}>{es ? 'Ver paquete' : 'Explore the bundle'} <span aria-hidden="true">↗</span></a>
    </section>

    {open && <div className="tle-bundle-welcome-backdrop" onMouseDown={(e) => {
      if (e.currentTarget === e.target) setOpen(false);
    }}>
      <section className="tle-bundle-welcome-dialog" role="dialog" aria-modal="true" aria-label={es ? 'Oferta de The Launch Era' : 'The Launch Era bundle offer'}>
        <button ref={closeRef} type="button" className="tle-bundle-welcome-close" onClick={() => setOpen(false)} aria-label={es ? 'Cerrar promoción' : 'Close promotion'}>×</button>
        <a className="tle-bundle-welcome-art" href={href} aria-label={cta}>
          {flyerFailed
            ? <div className="tle-bundle-art-fallback" role="img" aria-label={es ? 'Oferta de activación de Booking + AI Assistant' : 'Booking + AI Assistant activation offer'}>
                <span>THE LAUNCH ERA</span>
                <strong>{es ? 'Un negocio más organizado comienza aquí.' : 'Your next chapter starts here.'}</strong>
                <b>{es ? '40% MENOS EN LA ACTIVACIÓN CONJUNTA' : '40% OFF COMBINED ACTIVATION'}</b>
                <small>{es ? 'Booking + Command Center y AI Assistant opcional' : 'Booking + Command Center with optional AI Assistant'}</small>
              </div>
            : <img src={ART} alt={es ? 'Flyer con dos limpiadoras: 40% de descuento en activación conjunta' : 'Flyer featuring two cleaners: 40% off combined activation'} width="1122" height="1402" decoding="async" onError={() => setFlyerFailed(true)}/>}
        </a>
        <div className="tle-bundle-welcome-footer">
          <a className="tle-bundle-welcome-cta" href={href}>{cta} <span aria-hidden="true">↗</span></a>
          <p>{footnote}</p>
        </div>
      </section>
    </div>}
  </>;
}
