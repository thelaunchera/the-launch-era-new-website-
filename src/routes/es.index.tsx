import { ConnectedBookingFlow, HeroConnectionBackdrop } from '@/components/connected-booking-flow';
import { ServiceFlipCard } from '@/components/service-flip-card';
import { SuccessConfirmation } from '@/components/success-confirmation';
import { ProcessSteps } from '@/components/process-view-transitions';
import { MorphSubmit } from '@/components/morph-submit';
import { ContactSteps } from '@/components/contact-stepper';
import { WorkflowLogoMarquee } from '@/components/workflow-logo-marquee';
import { MarketingCTA } from '@/components/marketing-cta';
import { HomeMotion, BookingBenefits } from '@/components/home-motion';
import { BookingToneShift } from '@/components/booking-tone-shift';
import { HeroSplitWordLink } from '@/components/hero-split-word-link';
import { useHeroWipe } from '@/components/use-hero-wipe';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, Bell, CalendarCheck2, Check, CircleCheck, ClipboardList, MessageCircle, MessagesSquare, Send, Sparkles, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import cleaner from '@/assets/cleaner-home.jpg';
import { Wave } from '@/components/editorial-sections';
import webapp from '@/assets/webapp-phone.jpg';
import website from '@/assets/website-workspace.jpg';
import assistant from '@/assets/assistant-workspace.jpg';
const aiAgentsPhoto = 'https://images.unsplash.com/photo-1758626099012-2904337e9c60?auto=format&fit=crop&w=1000&q=85';
import { BookingWalkthrough, PainCards, ProductExplorer } from '@/components/home-sales';
import { MaskCursorHeadline } from '@/components/mask-cursor-headline';
import { HomeMotionInterlude } from '@/components/home-motion-interlude';
import { ServiceFAQ } from '@/components/service-faq';
import { SmartWelcomeBundle } from '@/components/smart-welcome-bundle';
import { WhatsAppOfferPrice } from '@/components/whatsapp-offer';
export const Route=createFileRoute('/es/')({head:()=>({meta:[{title:'THE LAUNCH ERA — Tu cliente está listo para reservar.'},{name:'description',content:'Sistemas más simples para dueñas y dueños de negocios de limpieza en EE. UU.'},{property:'og:title',content:'THE LAUNCH ERA — Tu cliente está listo para reservar.'},{property:'og:description',content:'Sistemas y automatización para negocios de limpieza.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}],links:[{rel:'preload',as:'image',href:cleaner},{rel:'canonical',href:'https://thelaunchera.com/es'},{rel:'alternate',hrefLang:'en-US',href:'https://thelaunchera.com/'},{rel:'alternate',hrefLang:'es-US',href:'https://thelaunchera.com/es'},{rel:'alternate',hrefLang:'x-default',href:'https://thelaunchera.com/'}]}),component:SpanishHome});
const services=[
 {title:'Booking Automation + Command Center',landing:'/es/booking-lead-automation/',description:'Booking Page personalizada y Command Center privado para precios, horarios y solicitudes.',image:cleaner,tag:'TU FLUJO DE RESERVAS, CONECTADO',points:["Booking Page con horarios disponibles","Command Center privado para revisar solicitudes","Seguimientos para consultas pendientes"]},
 {title:'AI Assistants',landing:'/es/ai-booking-assistant/',description:'Reservas, seguimientos o ambos. Para tu Booking Page o website.',image:aiAgentsPhoto,tag:'ASISTENTE DE RESERVAS + SEGUIMIENTO',points:["Asistente para preguntas de reservas","Seguimiento de consultas","Opciones para ambos asistentes"]},
 {title:'WhatsApp AI Agent',landing:'/es/whatsapp-ai-agent/',description:'Descubre cómo WhatsApp AI podría organizar consultas y estimados de tu negocio. Próximamente.',image:'https://images.unsplash.com/photo-1758611974917-f7f7a58b74b0?auto=format&fit=crop&w=1200&q=85',tag:'TUS CONVERSACIONES, ORGANIZADAS',points:["Consultas por WhatsApp","Cotizaciones bajo tu control","Próximamente"]},
 {title:'Cleaning Web App',landing:'/es/cleaning-web-app/',description:'Tu agenda, clientes y trabajo diario, más fácil de ver.',image:webapp,tag:'TU NEGOCIO, EN UN SOLO LUGAR',points:["Agenda y trabajos organizados","Clientes, cotizaciones y facturas","Equipo y operaciones"]},
 {title:'Website Automation',landing:'/es/website-automation/',description:'Conserva tu website y organiza mejor las consultas y seguimientos.',image:website,tag:'MENOS PASOS MANUALES',points:["Conecta tu website actual","Organiza las solicitudes que llegan","Ayuda con el seguimiento"]},
 {title:'Virtual Assistant',landing:'/es/virtual-assistant/',description:'Apoyo detrás de escena para que no todo dependa de ti.',image:assistant,tag:'MÁS APOYO. MENOS CARGA',points:["Apoyo administrativo cotidiano","Información de clientes organizada","Ayuda según tus necesidades"]}];
const notices=[
 ['PÁGINA DE RESERVAS','ahora','Nueva solicitud','Una persona quiere una cotización de limpieza.',CalendarCheck2],
 ['COMMAND CENTER','hace 12 min','Seguimiento enviado','Tu cliente recibió un recordatorio amable.',Send]
] as const;
const flow=[['NUEVO LEAD','Llega una solicitud de reserva.','Los detalles entran en un solo lugar.',CalendarCheck2],['ORGANIZADO','Se guarda en tu Command Center.','Cada consulta tiene su lugar. Sin buscar entre mensajes.',ClipboardList],['SEGUIMIENTO','El próximo paso sigue avanzando.','Un seguimiento claro mantiene la conversación viva.',Send]] as const;
function SpanishContact(){
 const [status,setStatus]=useState<'idle'|'sending'|'done'|'sent'|'error'>('idle'); const [name,setName]=useState('');
 const sendingRef=useRef(false);
 const [receipt,setReceipt]=useState({name:'',email:'',business:'',service:''});
 const [sendError,setSendError]=useState('');
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(sendingRef.current || status==='sending' || status==='sent') return;
  sendingRef.current=true;
  setSendError('');
  setStatus('sending');
  const fd=new FormData(e.currentTarget);
  try {
    const r=await fetch('https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-contact',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        name:String(fd.get('name')||''),
        email:String(fd.get('email')||''),
        business_name:String(fd.get('business')||''),
        help_needed:[String(fd.get('service')||'')],
        message:String(fd.get('message')||''),
        language:'es',source:'main_website_es',started_at:Date.now()-3000,website:''
      })
    });
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos enviar tu consulta. Inténtalo otra vez.');
    setReceipt({name:String(fd.get('name')||''),email:String(fd.get('email')||''),business:String(fd.get('business')||''),service:String(fd.get('service')||'')});
    setStatus('done');
    await new Promise<void>(resolve => window.setTimeout(resolve, 780));
    setStatus('sent');
  }catch(err){
    setSendError(err instanceof Error?err.message:'No pudimos enviar tu consulta. Inténtalo otra vez.');
    setStatus('error');
    sendingRef.current=false;
  }
 }

 return <div className="contact-form">{status==='sent'?<SuccessConfirmation
 language="es" kind="contact" compact
 name={receipt.name} email={receipt.email} business={receipt.business} service={receipt.service}
 onAgain={()=>{sendingRef.current=false;setSendError('');setStatus('idle');}}
 />:<><h2 className="editorial">Cuéntanos un poquito de tu negocio.</h2><p>No necesitas tener todo resuelto. Solo dinos qué se está sintiendo pesado ahora mismo.</p><ContactSteps
 language="es"
 status={status}
 onSubmit={submit}
 panels={[
  <><div className="form-grid"><label className="field">Tu nombre<input name="name" autoComplete="name" required value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre y apellido"/></label><label className="field">Correo electrónico<input name="email" type="email" autoComplete="email" required placeholder="Donde podamos contactarte"/></label></div></>,
  <><label className="field">Nombre del negocio<input name="business" autoComplete="organization" required placeholder="Tu negocio de limpieza"/></label><label className="field">¿Con qué te gustaría recibir ayuda?<select name="service">{services.map(s=><option key={s.title}>{s.title}</option>)}<option>No estoy segura todavía</option></select></label></>,
  <><label className="field">¿Qué te está quitando demasiado tiempo?<textarea name="message" required placeholder="Cuéntanos qué pasa en tu día a día…"/></label></>
 ]}
 error={status==='error'?<p className="text-sm" role="alert">{sendError||'No pudimos enviarlo. Inténtalo otra vez.'}</p>:null}
 finish={<MorphSubmit status={status} language="es">Finalizar y enviar <ArrowRight size={17}/></MorphSubmit>}
 disclaimer="Tu consulta llega directamente a The Launch Era. Usaremos estos datos solo para responderte."
 /></>}</div>
}
function SpanishHome(){const [active,setActive]=useState(0);const [heroLoaded,setHeroLoaded]=useState(false);const heroImageRef=useRef<HTMLImageElement>(null);const {heroRef,revealed}=useHeroWipe();useEffect(()=>{if(heroImageRef.current?.complete)setHeroLoaded(true)},[]);const [bookingSale,setBookingSale]=useState(()=>Date.now()<new Date('2026-11-01T04:00:00Z').getTime());useEffect(()=>{const sync=()=>setBookingSale(Date.now()<new Date('2026-11-01T04:00:00Z').getTime());const id=window.setInterval(sync,30000);return()=>window.clearInterval(id)},[]);return <main className="sales-home"><HomeMotion/>
<section className="hero-scroll" aria-label="Ejemplo de la experiencia de reservas de The Launch Era"><div className="hero-scroll-stage"><HeroConnectionBackdrop lang="es"/><div className="hero-scroll-reveal"><span>TU FLUJO DE RESERVAS</span><HeroSplitWordLink lang="es"/></div><div ref={heroRef} data-wipe-visible={revealed && heroLoaded} className={`hero-photo hero-scroll-frame hero-split ${heroLoaded?'hero-media-ready':'hero-media-loading'}`}>
 <div className="tle-hero-soft-mesh" aria-hidden="true"><span/><span/><span/><span/></div>
 <div className="hero-intro">
   <div className="eyebrow">PARA DUEÑAS DE NEGOCIOS DE LIMPIEZA</div>
   <h1>Menos tiempo buscando mensajes.<br/>Más tiempo para tu negocio.</h1>
   <p>Solicitudes, cotizaciones y seguimientos en un solo lugar. Sin buscar entre mensajes.</p>
   <div className="hero-cta-row"><Button variant="editorial" className="cta-button" asChild><a href="/booking-demo/?lang=es">Quiero mi demo personalizada <ArrowRight/></a></Button></div>
   <p className="demo-delivery-note">Tu demo llega automáticamente por correo.</p>
 </div>
 <div className="hero-split-visual">
 <img ref={heroImageRef} className="hero-main-image" src={cleaner} alt="Profesional de limpieza trabajando en una casa luminosa, con luz natural" width={1920} height={1024} loading="eager" fetchPriority="high" decoding="sync" onLoad={()=>setHeroLoaded(true)} onError={()=>setHeroLoaded(true)}/>
 <div className="hero-notice-flow" aria-label="Notificaciones de ejemplo; no muestran actividad real">
   {notices.map(([app,when,title,text,Icon],i)=><div className={`notification notice-${i+1}`} key={title}>
     <span className="notice-icon" aria-hidden="true"><Icon size={17}/></span>
     <div className="notice-body"><div className="notice-meta"><span>{app}</span><time>{when}</time></div><strong>{title}</strong><p>{text}</p></div>
   </div>)}
 </div></div>
</div></div></section>
<section id="hero-next" className="hero-copy"><BookingWalkthrough lang="es"/></section>
<SmartWelcomeBundle lang="es"/>
<section id="soluciones" className="solutions-section"><Wave/><div className="container"><div className="section-heading"><div className="eyebrow">MENOS COSAS REGADAS. MÁS CLARIDAD EN TU DÍA.</div><h2 className="editorial">Una consulta nueva<br/>no debería perderse entre mensajes.</h2><p>Ya tienes suficiente con las limpiezas. Te ayudamos a saber quién escribió, qué necesita y cuándo toca responder.</p></div><p className="service-rail-hint">Explora las soluciones</p><div className="service-grid" aria-label="Servicios para negocios de limpieza">{services.map((s,i)=><ServiceFlipCard key={s.title} lang="es" title={s.title} description={s.description} href={s.landing} points={s.points}><><div className="service-image"><img src={s.image} alt={s.title==='AI Assistants'?'Computadora con asistente digital de IA en un espacio moderno':s.title} loading="lazy" width={1024} height={1024} onError={s.title==='AI Assistants'?(e)=>{e.currentTarget.onerror=null;e.currentTarget.src=assistant;}:undefined}/><span className="service-number">0{i+1}</span><span className="service-arrow"><ArrowUpRight size={18} aria-hidden="true"/></span></div>{s.title==='Booking Automation + Command Center'?<div className="booking-offer-line">{bookingSale&&<span className="booking-offer-tag">The Fall Refresh Offer</span>}<span className="booking-offer-price service-price-pill">{bookingSale&&<del>$49.99</del>}<strong>{bookingSale?"$19.99":"$49.99"}</strong></span></div>:s.title==='AI Assistants'?<div className="service-card-price-line"><span className="service-price-pill service-ai-price"><strong>Desde $29 de instalación</strong></span></div>:s.title==='WhatsApp AI Agent'?<WhatsAppOfferPrice lang="es"/>:s.title==='Website Automation'||s.title==='Virtual Assistant'?<div className="booking-offer-line service-discount-offer"><span className="booking-offer-tag">30 % DE DESCUENTO</span><span className="booking-offer-price service-price-pill"><del>{s.title==='Website Automation'?"$59.99":"$49.99/mes"}</del><strong>{s.title==='Website Automation'?"$41.99":"$34.99/mes"}</strong></span></div>:<div className="service-card-price-line"><span className="service-price-pill"><strong>$3.99/mes</strong></span></div>}<h3>{s.title}</h3><p>{s.description}</p><div className="card-tag">{s.tag}</div></></ServiceFlipCard>)}</div></div></section>
<section className="problem-section"><div className="container problem-layout"><div><div className="eyebrow">EL TRABAJO QUE TE LLEVAS A CASA.</div><MaskCursorHeadline>¿Sigues con pendientes<br/><em>después de la última limpieza?</em></MaskCursorHeadline><p className="problem-intro">Una cotización sin respuesta. La dirección de un cliente entre mensajes. La agenda de mañana todavía pendiente.</p></div><PainCards lang="es"/></div></section>
<section className="booking-section"><BookingToneShift/><div className="container booking-layout"><div className="booking-copy"><div className="eyebrow">BOOKING AUTOMATION + COMMAND CENTER</div><h2 className="editorial">Reservas organizadas.<br/><em>Menos mensajes pendientes.</em></h2><p className="description">Tu Booking Page y tu Command Center, conectados.</p><BookingBenefits lang="es"/>{bookingSale&&<div className="booking-hero-offer"><span className="booking-offer-tag">The Fall Refresh Offer</span><span className="booking-offer-price"><del>$49.99</del><strong>$19.99</strong></span><span className="booking-offer-deadline">Hasta el 31 oct</span></div>}<p className="booking-production-note">La producción estimada de 48 horas comienza tras revisar tus datos y confirmar el inicio. Después del sábado a las 12 PM ET, comenzamos el siguiente día hábil.</p><div className="homepage-booking-actions"><MarketingCTA className="cta-button" href="/booking-bundle/?lang=es">Quiero mi sistema — {bookingSale?"$19.99":"$49.99"} <ArrowRight/></MarketingCTA></div></div><div className="home-booking-explorer tle-flow-explorer"><ConnectedBookingFlow lang="es"/></div></div></section>
<HomeMotionInterlude lang="es"/>
<section id="como-funciona" className="process-section"><div className="container"><div className="section-heading"><div className="eyebrow">EMPEZAR ES SIMPLE.</div><h2 className="editorial">Un flujo más claro, en tres pasos.</h2></div><ProcessSteps lang="es"/>
 <div id="contacto" className="homepage-demo-contact" aria-label="Contacta con The Launch Era">
  <div className="homepage-contact-panel"><SpanishContact/></div>
 </div>
 </div></section>
<section className="final-section"><div className="eyebrow">DALE UN LUGAR A TU PRÓXIMA CONSULTA.</div><h2 className="editorial">Que tu próximo cliente<br/><em>sea fácil de encontrar.</em></h2><p>Tu Booking Page personalizada y tu Command Center privado.</p><div className="final-actions"><MarketingCTA className="cta-button" href="/booking-bundle/?lang=es">Quiero mi sistema — {bookingSale?"$19.99":"$49.99"} <ArrowRight/></MarketingCTA></div></section>
<WorkflowLogoMarquee lang="es"/>
<ServiceFAQ topic="general" lang="es"/>
</main>}