import { createFileRoute } from '@tanstack/react-router';
import { ArrowRight, CalendarCheck2, Workflow, Laptop, UserRound, MessageCircle } from 'lucide-react';

export const Route=createFileRoute('/es')({
  head:()=>({
    meta:[
      {title:'The Launch Era | Sistemas para Negocios de Limpieza'},
      {name:'description',content:'Booking, automatización, web app y apoyo administrativo para dueñas de negocios de limpieza en EE. UU. Menos seguimiento manual. Más organización.'},
      {property:'og:title',content:'The Launch Era | Sistemas para Negocios de Limpieza'},
      {property:'og:description',content:'Menos trabajo administrativo. Más espacio para manejar tu negocio de limpieza.'},
      {property:'og:type',content:'website'},
      {name:'twitter:card',content:'summary_large_image'}
    ],
    links:[
      {rel:'canonical',href:'https://thelaunchera.com/es'},
      {rel:'alternate',hrefLang:'en-US',href:'https://thelaunchera.com/'},
      {rel:'alternate',hrefLang:'es-US',href:'https://thelaunchera.com/es'},
      {rel:'alternate',hrefLang:'x-default',href:'https://thelaunchera.com/'}
    ]
  }),
  component:SpanishHome,
});

const services=[
  {title:'Booking + Lead Automation',href:'/es/booking-lead-automation/',icon:CalendarCheck2,copy:'Captura consultas, organiza leads y mantiene los seguimientos avanzando.'},
  {title:'Cleaning Web App',href:'/es/cleaning-web-app/',icon:Laptop,copy:'Reservas, clientes, cotizaciones, trabajos, facturas, equipo y rutas en un solo lugar.'},
  {title:'Website Automation',href:'/es/website-automation/',icon:Workflow,copy:'Conecta tu website actual con un flujo más claro de consultas y seguimiento.'},
  {title:'Virtual Assistant',href:'/es/virtual-assistant/',icon:UserRound,copy:'Apoyo práctico para mantener el trabajo administrativo organizado.'},
];

function SpanishHome(){
  return <main>
    <section className="hero-copy">
      <div className="eyebrow">MENOS SEGUIMIENTO MANUAL. MÁS ORGANIZACIÓN.</div>
      <h1>UN NEGOCIO DE LIMPIEZA MÁS FÁCIL DE MANEJAR.</h1>
      <p className="hero-accent editorial">Tus clientes están listos. Tu sistema también debería estarlo.</p>
      <p>Organiza reservas, leads, seguimientos y operaciones sin juntar cinco sistemas complicados.</p>
      <a className="cta-button" href="/es/booking-lead-automation/">Ver Booking + Lead Automation <ArrowRight/></a>
    </section>

    <section id="soluciones" className="solutions-section">
      <div className="container">
        <div className="section-heading">
          <div className="eyebrow">SOLUCIONES PARA NEGOCIOS DE LIMPIEZA</div>
          <h2 className="editorial">Empieza por lo que más tiempo te está quitando.</h2>
          <p>Reservas y seguimiento, operaciones del día a día, tu website o apoyo administrativo.</p>
        </div>
        <div className="service-grid">
          {services.map(({title,href,icon:Icon,copy},i)=><a className="service-card" href={href} key={title}>
            <div className="service-image"><div className="flex h-full min-h-48 items-center justify-center"><Icon size={52}/></div><span className="service-number">0{i+1}</span></div>
            <h3>{title}</h3><p>{copy}</p><div className="card-tag">VER SOLUCIÓN →</div>
          </a>)}
        </div>
      </div>
    </section>

    <section id="como-funciona" className="process-section">
      <div className="container">
        <div className="section-heading"><div className="eyebrow">SIMPLE PARA EMPEZAR</div><h2 className="editorial">Un mejor flujo, en tres pasos.</h2></div>
        <div className="process-grid">
          <div className="process-step"><div className="process-number">01</div><h3>Cuéntanos qué se está complicando.</h3><p>Vemos cómo estás trabajando ahora y qué te está quitando demasiado tiempo.</p></div>
          <div className="process-step"><div className="process-number">02</div><h3>Conectamos los puntos.</h3><p>Organizamos una solución alrededor de tu negocio y de la forma en que trabajas.</p></div>
          <div className="process-step"><div className="process-number">03</div><h3>Trabajas con más claridad.</h3><p>Menos cosas regadas, menos seguimiento manual y un próximo paso más claro.</p></div>
        </div>
      </div>
    </section>

    <section id="contacto" className="final-section">
      <div className="eyebrow">¿NO SABES POR DÓNDE EMPEZAR?</div>
      <h2 className="editorial">Cuéntanos qué está pasando en tu negocio.</h2>
      <p>Una conversación sencilla para encontrar el próximo paso que tenga más sentido para ti.</p>
      <a className="cta-button" href="/help"><MessageCircle/> Contactar The Launch Era <ArrowRight/></a>
    </section>
  </main>
}
