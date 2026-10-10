import { useState, type ReactNode } from 'react';
import { ArrowRight, CalendarCheck2, ClipboardList, Send, Plus } from 'lucide-react';

type Language = 'en' | 'es';
const track = (part: string, value: string) => window.tleTrackEvent?.('homepage_interaction', { part, value });

export function BookingWalkthrough({lang='en'}:{lang?:Language}) {
 const [step,setStep]=useState(0);
 const es=lang==='es';
 const labels=es?['Solicitud','Organizada','Seguimiento']:['Request','Organized','Follow-up'];
 const titles=es?['Tu cliente elige un servicio.','La solicitud tiene su lugar.','Sabes qué sigue.']:['Your client chooses a service.','The request has a home.','You know what happens next.'];
 const copy=es?['Tu Booking Page reúne el servicio, los datos y el horario solicitado.','Los datos llegan a tu Command Center privado para revisarlos.','Los primeros dos seguimientos son automáticos. Tú decides el siguiente paso.']:['Your Booking Page collects the service, client details, and requested time.','Details reach your private Command Center, ready for review.','The first two follow-ups run automatically. You decide the next step.'];
 const icons=[CalendarCheck2,ClipboardList,Send];
 return <div className="booking-walkthrough"><div className="walkthrough-controls" aria-label={es?'Explora el recorrido de una solicitud':'Explore a booking request'}>{labels.map((label,i)=>{const Icon=icons[i];return <button type="button" key={label} aria-pressed={step===i} aria-controls={`walkthrough-${lang}`} onClick={()=>{setStep(i);track('booking_flow',String(i))}}><Icon size={19}/><span>{label}</span></button>})}</div><div id={`walkthrough-${lang}`} className="walkthrough-stage" aria-live="polite"><span className="walkthrough-count">0{step+1}</span><div><strong>{titles[step]}</strong><p>{copy[step]}</p></div><span className="walkthrough-status">{labels[step]}</span></div><small className="walkthrough-note">{es?'Toca cada paso para ver cómo se conecta.':'Tap each step to see how it connects.'}</small></div>;
}

export function PainCards({lang='en'}:{lang?:Language}) {
 const es=lang==='es';
 const pains=es?[
 ['“Envié la cotización. Después, silencio.”','Entre trabajos, se quedó pendiente volver a escribirle.','Los primeros dos seguimientos automáticos mantienen la consulta en movimiento.'],
 ['“Sé que me escribió… ¿pero dónde?”','Buscar entre DMs, textos y screenshots te quita tiempo para responder.','Tu Booking Page reúne las nuevas solicitudes en tu Command Center.'],
 ['“Terminé las limpiezas. Me falta lo administrativo.”','Todavía hay horarios, datos de clientes y pendientes por revisar.','La Cleaning App reúne trabajos, clientes, cotizaciones e invoices.']
 ]:[
 ['“I sent the quote. Then the conversation went quiet.”','Between cleaning jobs, checking back with that client slipped through.','The first two automatic follow-ups keep that inquiry moving.'],
 ['“I know they messaged. I just can’t find where.”','Searching DMs, texts, and screenshots takes time away from replying.','Your Booking Page brings new requests into your Command Center.'],
 ['“The cleaning is done. My admin isn’t.”','There are still schedules, client details, and loose ends to check.','The Cleaning App keeps jobs, clients, quotes, and invoices together.']
 ];
 return <div className="sales-pains">{pains.map(([title,pain,solution],i)=><details key={title} onToggle={e=>{if(e.currentTarget.open)track('pain',String(i))}}><summary><span>{title}</span><Plus size={19}/></summary><div className="pain-answer"><p>{pain}</p><strong>{es?'Así te ayuda TLE':'How TLE helps'}</strong><p>{solution}</p><a href={i===2?(es?'/es/cleaning-web-app/':'/cleaning-web-app/'):(es?'/es/booking-lead-automation/':'/booking-lead-automation/')}>{i===2?(es?'Ver la Cleaning App':'See the Cleaning App'):(es?'Conoce el sistema de reservas':'Explore the booking system')} <ArrowRight size={17}/></a></div></details>)}<p className="problem-bottom">{es?'Elige la situación que se parece a tu día.':'Choose the situation that sounds like your day.'}</p></div>;
}

