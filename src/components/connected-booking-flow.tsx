import { useEffect, useRef, useState } from 'react';
import { BellRing, CalendarCheck2, CalendarDays, ClipboardList, FileText, UsersRound } from 'lucide-react';
import './connected-booking-flow.css';

type Language = 'en' | 'es';

type HubNode = {heading:string;short:string;detail:string;};
const locations=[
 {x:20,y:27},{x:50,y:11},{x:80,y:27},
 {x:20,y:73},{x:50,y:89},{x:80,y:73}
] as const;
const messages: Record<Language,HubNode[]> = {
 en:[
  {heading:'Service requests',short:'From your Booking Page',detail:'Your Booking Page collects the service a customer needs so the request has a clear starting point.'},
  {heading:'Client details',short:'Contact info in one place',detail:'The customer shares a name, contact information and location for you to review.'},
  {heading:'Preferred dates',short:'Requested appointments',detail:'Customers can request a date and time; you decide what gets confirmed.'},
  {heading:'Quotes & estimates',short:'Owner-reviewed pricing',detail:'Review the cleaning details and edit or confirm the final quote under your control.'},
  {heading:'Follow-up',short:'Up to two reminders',detail:'Eligible inquiries can receive up to two automatic follow-ups while you stay in control.'},
  {heading:'Booked jobs',short:'Your next steps',detail:'Approved bookings and jobs are easier to find and manage from your private workspace.'}
 ],
 es:[
  {heading:'Solicitudes',short:'Desde tu Booking Page',detail:'Tu Booking Page reúne el servicio que necesita el cliente para comenzar la solicitud de forma clara.'},
  {heading:'Datos del cliente',short:'Contacto en un lugar',detail:'El cliente comparte su nombre, contacto y ubicación para que puedas revisar su solicitud.'},
  {heading:'Fechas preferidas',short:'Horarios solicitados',detail:'Tus clientes pueden pedir fecha y horario; tú decides qué reservas se confirman.'},
  {heading:'Cotizaciones',short:'Precios bajo tu control',detail:'Revisa los detalles de la limpieza y edita o confirma la cotización final.'},
  {heading:'Seguimiento',short:'Hasta dos recordatorios',detail:'Las consultas elegibles pueden recibir hasta dos seguimientos automáticos bajo tu control.'},
  {heading:'Trabajos reservados',short:'Tus próximos pasos',detail:'Encuentra y organiza las reservas y trabajos aprobados en tu espacio privado.'}
 ]
};
const icons=[ClipboardList,UsersRound,CalendarDays,FileText,BellRing,CalendarCheck2];

/** Illustrative first-party workflow; not a list of external integrations,
 * a live CRM, a payment transaction or real customer activity. */
export function ConnectedBookingFlow({lang='en'}:{lang?:Language}){
 const [active,setActive]=useState(0);
 const [inView,setInView]=useState(false);
 const root=useRef<HTMLDivElement>(null);
 const es=lang==='es';
 const nodes=messages[lang];
 useEffect(()=>{
  const el=root.current;
  if(!el)return;
  if(!('IntersectionObserver' in window)){setInView(true);return;}
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){
    setInView(true);
    observer.disconnect();
   }
  },{threshold:.12});
  observer.observe(el);
  return()=>observer.disconnect();
 },[]);
 return <div ref={root} className={'tle-connected-flow tle-connection-hub'+(inView?' is-visible':'')}>
  <div className="tle-connected-flow__intro">
   <span className="eyebrow">{es?'ASÍ SE CONECTA TU FLUJO':'YOUR FLOW, CONNECTED'}</span>
   <h3>{es?'Todo conectado. Nada perdido.':'Every request has its place.'}</h3>
   <p>{es?'Seis partes de tu sistema, conectadas a tu Command Center privado. Este es un recorrido ilustrativo.':'Six parts of your booking system connected to your private Command Center. An illustrative walkthrough.'}</p>
  </div>
  <div className="tle-connection-hub__stage" aria-label={es?'Diagrama de seis funciones conectadas al Command Center privado':'Six booking functions connected to the private Command Center'}>
   <svg className="tle-connection-hub__svg" viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true">
    {locations.map((p,i)=>{
      const x=p.x*1.6;
      const y=p.y;
      return <g key={i} className="tle-connection-hub__wire-group" style={{'--hub-index':i} as React.CSSProperties}>
       <path className="tle-connection-hub__path" pathLength="1" d={`M ${x} ${y} L 80 50`}/>
       <circle className="tle-connection-hub__travel-dot" cx={x} cy={y} r="1.2"
        style={{'--hub-move-x':(50-p.x)+'%','--hub-move-y':(50-p.y)+'%'} as React.CSSProperties}/>
      </g>;
    })}
   </svg>
   <div className="tle-connection-hub__core" aria-label={es?'Centro de tu sistema: Command Center privado':'Center of the system: Private Command Center'}>
    <span className="tle-connection-hub__core-icon"><ClipboardList size={25} aria-hidden="true"/></span>
    <span className="tle-connection-hub__core-brand">THE LAUNCH ERA</span>
    <strong>Command Center</strong>
    <small>{es?'Tu espacio privado':'Your private workspace'}</small>
    {locations.map((_,i)=><span key={i} className="tle-connection-hub__ring" aria-hidden="true" style={{'--hub-index':i} as React.CSSProperties}/>)}
   </div>
   {nodes.map((node,i)=>{
    const pos=locations[i];
    const Icon=icons[i];
    return <button key={node.heading} className="tle-connection-hub__tile" type="button"
     style={{'--hub-x':pos.x+'%','--hub-y':pos.y+'%','--hub-index':i} as React.CSSProperties}
     onClick={()=>setActive(i)} aria-pressed={i===active} aria-controls={'tle-flow-detail-'+lang}>
      <Icon aria-hidden="true" size={21}/>
      <strong>{node.heading}</strong>
      <small>{node.short}</small>
     </button>;
   })}
  </div>
  <div className="tle-connected-flow__detail" id={'tle-flow-detail-'+lang} role="status" aria-live="polite">
   <span>0{active+1} / 06</span>
   <div><strong>{nodes[active].heading}</strong><p>{nodes[active].detail}</p></div>
  </div>
  <p className="tle-connection-hub__disclaimer">{es?'Ilustración del funcionamiento · Tú confirmas los precios y las reservas.':'Illustrative workflow · You approve final prices and bookings.'}</p>
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
