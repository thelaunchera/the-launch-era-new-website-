import { useEffect, useRef, useState, type ReactNode } from 'react';
import './booking-scrollytelling.css';
import { ArrowRight, CalendarCheck2, ClipboardList, Send, Plus } from 'lucide-react';

type Language = 'en' | 'es';
const track = (part: string, value: string) => window.tleTrackEvent?.('homepage_interaction', { part, value });

export function BookingWalkthrough({lang='en'}:{lang?:Language}) {
 const [step,setStep]=useState(0);
 const wrapRef=useRef<HTMLElement|null>(null);
 const stepNodes=useRef<Array<HTMLElement|null>>([]);
 const es=lang==='es';
 const labels=es?['Solicitud','Organizada','Seguimiento']:['Request','Organized','Follow-up'];
 const titles=es?['Tu cliente elige un servicio.','Todo llega a un mismo lugar.','Sabes qué sigue.']:['Your client chooses a service.','Everything arrives in one place.','You know what happens next.'];
 const copy=es?['Tu Booking Page reúne el servicio, los datos y el horario solicitado.','Los datos llegan a tu Command Center privado para revisarlos.','Los primeros dos seguimientos son automáticos. Tú decides el siguiente paso.']:['Your Booking Page collects the service, client details, and requested time.','Details reach your private Command Center, ready for review.','The first two follow-ups run automatically. You decide the next step.'];
 const icons=[CalendarCheck2,ClipboardList,Send];

 useEffect(()=>{
   const root=wrapRef.current;
   if(!root || !('IntersectionObserver' in window))return;
   // The narrow center band makes each step active only as its copy crosses the viewport center.
   const observer=new IntersectionObserver((entries)=>{
     const entered=entries.filter(entry=>entry.isIntersecting);
     if(!entered.length)return;
     const mid=window.innerHeight/2;
     const nearest=entered.sort((a,b)=>{
       const ac=(a.boundingClientRect.top+a.boundingClientRect.bottom)/2;
       const bc=(b.boundingClientRect.top+b.boundingClientRect.bottom)/2;
       return Math.abs(ac-mid)-Math.abs(bc-mid);
     })[0];
     const index=Number((nearest.target as HTMLElement).dataset.storyStep);
     if(Number.isInteger(index)&&index>=0&&index<3)setStep(index);
   },{root:null,rootMargin:'-45% 0px -45% 0px',threshold:0});
   stepNodes.current.forEach(node=>{if(node)observer.observe(node)});
   return ()=>observer.disconnect();
 },[lang]);

 const goTo=(index:number)=>{
   const node=stepNodes.current[index];
   if(!node)return;
   const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   setStep(index);
   node.scrollIntoView({behavior:reduce?'instant':'smooth',block:'start'});
   track('booking_flow',String(index));
 };

 return <section className="booking-walkthrough booking-scrolly-wrap" data-step={step} ref={wrapRef} aria-label={es?'Cómo pasa una solicitud a seguimiento':'How a booking request moves to follow-up'}>
  <div className="booking-scrolly-sticky">
   <span className="booking-scrolly-kicker">{es?'TU FLUJO DE RESERVAS':'YOUR BOOKING FLOW'}</span>
   <div className="walkthrough-controls" role="group" aria-label={es?'Explora el recorrido de una solicitud':'Explore a booking request'}>
    {labels.map((label,i)=>{const Icon=icons[i];return <button type="button" key={label} aria-pressed={step===i} aria-controls={`booking-story-${lang}-${i}`} onClick={()=>goTo(i)}><Icon size={19} aria-hidden="true"/><span>{label}</span></button>})}
   </div>
   <div className="booking-scrolly-scene" aria-hidden="true">
    <div className="booking-scrolly-ambient"/>
    <div className="booking-scrolly-shape"/>
    <div className="booking-scrolly-icon-ring">
      <span className="booking-scrolly-icon booking-scrolly-icon--request"><CalendarCheck2/></span>
      <span className="booking-scrolly-icon booking-scrolly-icon--organized"><ClipboardList/></span>
      <span className="booking-scrolly-icon booking-scrolly-icon--follow"><Send/></span>
    </div>
    <div className="booking-scrolly-route"><span/><span/><span/></div>
   </div>
   <small className="booking-scrolly-note">{es?'Desliza para ver cómo se conecta cada paso.':'Scroll to see how each step connects.'}</small>
  </div>
  <div className="booking-scrolly-steps">
    {titles.map((title,i)=><article
      key={title}
      id={`booking-story-${lang}-${i}`}
      className="booking-scrolly-step"
      data-story-step={i}
      ref={node=>{stepNodes.current[i]=node}}
      aria-labelledby={`booking-story-heading-${lang}-${i}`}
    ><div className="booking-scrolly-card">
       <span className="booking-scrolly-number">0{i+1} / 03 · {labels[i]}</span>
       <h2 id={`booking-story-heading-${lang}-${i}`}>{title}</h2>
       <p>{copy[i]}</p>
     </div></article>)}
  </div>
 </section>;
}