export function ProductExplorer({lang='en',children}:{lang?:Language;children:ReactNode}) {
 const [view,setView]=useState(0);const es=lang==='es';
 const labels=es?['Booking Page','Command Center','Seguimientos']:['Booking Page','Command Center','Follow-ups'];
 return <div className="product-explorer"><div className="product-tabs" aria-label={es?'Explora lo que recibes':'Explore what you get'}>{labels.map((label,i)=><button type="button" key={label} aria-pressed={view===i} aria-controls={`product-view-${lang}`} onClick={()=>{setView(i);track('product_preview',label)}}>{label}</button>)}</div><div className="product-view" id={`product-view-${lang}`}>
 {view===0?<div className="followup-preview booking-demo-preview"><span className="eyebrow">{es?'DEMO PERSONALIZADA':'PERSONALIZED DEMO'}</span><h3 className="editorial">{es?'Una experiencia de reservas para tu negocio.':'A booking experience for your business.'}</h3><p>{es?'Explora una experiencia de reservas con el nombre y la zona de tu negocio, usando datos de ejemplo. No se crean reservas reales.':'Explore a booking experience with your business name and service area, using sample details. No real bookings are created.'}</p><small>{es?'Tu demo personalizada llega automáticamente a tu correo.':'Your personalized demo arrives automatically by email.'}</small></div>:view===1?<>{children}<small className="preview-disclaimer">{es?'Vista ilustrativa · Datos de ejemplo':'Illustrative overview · Example data'}</small></>:<div className="followup-preview"><span className="eyebrow">{es?'UN PRÓXIMO PASO PARA CADA CONSULTA':'A NEXT STEP FOR EACH INQUIRY'}</span><h3 className="editorial">{es?'Que la cotización no se quede esperando.':'Give that quote a next step.'}</h3><ol><li><span>01</span><div><strong>{es?'Primer seguimiento automático':'First automatic follow-up'}</strong><p>{es?'La consulta recibe su primer recordatorio.':'The inquiry receives its first reminder.'}</p></div></li><li><span>02</span><div><strong>{es?'Segundo seguimiento automático':'Second automatic follow-up'}</strong><p>{es?'El sistema vuelve a dar seguimiento.':'The system checks back again.'}</p></div></li><li><span>03</span><div><strong>{es?'Tú decides cómo continuar':'You choose how to continue'}</strong><p>{es?'Revisa el estado y responde desde tu Command Center.':'Review the status and respond from your Command Center.'}</p></div></li></ol><small>{es?'Ejemplo del recorrido de seguimiento.':'Example follow-up workflow.'}</small></div>}
 </div></div>;
}

export function PurchaseClarity({lang='en'}:{lang?:Language}) {
 const es=lang==='es';
 const questions=es?[
 ['¿Qué recibo con Booking Automation + Command Center?','Una Booking Page personalizada conectada a tu Command Center privado, con controles de servicios, precios, disponibilidad y los primeros dos seguimientos automáticos.'],
 ['¿Qué pasa después de comprar?','Completa tu intake y comparte todos los datos necesarios. La producción tarda 48 horas desde que iniciamos con todos los datos, dentro de nuestro horario laborable. Si compras o completas el intake el sábado después de las 12 PM ET, comenzamos el lunes o próximo día hábil. Enviamos el acceso por correo.'],
 ['¿Puedo cambiar los precios y horarios?','Sí. Los editas desde Pricing & Services y Availability en tu Command Center.'],
 ['¿Las reservas se confirman automáticamente?','Puedes activarlo para servicios con precio fijo. Las solicitudes que necesitan una cotización especial quedan para tu revisión.']
 ]:[
 ['What do I get with Booking Automation + Command Center?','A personalized Booking Page connected to your private Command Center, with service, price, and availability controls plus the first two automatic follow-ups.'],
 ['What happens after I buy?','Complete your intake and provide all required details. Your 48-hour production timeframe starts during business hours after we receive everything needed. Saturday purchases or completed intakes after 12 PM ET begin Monday or the next business day. Access links arrive by email.'],
 ['Can I change my prices and available times?','Yes. Update them in Pricing & Services and Availability inside your Command Center.'],
 ['Do bookings confirm automatically?','You can enable instant confirmation for fixed-price services. Requests that need a custom quote stay ready for your review.']
 ];
 return <div className="purchase-clarity"><p>{es?'Tu Booking Page + tu Command Center privado, personalizados para tu negocio.':'Your Booking Page + your private Command Center, personalized for your business.'}</p>{questions.map(([q,a])=><details key={q}><summary>{q}<Plus size={17}/></summary><p>{a}</p></details>)}</div>;
}
