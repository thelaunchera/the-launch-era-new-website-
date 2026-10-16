import { useEffect, useState } from 'react';

// Passive scroll work is coalesced into a single animation frame; no scroll locking.
export function HomeMotion() {
 useEffect(() => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  const hero = document.querySelector<HTMLElement>('.sales-home .hero-scroll');
  const heroIntro = hero?.querySelector<HTMLElement>('.hero-intro');
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.sales-home .service-card'));
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  const update = () => {
   frame = 0;
   if (hero) {
    // The split hero no longer has a long pinned scroll stage. Keep the CTA
    // keyboard-accessible and let the dedicated wipe observer own its motion.
    if (hero.querySelector('.hero-split')) {
     hero.style.removeProperty('--hero-scroll-progress');
     hero.classList.remove('hero-scroll-revealed');
     heroIntro?.removeAttribute('inert');
    } else if (media.matches) {
     hero.style.removeProperty('--hero-scroll-progress');
     hero.classList.remove('hero-scroll-revealed');
     heroIntro?.removeAttribute('inert');
    } else {
     const rect = hero.getBoundingClientRect();
     // The sticky stage runs for section height minus one viewport.
     const travel = Math.max(1, hero.offsetHeight - window.innerHeight);
     const progress = clamp(-rect.top / travel);
     hero.style.setProperty('--hero-scroll-progress', progress.toFixed(4));
     hero.classList.toggle('hero-scroll-revealed', progress >= 0.7);
     // Never leave an invisible CTA in the keyboard tab order.
     heroIntro?.toggleAttribute('inert', progress >= 0.5);
    }
   }
   cards.forEach(card => {
    if (media.matches) { card.classList.remove('service-in-view'); return; }
    const rect = card.getBoundingClientRect();
    card.classList.toggle('service-in-view', rect.top < innerHeight * .82 && rect.bottom > innerHeight * .18);
   });
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  media.addEventListener('change', schedule);
  schedule();
  return () => {
   cancelAnimationFrame(frame);
   window.removeEventListener('scroll', schedule);
   window.removeEventListener('resize', schedule);
   media.removeEventListener('change', schedule);
   hero?.style.removeProperty('--hero-scroll-progress');
   hero?.classList.remove('hero-scroll-revealed');
   heroIntro?.removeAttribute('inert');
   cards.forEach(card => card.classList.remove('service-in-view'));
  };
 }, []);
 return null;
}

export function BookingBenefits({lang='en'}:{lang?:'en'|'es'}) {
 const [active,setActive] = useState(0);
 const es = lang === 'es';
 const items = es ? [
  ['Recibe solicitudes','Tu Booking Page','Tus clientes ven tus servicios y horarios y envían los detalles de su limpieza.'],
  ['Organiza tu día','Tu Command Center','Ajusta precios, extras y horarios. Encuentra cada solicitud en tu espacio privado.'],
  ['Da el próximo paso','Tu seguimiento','Ve a quién necesitas responder y mantén la conversación en movimiento.']
 ] : [
  ['Collect requests','Your Booking Page','Customers see your services and availability, then send their cleaning details.'],
  ['Organize your day','Your Command Center','Update prices, add-ons, and hours. Find each incoming request in your private workspace.'],
  ['Keep in touch','Your next step','See who needs a reply and keep the conversation moving.']
 ];
 return <div className="booking-benefits"><p className="booking-benefits-hint">{es?'Toca para explorar tu flujo':'Tap to explore your booking flow'}</p><div className="booking-benefit-controls" role="group" aria-label={es?'Explora los beneficios':'Explore the benefits'}>{items.map(([label],i)=><button type="button" key={label} aria-pressed={active===i} aria-controls={`booking-benefit-${lang}`} onClick={()=>setActive(i)}><span aria-hidden="true">0{i+1}</span>{label}</button>)}</div><div id={`booking-benefit-${lang}`} className="booking-benefit-panel" aria-live="polite" aria-atomic="true"><strong>{items[active][1]}</strong><p>{items[active][2]}</p></div></div>;
}