export function PainCards({lang='en'}:{lang?:Language}) {
 const es=lang==='es';
 const pains=es?[
 ['“Envié la cotización. Después, silencio.”','Entre trabajos, se quedó pendiente volver a escribirle.','Los primeros dos seguimientos automáticos mantienen la consulta en movimiento.'],
 ['“Sé que me pidieron una cotización… ¿dónde quedó el mensaje?”','Buscar entre mensajes, DMs y capturas te quita tiempo para responder.','Tu Booking Page reúne las nuevas solicitudes en tu Command Center.'],
 ['“Terminé las limpiezas. Me falta lo administrativo.”','Todavía hay horarios, datos de clientes y pendientes por revisar.','La Cleaning App reúne trabajos, clientes, cotizaciones e invoices.']
 ]:[
 ['“I sent the quote. Then the conversation went quiet.”','Between cleaning jobs, checking back with that client slipped through.','The first two automatic follow-ups keep that inquiry moving.'],
 ['“I know someone asked for a quote. Where did that message go?”','Checking texts, DMs, and screenshots takes time you could spend answering the customer.','Your Booking Page brings new requests into your Command Center.'],
 ['“The cleaning is done. My admin isn’t.”','There are still schedules, client details, and loose ends to check.','The Cleaning App keeps jobs, clients, quotes, and invoices together.']
 ];
 return <div className="sales-pains">{pains.map(([title,pain,solution],i)=><details key={title} onToggle={e=>{if(e.currentTarget.open)track('pain',String(i))}}><summary><span>{title}</span><Plus size={19}/></summary><div className="pain-answer"><p>{pain}</p><strong>{es?'Así te ayuda TLE':'How TLE helps'}</strong><p>{solution}</p><a href={i===2?(es?'/es/cleaning-web-app/':'/cleaning-web-app/'):(es?'/es/booking-lead-automation/':'/booking-lead-automation/')}>{i===2?(es?'Ver la Cleaning App':'See the Cleaning App'):(es?'Conoce el sistema de reservas':'Explore the booking system')} <ArrowRight size={17}/></a></div></details>)}<p className="problem-bottom">{es?'Elige la situación que se parece a tu día.':'Choose the situation that sounds like your day.'}</p></div>;
}

export function ProductExplorer({lang='en',children}:{lang?:Language;children:ReactNode}) {
 const [view,setView]=useState(0);const es=lang==='es';
 const labels=es?['Booking Page','Command Center','Seguimientos']:['Booking Page','Command Center','Follow-ups'];
 return <div className="product-explorer"><div className="product-tabs" aria-label={es?'Explora lo que recibes':'Explore what you get'}>{labels.map((label,i)=><button type="button" key={label} aria-pressed={view===i} aria-controls={`product-view-${lang}`} onClick={()=>{setView(i);track('product_preview',label)}}>{label}</button>)}</div><div className="product-view" id={`product-view-${lang}`}>
 {view===0?<div className="followup-preview booking-demo-preview"><span className="eyebrow">{es?'DEMO PERSONALIZADA':'PERSONALIZED DEMO'}</span><h3 className="editorial">{es?'Mira cómo podrían reservar tus clientes.':'See what booking could look like for your business.'}</h3><p>{es?'Explora una experiencia de reservas con el nombre y la zona de tu negocio, usando datos de ejemplo. No se crean reservas reales.':'Explore a booking experience with your business name and service area, using sample details. No real bookings are created.'}</p><small>{es?'Tu demo personalizada llega automáticamente a tu correo.':'Your personalized demo arrives automatically by email.'}</small></div>:view===1?<>{children}<small className="preview-disclaimer">{es?'Así podría verse tu espacio · Datos de ejemplo':'A look at how your workspace could look · Example details'}</small></>:<div className="followup-preview"><span className="eyebrow">{es?'UN PRÓXIMO PASO PARA CADA CONSULTA':'A NEXT STEP FOR EACH INQUIRY'}</span><h3 className="editorial">{es?'Que la cotización no se quede esperando.':'Give that quote a next step.'}</h3><ol><li><span>01</span><div><strong>{es?'Primer seguimiento automático':'First automatic follow-up'}</strong><p>{es?'La consulta recibe su primer recordatorio.':'The inquiry receives its first reminder.'}</p></div></li><li><span>02</span><div><strong>{es?'Segundo seguimiento automático':'Second automatic follow-up'}</strong><p>{es?'Si todavía no responde, enviamos un segundo seguimiento.':'If they still haven’t replied, we send a second follow-up.'}</p></div></li><li><span>03</span><div><strong>{es?'Tú decides cómo continuar':'You choose how to continue'}</strong><p>{es?'Revisa el estado y responde desde tu Command Center.':'Review the status and respond from your Command Center.'}</p></div></li></ol><small>{es?'Así funcionan los seguimientos.':'See how follow-ups work.'}</small></div>}
 </div></div>;
}

