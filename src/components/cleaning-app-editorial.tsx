import { MarketingCTA } from '@/components/marketing-cta';
import { CleaningAppShowcase } from './cleaning-app-showcase';
import { FAQTopicTabs } from './faq-topic-tabs';
import { ArrowRight, CalendarDays, UsersRound, Receipt, Calculator, Clock3, MapPinned, Check, Sparkles } from 'lucide-react';

type Props = { lang?: 'en' | 'es' };

/**
 * Public marketing presentation only. All displayed names, job statuses,
 * amounts and dates are fictional examples. No production data requests.
 */
export function CleaningAppEditorial({ lang = 'en' }: Props) {
  const es = lang === 'es';
  const signup = 'https://app.thelaunchera.com/?entry=signup';
  const demo = '/cleaning-app-demo/?lang=' + lang;
  const jobs = [
    { initials:'SM', name:'Sarah Mitchell', service: es?'Limpieza recurrente':'Recurring cleaning', time:'9:30 AM', status: es?'Agendado':'Scheduled', kind:'blue' },
    { initials:'AB', name:'Amanda Brooks', service: es?'Limpieza profunda':'Deep cleaning', time:'1:00 PM', status: es?'Confirmado':'Confirmed', kind:'ivory' },
    { initials:'JR', name:'Jordan Rivera', service: es?'Limpieza de mudanza':'Move-out cleaning', time:'3:30 PM', status: es?'Por confirmar':'To confirm', kind:'pale' },
  ];
  const faqs: Array<[string, string]> = es ? [
    ['¿Necesito descargar la App desde una tienda?', 'No. Funciona en el navegador de tu teléfono, tablet o computadora. También puedes añadirla a la pantalla de inicio.'],
    ['¿Qué puedo organizar?', 'Clientes, reservas, cotizaciones, trabajos, facturas, tiempo del equipo, millaje y rutas. Puedes configurar tus precios para utilizar el Pricing Calculator.'],
    ['¿La Booking Page personalizada está incluida?', 'No. La Cleaning App organiza las operaciones de tu negocio. Booking Automation + Command Center se compra por separado e incluye una página de reservas personalizada.'],
    ['¿Cómo comienzo y cuánto cuesta?', 'Crea tu cuenta y comienza la prueba gratis de 30 días, sin tarjeta. Después cuesta $3.99 al mes. También puedes explorar la demo antes de registrarte.']
  ] : [
    ['Do I need an app store download?', 'No. The Cleaning App works in your phone, tablet, or computer browser. You can also add it to your home screen.'],
    ['What can I organize?', 'Clients, bookings, quotes, jobs, invoices, team time, mileage and routes. Configure your business pricing to use the Pricing Calculator.'],
    ['Does it include a personalized Booking Page?', 'No. The Cleaning App organizes your operations. Booking Automation + Command Center is a separate purchase and includes a personalized Booking Page.'],
    ['How do I start, and what does it cost?', 'Create your account to start a free 30-day trial, with no card required. The plan costs $3.99 per month afterward. You can explore the demo before signing up.']
  ];

  const features = [
    { icon:CalendarDays, title:es?'Calendario y trabajos':'Bookings & calendar', desc:es?'Ve trabajos y limpiezas recurrentes.':'See jobs and recurring visits.' },
    { icon:UsersRound, title:es?'Clientes y cotizaciones':'Clients & quotes', desc:es?'Historial, notas y estimados juntos.':'Customer history, notes, and estimates together.' },
    { icon:Receipt, title:es?'Facturas y precios':'Invoices & pricing', desc:es?'Crea estimados y registra pagos.':'Create estimates and track payments.' },
    { icon:Clock3, title:es?'Equipo y rutas':'Team & routes', desc:es?'Organiza el trabajo, las horas y el millaje.':'Stay on top of assignments, time and mileage.' }
  ];

  return <main className="tle-app-landing">
    <section className="tle-app-hero">
      <div className="tle-app-wrap">
        <div className="tle-app-topline"><span>THE LAUNCH ERA</span><span>{es?'CLEANING APP / PARA NEGOCIOS DE LIMPIEZA':'CLEANING APP / FOR CLEANING BUSINESSES'}</span></div>
        <div className="tle-app-hero-grid">
          <div className="tle-app-intro">
            <p className="tle-app-eyebrow">{es?'MENOS CAOS. MÁS CONTROL.':'LESS CHAOS. MORE CONTROL.'}</p>
            <h1>{es?'Tu negocio.':'Your business.'}<span>{es?' Todo en un lugar.':' All in one place.'}</span></h1>
            <p className="tle-app-lead">{es?'Clientes, trabajos y facturas organizados desde cualquier dispositivo.':'Bookings, clients, jobs, and invoices in one App.'}</p>
            <div className="tle-app-actions">
              <MarketingCTA className="tle-app-btn primary" href={signup}>{es?'Comenzar prueba gratis':'Start free trial'} <ArrowRight size={18} aria-hidden="true"/></MarketingCTA>
              <a className="tle-app-btn secondary" href={demo}>{es?'Ver demo':'Explore demo'} <ArrowRight size={18} aria-hidden="true"/></a>
            </div>
            <p className="tle-app-trial-note">{es?'30 días gratis · Sin tarjeta · Después $3.99/mes':'30 days free · No card required · Then $3.99/month'}</p>
          </div>
          <div className="tle-app-preview-holder">
            <div className="tle-app-product" aria-label={es?'Vista ilustrativa de una cuenta con datos inventados':'Illustrative workspace with fictional records'}>
              <div className="tle-app-product-header">
                <div className="tle-app-product-brand"><span className="tle-app-product-dot" aria-hidden="true"></span><strong>Cleaning App</strong></div>
                <span className="tle-app-product-label">{es?'EJEMPLO':'SAMPLE VIEW'}</span>
              </div>
              <div className="tle-app-product-content">
                <div className="tle-app-product-greeting"><div><small>{es?'TU DÍA':'YOUR DAY'}</small><h2>{es?'Buenos días 👋':'Good morning 👋'}</h2></div><div className="tle-app-product-date">{es?'Semana de ejemplo':'Sample week'}</div></div>
                <div className="tle-app-mini-stats"><div><strong>18</strong><span>{es?'Próximos trabajos':'Upcoming jobs'}</span></div><div><strong>7</strong><span>{es?'Cotizaciones':'Open quotes'}</span></div><div><strong>12</strong><span>{es?'Facturas':'Invoices'}</span></div></div>
                <div className="tle-app-jobs-head"><h3>{es?'Trabajos programados':'Scheduled jobs'}</h3><span>{es?'Hoy':'Today'}</span></div>
                <div className="tle-app-job-list">{jobs.map(job=><div className="tle-app-job" key={job.name}><span className={'tle-app-avatar '+job.kind}>{job.initials}</span><div className="tle-app-job-body"><strong>{job.name}</strong><span>{job.service} · {job.time}</span></div><span className="tle-app-job-status">{job.status}</span></div>)}</div>
                <div className="tle-app-product-bottom"><span><Check size={15} aria-hidden="true"/>{es?'Calendario y clientes conectados':'Calendar and client details together'}</span><ArrowRight size={17} aria-hidden="true"/></div>
              </div>
            </div>
            <div className="tle-app-preview-caption"><Sparkles size={15} aria-hidden="true"/> {es?'Datos ficticios de muestra · Nunca se muestran datos de clientes reales':'Fictional sample data · No real customer records shown'}</div>
          </div>
        </div>
      </div>
    </section>

    <CleaningAppShowcase lang={lang}/>

    <section className="tle-app-features-section">
      <div className="tle-app-wrap">
        <div className="tle-app-section-intro"><p className="tle-app-eyebrow">{es?'LO QUE NECESITAS':'THE ESSENTIALS'}</p><h2>{es?'Todo lo importante, sin complicarte.':'Everything that matters, without the mess.'}</h2></div>
        <div className="tle-app-feature-grid">{features.map(({icon:Icon,title,desc})=><article className="tle-app-feature" key={title}><span className="tle-app-feature-icon"><Icon size={24} strokeWidth={1.9} aria-hidden="true"/></span><div><h3>{title}</h3><p>{desc}</p></div></article>)}</div>
        <div className="tle-app-feature-foot"><span><Calculator size={18} aria-hidden="true"/> {es?'Calculadora de precios':'Pricing calculator'}</span><span><MapPinned size={18} aria-hidden="true"/> {es?'Rutas y millaje':'Routes & mileage'}</span><a href={demo}>{es?'Ver cómo funciona':'See it in action'} <ArrowRight size={17} aria-hidden="true"/></a></div>
      </div>
    </section>

    <section className="service-faq-section tle-app-faq-section" aria-label={es ? 'Preguntas frecuentes de Cleaning App' : 'Cleaning App frequently asked questions'}>
      <div className="container service-faq-container">
        <div className="service-faq-intro">
          <span className="eyebrow">{es ? 'ANTES DE COMENZAR' : 'BEFORE YOU GET STARTED'}</span>
          <h2 className="editorial">{es ? 'Preguntas sobre la Cleaning App' : 'Questions about the Cleaning App'}</h2>
          <p>{es ? 'Todo lo que necesitas saber antes de empezar.' : 'A few clear answers before you get started.'}</p>
        </div>
        <div className="service-faq-list">
          <FAQTopicTabs lang={lang} billing={[faqs[3]]} account={faqs.slice(0, 3)} />
        </div>
      </div>
    </section>

    <section className="tle-app-finish">
      <div className="tle-app-wrap tle-app-finish-inner">
        <div><p className="tle-app-eyebrow">{es?'COMIENZA CUANDO QUIERAS':'READY WHEN YOU ARE'}</p><h2>{es?'Empieza con una agenda más organizada.':'Make your next workday easier.'}</h2><p>{es?'Explora la demo o abre tu cuenta. Sin App Store.':'Explore the demo or create your account. No App Store needed.'}</p></div>
        <div className="tle-app-finish-action"><div className="tle-app-price"><span>{es?'PRUEBA GRATIS':'FREE TRIAL'}</span><strong>{es?'30 días':'30 days'}</strong><small>{es?'Después $3.99/mes · Sin tarjeta':'Then $3.99/month · No card required'}</small></div><MarketingCTA className="tle-app-btn primary" href={signup}>{es?'Crear mi cuenta':'Create my account'} <ArrowRight size={18} aria-hidden="true"/></MarketingCTA></div>
      </div>
    </section>
  </main>;
}
