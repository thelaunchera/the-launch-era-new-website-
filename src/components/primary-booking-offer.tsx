import { ArrowRight, Check } from 'lucide-react';
import './primary-booking-offer.css';

export function PrimaryBookingOffer({ lang = 'en' }: { lang?: 'en' | 'es' }) {
  const es = lang === 'es';
  const checkout = es ? '/booking-bundle/?lang=es#choose-plan' : '/booking-bundle/?lang=en#choose-plan';
  const included = es
    ? [
        ['Tu enlace de reservas', 'Servicios, extras y fecha preferida en una sola página.'],
        ['Tu espacio privado', 'Ves las solicitudes y cotizaciones que necesitan respuesta.'],
        ['Tú decides', 'Controlas precios, disponibilidad y confirmaciones.']
      ]
    : [
        ['Your booking link', 'Services, add-ons and preferred dates on one page.'],
        ['Your private workspace', 'See requests and quotes that need your attention.'],
        ['You stay in control', 'Manage prices, availability and confirmations.']
      ];

  return <section id="primary-booking-offer" className="tle-primary-booking-offer" aria-label={es ? 'Configura tu sistema de reservas' : 'Get your booking system'}>
    <div className="container tle-primary-booking-offer__grid">
      <div className="tle-primary-booking-offer__copy">
        <div className="eyebrow">{es ? 'AHORA, CON TU MARCA' : "YOU'VE SEEN THE FLOW"}</div>
        <h2 className="editorial">{es ? <>Ahora imagina esa página <em>con el nombre de tu negocio.</em></> : <>Now picture that page <em>with your business name on it.</em></>}</h2>
        <p className="tle-primary-booking-offer__intro">{es
          ? 'Con tus servicios, tus precios y tus horarios. La preparamos y te la enseñamos en privado antes de publicarla.'
          : 'Your services, your prices, your availability. We personalize it, then let you review everything privately before launch.'}</p>
        <div className="tle-primary-booking-offer__price">
          <span>{es ? 'CONFIGURACIÓN · PAGO ÚNICO' : 'YOUR SETUP · ONE-TIME PRICE'}</span>
          <strong>$15</strong>
        </div>
        <p className="tle-primary-booking-offer__price-note">{es ? 'Booking Page + Command Center. Sin mensualidad de Booking.' : 'Booking Page + Command Center. No monthly Booking fee.'}</p>
        <div className="tle-primary-booking-offer__actions">
          <a className="tle-primary-booking-offer__cta" href={checkout}>{es ? 'Quiero mi página de reservas — $15' : 'Get my Booking Page — $15'} <ArrowRight size={18} aria-hidden="true"/></a>
        </div>
        <p className="tle-primary-booking-offer__fine-print">{es
          ? 'La IA es opcional al comprar. Entrega estimada de 48 horas después de confirmar tus datos.'
          : 'AI is optional at checkout. Estimated delivery is 48 hours after we confirm your setup details.'}</p>
      </div>
      <div className="tle-primary-booking-offer__preview" aria-label={es ? 'Qué incluye el sistema de reservas' : "What's included with your booking setup"}>
        <div className="tle-primary-booking-offer__preview-head"><span>{es ? 'LO QUE RECIBES' : "WHAT'S INCLUDED"}</span><span>{es ? 'PERSONALIZADO' : 'PERSONALIZED'}</span></div>
        <div className="tle-primary-booking-offer__preview-title">{es ? 'Lo esencial, listo para trabajar.' : 'The essentials, ready for your business.'}</div>
        <ul className="tle-primary-booking-offer__included-list">{included.map(([title,detail])=><li key={title}><Check size={18} aria-hidden="true"/><span><strong>{title}</strong><small>{detail}</small></span></li>)}</ul>
      </div>
    </div>
  </section>;
}
