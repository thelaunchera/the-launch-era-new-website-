import { ArrowRight, Check } from 'lucide-react';
import './primary-booking-offer.css';

export function PrimaryBookingOffer({ lang = 'en' }: { lang?: 'en' | 'es' }) {
  const es = lang === 'es';
  const checkout = es ? '/booking-bundle/?lang=es#choose-plan' : '/booking-bundle/?lang=en#choose-plan';
  const demo = es ? '/booking-demo/?lang=es' : '/booking-demo/?lang=en';
  const steps = es
    ? ['Tu cliente envía su solicitud desde una página con tu marca.', 'Revisas servicios, fechas y cotizaciones en tu Command Center.', 'Los seguimientos elegibles no quedan olvidados.']
    : ['Your client sends a request from your branded Booking Page.', 'Review services, dates and quotes in your private Command Center.', 'Eligible unanswered quotes get up to two automatic follow-ups.'];

  return <section id="primary-booking-offer" className="tle-primary-booking-offer" aria-label={es ? 'Oferta principal de reservas' : 'Featured booking system offer'}>
    <div className="container tle-primary-booking-offer__grid">
      <div className="tle-primary-booking-offer__copy">
        <div className="eyebrow">{es ? 'EMPIEZA CON UN SISTEMA SIMPLE' : 'START WITH ONE SIMPLE SYSTEM'}</div>
        <h2 className="editorial">{es ? <>Tus solicitudes de limpieza. <em>En un solo lugar.</em></> : <>Your cleaning requests. <em>One place to manage them.</em></>}</h2>
        <p className="tle-primary-booking-offer__intro">{es
          ? 'Una Booking Page personalizada y un Command Center privado para organizar solicitudes, cotizaciones y seguimientos sin software complicado.'
          : 'A personalized Booking Page and private Command Center to organize inquiries, quotes and follow-ups without complicated software.'}</p>
        <div className="tle-primary-booking-offer__price">
          <span>{es ? 'PAGO ÚNICO · OFERTA ACTUAL' : 'ONE-TIME PRICE · CURRENT OFFER'}</span>
          <del>$49.99</del><strong>$15</strong>
        </div>
        <p className="tle-primary-booking-offer__price-note">{es ? 'Sin mensualidad para Booking Page + Command Center.' : 'No monthly fee for Booking Page + Command Center.'}</p>
        <div className="tle-primary-booking-offer__actions">
          <a className="tle-primary-booking-offer__cta" href={checkout}>{es ? 'Quiero mi sistema — $15' : 'Get my booking system — $15'} <ArrowRight size={18} aria-hidden="true"/></a>
          <a className="tle-primary-booking-offer__secondary" href={demo}>{es ? 'Solicitar demo privada' : 'Request a private demo'} <ArrowRight size={16} aria-hidden="true"/></a>
        </div>
        <p className="tle-primary-booking-offer__fine-print">{es
          ? 'La IA es opcional y se vende aparte. Entrega estimada en 48 horas después de revisar y aprobar tu información completa.'
          : 'AI Assistants are optional and sold separately. Estimated delivery: 48 hours after your complete setup details are reviewed and kickoff is confirmed.'}</p>
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
