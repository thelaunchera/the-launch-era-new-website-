import { useEffect, useRef, useState } from 'react';
import { BellRing, CalendarCheck2, ClipboardList, MonitorSmartphone, Send } from 'lucide-react';
import './connected-booking-flow.css';

type Language = 'en' | 'es';

const positions = [
  { left: 3, top: 10 }, { left: 36, top: 10 }, { left: 69, top: 10 },
  { left: 69, top: 63 }, { left: 36, top: 63 },
];

const messages = {
  en: [
    { heading: 'New request', short: 'Customer reaches out', detail: 'Your Booking Page collects the requested service, contact details, and preferred time.' },
    { heading: 'In one place', short: 'Command Center', detail: 'Review each request in your private Command Center instead of searching through messages.' },
    { heading: 'Review & quote', short: 'You decide pricing', detail: 'Review the details and confirm a final estimate when you are ready.' },
    { heading: 'Follow-ups', short: 'Up to two reminders', detail: 'Eligible unanswered inquiries can receive up to two follow-ups. You stay in control.' },
    { heading: 'Next booking', short: 'Owner confirmation', detail: 'Confirm the booking details with the customer and keep the next step organized.' },
  ],
  es: [
    { heading: 'Nueva solicitud', short: 'El cliente escribe', detail: 'Tu Booking Page recibe el servicio solicitado, los datos de contacto y el horario preferido.' },
    { heading: 'Todo en un lugar', short: 'Command Center', detail: 'Revisa las solicitudes en tu Command Center privado, sin buscar entre mensajes.' },
    { heading: 'Revisa y cotiza', short: 'Tú decides el precio', detail: 'Revisa los detalles y confirma el estimado final cuando estés lista.' },
    { heading: 'Seguimientos', short: 'Hasta dos avisos', detail: 'Las consultas elegibles sin respuesta pueden recibir hasta dos seguimientos. Tú tienes el control.' },
    { heading: 'Próxima reserva', short: 'Tú confirmas', detail: 'Confirma los detalles de la reserva con tu cliente y mantén claro el próximo paso.' },
  ],
};

const symbols = [ClipboardList, MonitorSmartphone, Send, BellRing, CalendarCheck2];

/**
 * Marketing illustration: interactive explanation, not a CRM/editor or a live
 * status feed. No fake leads, collaborators, database requests, or submissions.
 */
export function ConnectedBookingFlow({ lang = 'en' }: { lang?: Language }) {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const es = lang === 'es';
  const nodes = messages[lang];

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setInView(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold: .15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={root} className={'tle-connected-flow' + (inView ? ' is-visible' : '')}>
    <div className="tle-connected-flow__intro">
      <span className="eyebrow">{es ? 'ASÍ SE CONECTA TU FLUJO' : 'YOUR FLOW, CONNECTED'}</span>
      <h3>{es ? 'Cada paso tiene su lugar.' : 'Every step has its place.'}</h3>
      <p>{es ? 'Explora un recorrido de ejemplo. Tú confirmas las reservas.' : 'Explore an example journey. You confirm the bookings.'}</p>
    </div>
    <div className="tle-connected-flow__viewport" tabIndex={0}
      aria-label={es ? 'Desliza para explorar las cinco etapas de la solicitud' : 'Scroll to explore five steps of a booking request'}>
      <div className="tle-connected-flow__plane">
        <svg className="tle-connected-flow__wires" viewBox="0 0 900 450" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <marker id={'tle-flow-arrow-' + lang} viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#709CB6"/>
            </marker>
          </defs>
          <path className="tle-connected-flow__wire" d="M 193 122 C 245 122 285 122 324 122 M 492 122 C 554 122 584 122 621 122 M 700 176 C 700 225 700 250 700 284 M 621 345 C 560 345 538 345 492 345"
            fill="none" stroke="#9ABAD0" strokeWidth="2.5" strokeLinecap="round"
            markerEnd={'url(#tle-flow-arrow-' + lang + ')'}/>
          <path className="tle-connected-flow__signal" d="M 193 122 C 245 122 285 122 324 122 M 492 122 C 554 122 584 122 621 122 M 700 176 C 700 225 700 250 700 284 M 621 345 C 560 345 538 345 492 345"
            fill="none" stroke="#327AA7" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 17"/>
          <path className="tle-connected-flow__dotted" d="M 82 314 C 150 236 186 270 272 298 S 324 369 345 385"
            fill="none" stroke="#A8BDD0" strokeWidth="2" strokeDasharray="2 7"/>
        </svg>
        {nodes.map((node, index) => {
          const Icon = symbols[index];
          return <button key={node.heading} type="button"
            className="tle-connected-flow__note"
            style={{ left: positions[index].left + '%', top: positions[index].top + '%' }}
            aria-pressed={active === index}
            aria-controls={'tle-flow-detail-' + lang}
            onClick={() => setActive(index)}>
            <span className="tle-connected-flow__note-top"><span>0{index + 1}</span><Icon size={22} aria-hidden="true"/></span>
            <strong>{node.heading}</strong>
            <small>{node.short}</small>
          </button>;
        })}
      </div>
    </div>
    <div className="tle-connected-flow__detail" id={'tle-flow-detail-' + lang} role="status" aria-live="polite">
      <span>0{active + 1} / 05</span>
      <div><strong>{nodes[active].heading}</strong><p>{nodes[active].detail}</p></div>
    </div>
    <p className="tle-connected-flow__mobile-hint">{es ? 'Desliza para seguir las conexiones →' : 'Swipe to follow the connections →'}</p>
  </div>;
}

/** Purely decorative dotted wiring visible AROUND a shrunken homepage hero. */
export function HeroConnectionBackdrop({ lang = 'en' }: { lang?: Language }) {
  return <div className="tle-hero-connection-backdrop" aria-hidden="true">
    <svg viewBox="0 0 1200 800" preserveAspectRatio="none" focusable="false">
      <path className="tle-hero-backdrop-wire" d="M -60 206 C 70 206 90 345 250 345 S 445 90 610 110 S 845 590 1030 590 S 1150 495 1260 495"/>
      <path className="tle-hero-backdrop-wire tle-hero-backdrop-wire--second" d="M -70 535 C 140 535 200 620 335 620 S 635 235 835 235 S 1020 395 1270 395"/>
      <circle cx="98" cy="260" r="7"/><circle cx="1108" cy="565" r="7"/>
      <circle cx="114" cy="543" r="5"/><circle cx="1125" cy="395" r="5"/>
    </svg>
    <span className="tle-hero-backdrop-chip tle-hero-backdrop-chip--left">01 <b>{lang === "es" ? "Solicitud" : "Request"}</b></span>
    <span className="tle-hero-backdrop-chip tle-hero-backdrop-chip--right">02 <b>{lang === "es" ? "Seguimiento" : "Follow-up"}</b></span>
  </div>;
}
