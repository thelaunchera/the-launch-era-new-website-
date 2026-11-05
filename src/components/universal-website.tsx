import { useState } from 'react';
import { ArrowUpRight, Check, ChevronDown, Globe2, Mail, MessageCircle, Sparkles, UsersRound, Workflow } from 'lucide-react';
import './universal-website.css';

type Lang='en'|'es';
const copy={
 en:{
  eyebrow:'WEB DESIGN + BUSINESS AUTOMATION · ALL INDUSTRIES',
  headline:'A website that works for your business.',
  italic:'And with your business.',
  intro:'Launch a professional online presence, collect customer requests, and take the repetitive steps off your plate. Choose the level of support you need.',
  view:'Explore the two packages',hint:'For service businesses, boutiques, beauty, fitness, food, creatives, and more.',
  top:'THE LAUNCH ERA',how:'HOW IT WORKS',what:'WHAT YOU GET',packs:'THE TWO PACKAGES',contact:'Talk to us',
  visualTitle:'Your brand. Your website.',visualLine:'A clear way for customers to reach you.',visualButton:'Request a service',
  mail:'New request delivered',mail2:'To the email you choose',
  crm:'Automated CRM',crm2:'Lead captured · Next step organized',ai:'Website AI Assistant',ai2:'Ready to answer common questions',
  packageHead:'Two ways to get started.',packageSub:'One business, one professional website. Choose simple email automation or the connected AI + CRM experience.',
  basic:'Website for Your Business',basicSub:'Your own website, with inquiries sent to the inbox you select.',
  advanced:'Website + AI Assistant + Automated CRM',advancedSub:'Your website, a helpful on-page AI assistant, a lead workspace and follow-up automation — connected.',
  b1:'Responsive website tailored to your business',b2:'Contact, quote or booking-request path',b3:'New inquiries delivered to your preferred email',b4:'Mobile-first experience and clear customer actions',
  a1:'Everything in Website for Your Business',a2:'AI assistant for questions on your website',a3:'Automated CRM to organize leads and their status',a4:'Lead follow-up workflow with appropriate consent',
  buy1:'Choose Website · $15',buy2:'Choose Website + AI + CRM · $25',
  once:'one-time package price',note:'Domain, hosting and any ongoing third-party AI or platform fees are not included unless specifically agreed. We confirm scope and any required recurring costs before setup. Pricing covers one agreed initial configuration; complex or additional workflows require a separate written scope.',
  stepsTitle:'Your ideas. An easier way to run them.',s1:'Tell us about your business',s1d:'Share your brand, services, the action customers should take and the email that receives requests.',s2:'We design your experience',s2d:'We set up the agreed site and connect your package’s customer-request flow.',s3:'We review it together',s3d:'You check the customer experience before handoff. We explain how your system works.',
  questions:'A few things to know',
  q1:'Is this only for cleaning businesses?',r1:'No. We create websites and business automations for different industries. The features are adapted to the agreed scope of your business.',
  q2:'Will a booking request automatically confirm a time?',r2:'Not unless availability checking and confirmation are expressly part of the approved workflow. A request alone is not a confirmed appointment.',
  q3:'Does the $25 package include unlimited AI usage?',r3:'No. The package covers the agreed initial setup. If the AI or hosting provider requires recurring fees or usage limits, we explain those costs before you approve.',
  q4:'Can I add a different automation?',r4:'Yes. We can discuss other workflows, but complex or additional integrations are scoped separately, not silently included in either starter package.',
  footer:'Websites and automations for businesses ready to grow.',legal:'View service terms',built:'Powered by The Launch Era',
  sample:'Illustrative preview — not a live customer account'
 },
 es:{
  eyebrow:'DISEÑO WEB + AUTOMATIZACIONES · TODOS LOS NEGOCIOS',
  headline:'Una web que trabaja para tu negocio.',
  italic:'Y contigo.',
  intro:'Crea una presencia profesional, recibe solicitudes de clientes y reduce tareas repetitivas. Elige el sistema que realmente necesitas.',
  view:'Ver los dos paquetes',hint:'Para servicios, boutiques, belleza, fitness, comida, creativos y más.',
  top:'THE LAUNCH ERA',how:'CÓMO FUNCIONA',what:'QUÉ INCLUYE',packs:'LOS DOS PAQUETES',contact:'Contáctanos',
  visualTitle:'Tu marca. Tu website.',visualLine:'Una forma clara de recibir nuevos clientes.',visualButton:'Solicitar servicio',
  mail:'Nueva solicitud recibida',mail2:'En el correo que tú elijas',
  crm:'CRM automatizado',crm2:'Lead registrado · Siguiente paso organizado',ai:'Asistente de IA en tu web',ai2:'Listo para responder preguntas frecuentes',
  packageHead:'Dos formas de comenzar.',packageSub:'Un negocio, un website profesional. Elige avisos por correo o la experiencia conectada con IA y CRM.',
  basic:'Website para tu negocio',basicSub:'Tu propio website con solicitudes al correo que tú selecciones.',
  advanced:'Website + Asistente IA + CRM automatizado',advancedSub:'Tu web, asistente IA integrado, clientes potenciales organizados y seguimiento automatizado.',
  b1:'Website adaptable y personalizado para tu negocio',b2:'Formulario de contacto, cotización o solicitud de cita',b3:'Consultas al correo electrónico que tú elijas',b4:'Diseño móvil y pasos claros para tus clientes',
  a1:'Todo lo incluido en Website para tu negocio',a2:'Asistente de IA para preguntas dentro del website',a3:'CRM automatizado para organizar leads y estados',a4:'Seguimiento de leads con consentimiento adecuado',
  buy1:'Elegir Website · $15',buy2:'Elegir Website + IA + CRM · $25',
  once:'precio único del paquete',note:'Dominio, hosting y costos recurrentes de plataformas o IA de terceros no están incluidos salvo acuerdo expreso. Confirmamos el alcance y los costos necesarios antes de configurar. El precio cubre una configuración inicial acordada; flujos complejos o adicionales se cotizan por separado.',
  stepsTitle:'Tus ideas. Un negocio más organizado.',s1:'Cuéntanos de tu negocio',s1d:'Comparte tu marca, servicios, qué deben hacer tus clientes y el correo que recibirá solicitudes.',s2:'Diseñamos tu experiencia',s2d:'Preparamos el website y conectamos el flujo acordado según tu paquete.',s3:'Lo revisamos contigo',s3d:'Compruebas la experiencia antes de la entrega. Te explicamos cómo funciona.',
  questions:'Preguntas frecuentes',
  q1:'¿Solo para negocios de limpieza?',r1:'No. Creamos websites y automatizaciones para distintos negocios. Las funciones se adaptan al alcance acordado.',
  q2:'¿Una solicitud de cita confirma automáticamente el horario?',r2:'Solo cuando se haya incluido y probado la verificación de disponibilidad y confirmación. Una solicitud por sí sola no confirma una cita.',
  q3:'¿Los $25 incluyen uso ilimitado de IA?',r3:'No. El paquete cubre la configuración inicial acordada. Antes de aprobar informamos si la IA o el hosting requieren pagos recurrentes o tienen límites.',
  q4:'¿Puedo pedir otra automatización?',r4:'Sí, podemos conversar sobre otros flujos. Las integraciones complejas o adicionales se cotizan aparte, no se incluyen automáticamente en estos paquetes.',
  footer:'Websites y automatizaciones para negocios listos para crecer.',legal:'Ver términos del servicio',built:'Powered by The Launch Era',
  sample:'Vista ilustrativa — no es una cuenta real'
 }
};
export function UniversalWebsite({lang='en'}:{lang?:Lang}){
 const t=copy[lang], es=lang==='es';
 const checkout=(offer:'website-basic'|'website-ai-crm')=>'/service-checkout/?offer='+offer+'&lang='+lang;
 const faq:[string,string][]= [[t.q1,t.r1],[t.q2,t.r2],[t.q3,t.r3],[t.q4,t.r4]];
 return <main className="tle-universal" lang={lang}>
 <div className="universal-hero">
  <div className="container universal-hero-grid">
   <div className="universal-intro">
    <p className="universal-eyebrow">{t.eyebrow}</p>
    <h1>{t.headline}<em>{t.italic}</em></h1>
    <p className="universal-lead">{t.intro}</p>
    <div className="universal-actions"><a className="universal-btn universal-btn-dark" href="#packages">{t.view}<ArrowUpRight size={18}/></a><a className="universal-textlink" href={es?'/es#contacto':'/help'}>{t.contact}</a></div>
    <p className="universal-hint">{t.hint}</p>
   </div>
   <div className="universal-visual" aria-label={t.sample}>
    <div className="universal-site-card">
     <div className="universal-mock-nav"><span className="universal-mock-symbol">T.</span><span>YOUR BUSINESS</span><span className="universal-mock-lines"><i/><i/></span></div>
     <div className="universal-mock-photo"><div className="universal-mock-orbit"><span>01</span><span>02</span><span>03</span></div><div className="universal-mock-photo-copy"><strong>{t.visualTitle}</strong><span>{t.visualLine}</span><b>{t.visualButton}</b></div></div>
    </div>
    <div className="universal-floating-note universal-floating-email"><Mail size={20}/><div><strong>{t.mail}</strong><span>{t.mail2}</span></div><Check size={17}/></div>
    <div className="universal-floating-note universal-floating-crm"><Workflow size={19}/><div><strong>{t.crm}</strong><span>{t.crm2}</span></div></div>
    <div className="universal-floating-note universal-floating-ai"><Sparkles size={18}/><div><strong>{t.ai}</strong><span>{t.ai2}</span></div></div>
    <small className="universal-mock-caption">{t.sample}</small>
   </div>
  </div>
 </div>
 <section className="universal-packages" id="packages">
  <div className="container">
   <div className="universal-section-heading"><p className="universal-eyebrow">{t.packs}</p><h2>{t.packageHead}</h2><p>{t.packageSub}</p></div>
   <div className="universal-price-grid">
    <article className="universal-plan">
     <div className="universal-plan-top"><span>01 / WEBSITE</span><Globe2 size={25}/></div>
     <h3>{t.basic}</h3><p>{t.basicSub}</p><div className="universal-price"><strong>$15</strong><span>USD · {t.once}</span></div>
     <ul>{[t.b1,t.b2,t.b3,t.b4].map(x=><li key={x}><Check size={16}/>{x}</li>)}</ul>
     <a className="universal-btn universal-btn-outline" href={checkout('website-basic')}>{t.buy1}<ArrowUpRight size={18}/></a>
    </article>
    <article className="universal-plan universal-plan-feature">
     <div className="universal-plan-top"><span>02 / WEBSITE + AI + CRM</span><UsersRound size={25}/></div>
     <h3>{t.advanced}</h3><p>{t.advancedSub}</p><div className="universal-price"><strong>$25</strong><span>USD · {t.once}</span></div>
     <ul>{[t.a1,t.a2,t.a3,t.a4].map(x=><li key={x}><Check size={16}/>{x}</li>)}</ul>
     <a className="universal-btn universal-btn-dark" href={checkout('website-ai-crm')}>{t.buy2}<ArrowUpRight size={18}/></a>
    </article>
   </div>
   <p className="universal-scope-note">{t.note}</p>
  </div>
 </section>
 <section className="universal-process" id="how-it-works"><div className="container"><p className="universal-eyebrow">{t.how}</p><h2>{t.stepsTitle}</h2><div className="universal-steps">{[[t.s1,t.s1d],[t.s2,t.s2d],[t.s3,t.s3d]].map(([title,body],i)=><article key={title}><span>0{i+1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>
 <section className="universal-faq"><div className="container"><p className="universal-eyebrow">FAQ</p><h2>{t.questions}</h2><div>{faq.map(([q,a])=><details key={q}><summary>{q}<ChevronDown size={19}/></summary><p>{a}</p></details>)}</div></div></section>
 <section className="universal-bottom"><div className="container"><h2>{t.footer}</h2><a className="universal-btn universal-btn-dark" href="#packages">{t.view}<ArrowUpRight size={18}/></a><a className="universal-bottom-terms" href="/website-for-your-business/terms/">{t.legal}</a></div></section>
 </main>
}