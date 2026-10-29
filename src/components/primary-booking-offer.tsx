import { ArrowRight, Check } from 'lucide-react';
import './primary-booking-offer.css';

export function PrimaryBookingOffer({ lang = 'en' }: { lang?: 'en' | 'es' }) {
  const es = lang === 'es';
  const checkout = es ? '/booking-bundle/?lang=es#choose-plan' : '/booking-bundle/?lang=en#choose-plan';
  const demo = es ? '/booking-demo/?lang=es&source=featured-offer-clara' : '/booking-demo/?lang=en&source=featured-offer-clara';
  const steps = es
    ? ['Tu cliente envía su solicitud desde una página con tu marca.', 'Revisas servicios, fechas y cotizaciones en tu Command Center.', 'Los seguimientos elegibles no quedan olvidados.']
    : ['Your client sends a request from your branded Booking Page.', 'Review services, dates and quotes in your private Command Center.', 'Eligible unanswered quotes get up to two automatic follow-ups.'];

  return <section id="primary-booking-offer" className="tle-primary-booking-offer" aria-label={es ? 'Oferta principal de reservas' : 'Featured booking system offer'}>
    <div className="container tle-primary-booking-offer__grid">
      <div className="tle-primary-booking-offer__copy">
        <div className="eyebrow">{es ? 'EMPIEZA CON UN SISTEMA SIMPLE' : 'START WITH ONE SIMPLE SYSTEM'}</div>
        <h2 className="editorial">{es ? <>Mientras limpias, los mensajes se acumulan. <em>Que no se pierdan las reservas.</em></> : <>Messages pile up while you’re cleaning. <em>Your bookings shouldn’t get lost.</em></>}</h2>
        <p className="tle-primary-booking-offer__intro">{es
          ? 'Un enlace para recibir solicitudes. Un Command Center para saber qué sigue.'
          : 'One booking link for your clients. One place to see what needs your attention.'}</p>
        <div className="tle-primary-booking-offer__price">
          <span>{es ? 'PAGO ÚNICO · SIN MENSUALIDAD' : 'ONE-TIME PRICE · NO MONTHLY FEE'}</span>
          <strong>$15</strong>
        </div>
        <p className="tle-primary-booking-offer__price-note">{es ? 'Sin mensualidad para Booking Page + Command Center.' : 'No monthly fee for Booking Page + Command Center.'}</p>
        <div className="tle-primary-booking-offer__actions">
          <a className="tle-primary-booking-offer__cta" href={checkout}>{es ? 'Quiero mi sistema — $15' : 'Get my booking system — $15'} <ArrowRight size={18} aria-hidden="true"/></a>
          <a className="tle-primary-booking-offer__secondary" href={demo}>{es ? 'Solicitar demo más personalizada' : 'Request a More Personalized Demo'} <ArrowRight size={16} aria-hidden="true"/></a>
        </div>
        <p className="tle-primary-booking-offer__fine-print">{es
          ? 'La IA es opcional. Verás el pago inicial y cualquier mensualidad antes de comprar.'
          : 'AI is optional. One-time setup and monthly fees appear before you pay.'}</p>
      </div>
      <div className="tle-primary-booking-offer__preview" aria-label={es ? 'Ejemplo ilustrativo del flujo de reservas' : 'Illustrative booking workflow'}>
        <div className="tle-primary-booking-offer__preview-head"><span>{es ? 'ASÍ FUNCIONA' : 'HOW IT WORKS'}</span><span>{es ? 'EJEMPLO' : 'SAMPLE FLOW'}</span></div>
        <div className="tle-primary-booking-offer__preview-title">{es ? 'De la solicitud al siguiente paso' : 'From inquiry to next step'}</div>
        <ol>{steps.map((step, i) => <li key={step}><span className="tle-primary-booking-offer__number">{String(i+1).padStart(2,'0')}</span><span><Check size={17} aria-hidden="true"/>{step}</span></li>)}</ol>
        <div className="tle-primary-booking-offer__preview-footer">{es ? 'Tú controlas precios, disponibilidad y aprobaciones.' : 'You control pricing, availability and approvals.'}</div>
      </div>
    </div>
  </section>;
}