export function PurchaseClarity({lang='en'}:{lang?:Language}) {
 const es=lang==='es';
 const questions=es?[
 ['¿Qué incluye Booking Automation + Command Center?','Una Booking Page personalizada, tu Command Center privado y automatizaciones para gestionar solicitudes, cotizaciones y seguimientos.'],
 ['¿Cuándo recibo mi sistema?','Después de verificar el pago y revisar tus datos completos, aprobaremos el inicio por correo. Desde ese momento empieza el plazo estimado de 48 horas de producción, durante nuestros períodos de trabajo disponibles. Los accesos se entregan después de las pruebas y aprobación.'],
 ['¿Cuándo se confirma una reserva automáticamente?','Solo para servicios con precio fijo, cuando activas esa opción y el horario está disponible. Si la desactivas, la solicitud queda pendiente de tu aprobación y no bloquea el horario.'],
 ['¿Qué pasa con los precios estimados?','El cliente puede aceptar, rechazar o conversar sobre el precio. Ves su respuesta en el Command Center y en tu lista de consultas. Si acepta, la reserva se confirma únicamente al elegir un horario disponible.'],
 ['¿Hay una calculadora de precios?','Sí, exclusivamente para negocios de limpieza. Configuras tus propias tarifas, tamaño del espacio, extras, descuentos y cargos por ZIP en la sección de precios. Calcula un estimado, no un precio final confirmado.'],
 ['¿Qué precios debo dar en el formulario inicial?','Si tu negocio es de limpieza, comparte solo tus principales servicios con precio fijo y tus principales servicios con precio estimado. Después puedes añadir, quitar o modificar otros servicios y precios en tu Command Center.'],
 ['¿Puedo modificar precios y disponibilidad?','Sí. Edita servicios, precios fijos, estimados y extras desde la sección de precios, y tus horarios desde tu calendario. Puedes revisar y ajustar una cotización antes de enviarla.'],
 ['¿Quién se encarga de los correos de seguimiento?','Nosotros gestionamos hasta dos seguimientos automáticos para cotizaciones elegibles sin respuesta. Puedes ver sus vistas previas; si el cliente responde, se detienen. El tercer contacto es tu elección: enviar un último correo personal o detener el seguimiento.']
 ]:[
 ['What comes with Booking Automation + Command Center?','A personalized Booking Page, your private Command Center, and automation to manage requests, estimates, and follow-ups.'],
 ['When will I receive my system?','After we verify payment and review your complete setup, we approve the kickoff by email. The estimated 48-hour production period starts then, during our available working periods. We send access after testing and approval.'],
 ['When does a booking confirm automatically?','Only for flat-price services when you enable automatic confirmation and the time slot is available. With it off, the request waits for your approval and does not hold a slot.'],
 ['How do estimated prices work?','Customers can Accept, Decline, or Discuss Price. Their response appears in your Command Center where you track inquiries. If they accept, the booking confirms only after an available time is selected.'],
 ['Is there a price calculator?','Yes, exclusively for cleaning businesses. Set your own rates, property sizes, add-ons, frequency discounts, and ZIP travel fees in your pricing settings. Results are estimates, not automatically confirmed prices.'],
 ['What prices should I provide in your setup form?','For cleaning businesses, only your main flat-price services and main estimated-price services. Add, remove, or edit the rest of your services and prices later in your Command Center.'],
 ['Can I change prices and availability?','Yes. Edit flat rates, estimated starting prices, and extras in your pricing settings, and your schedule in your calendar settings. Preview and adjust a customer quote before sending.'],
 ['Who handles the follow-up emails?','We handle up to two automatic follow-ups for eligible unanswered quotes. You can preview the emails, and they stop when the customer responds. A third personal email is always your choice: send it or stop contacting.']
 ];
 return <div className="purchase-clarity"><p>{es?'Tu Booking Page + tu Command Center privado, personalizados para tu negocio.':'Your Booking Page + your private Command Center, personalized for your business.'}</p>{questions.map(([q,a])=><details key={q}><summary>{q}<Plus size={17}/></summary><p>{a}</p></details>)}</div>;
}
