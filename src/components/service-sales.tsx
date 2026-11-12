import { MarketingCTA } from '@/components/marketing-cta';
import { ArrowRight, Plus } from 'lucide-react';
import { PurchaseClarity } from './home-sales';
import './service-sales-mobile-cta.css';

type Props = { product: 'booking'; lang?: 'en' | 'es' };

// Only the active Booking Page + Admin Panel service is sold here.
// Standalone Cleaning App trials, pricing and sign-up links were retired.
export function ServiceSales({ product, lang = 'en' }: Props) {
  const es = lang === 'es';
  const pains = es ? [
    ['Te preguntaron por una limpieza. Ahora no encuentras los detalles.', 'Buscar el servicio, la dirección y la fecha en distintos chats.', 'La Booking Page recoge los datos y los lleva a tu panel de administrador.'],
    ['Una cotización que quedó sin respuesta.', 'Recordar a quién debes volver a escribir entre una limpieza y otra.', 'Nosotros nos encargamos de los dos seguimientos automáticos si no hay respuesta. Tú decides si enviar un último mensaje o detenerte.'],
    ['Un cambio de precios u horarios.', 'Volver a explicar tus opciones cada vez que alguien pregunta.', 'Actualiza servicios, precios y disponibilidad desde tu espacio privado.']
  ] : [
    ['Someone asked about cleaning. Now you can’t find the details.', 'Find the service, address, and date across different chats.', 'Your Booking Page collects the details and sends them to your Admin Panel.'],
    ['A quote that went quiet.', 'Remember who needs a follow-up between cleaning jobs.', 'We handle the first two automatic follow-ups if there is no reply. You decide whether to send a final message or stop.'],
    ['A change to your rates or schedule.', 'Explain your options again every time someone asks.', 'Update services, prices, and availability in your private workspace.']
  ];
  const primary = `/booking-bundle/?lang=${lang}`;
  const demo = `/booking-demo/?lang=${lang}`;

  return <div className="service-sales">
    <div className="service-sales-pain">
      <div className="eyebrow">{es ? '¿TE SUENA FAMILIAR?' : 'DOES THIS SOUND FAMILIAR?'}</div>
      <h2 className="editorial">{es ? 'Responder no debería empezar buscando mensajes.' : 'Replying should not start with hunting through messages.'}</h2>
      <p>{es ? 'Toca una situación para ver qué cambia.' : 'Tap a situation to see what changes.'}</p>
      <div className="service-pain-list">
        {pains.map(([title, before, after], i) =>
          <details key={title} onToggle={e => {
            if (e.currentTarget.open) window.tleTrackEvent?.('service_pain_open', { product, lang, situation: i });
          }}>
            <summary>{title}<Plus size={18}/></summary>
            <div><p><strong>{es ? 'Hoy: ' : 'Today: '}</strong>{before}</p><p><strong>{es ? 'Con TLE: ' : 'With TLE: '}</strong>{after}</p></div>
          </details>
        )}
      </div>
    </div>
    <div className="service-fit">
      <div className="eyebrow">{es ? 'ELIGE LO QUE TE AYUDA' : 'FIND YOUR FIT'}</div>
      <h2 className="editorial">{es ? '¿Es el sistema que necesitas?' : 'Is this the right booking system for you?'}</h2>
      <p><strong>{es ? 'Es para ti si: ' : 'This is for you if: '}</strong>{es ? 'Se te pierden consultas o seguimientos entre mensajes.' : 'You lose requests in messages or forget follow-ups.'}</p>
      <p><strong>{es ? 'No es lo que necesitas si: ' : 'This is not for you if: '}</strong>{es ? 'No necesitas recibir solicitudes de reserva por internet.' : 'You do not need an online way to collect booking requests.'}</p>
      <a className="service-fit-request-link" href={demo + '&source=booking-landing-fit'}>{es ? 'Pide tu demo personalizada' : 'Request your personalized demo'} <ArrowRight size={17}/></a>
      <a className="service-demo-link" href={demo}>{es ? 'Ver demo de reservas' : 'Try the Booking Demo'} <ArrowRight size={17}/></a>
    </div>
    <section className="service-buy-clarity" aria-label={es ? 'Preguntas frecuentes del servicio' : 'Service frequently asked questions'}>
      <div className="eyebrow">{es ? 'PREGUNTAS FRECUENTES' : 'FREQUENTLY ASKED QUESTIONS'}</div>
      <h2 className="editorial">{es ? 'Sobre Booking Automation + Admin Panel' : 'About Booking Automation + Admin Panel'}</h2>
      <PurchaseClarity lang={lang}/>
    </section>
    <div className="service-sales-close">
      <h2 className="editorial">{es ? 'Que tu próxima consulta no se pierda entre mensajes.' : 'Be ready when your next customer reaches out.'}</h2>
      <p>{es ? 'Comparte tus datos. Te enviamos los accesos cuando esté listo.' : 'Share your details. We’ll email your access when ready.'}</p>
      <div className="service-hero-actions">
        <MarketingCTA className="cta-button service-cta" href={primary}>{es ? 'Comprar mi sistema de reservas' : 'Get my booking system'} <ArrowRight/></MarketingCTA>
        <a className="service-demo-link" href={demo + '&source=booking-landing-close'}>{es ? 'Pedir demo personalizada' : 'Request a personalized demo'} <ArrowRight/></a>
      </div>
      <small>{es ? 'Tu confirmación de compra y los siguientes pasos llegan por correo. Revisa Promociones o Spam.' : 'Your purchase confirmation and next steps arrive by email. Check Promotions or Spam.'}</small>
    </div>
  </div>;
}
