import { MarketingCTA } from '@/components/marketing-cta';
import { CleaningAppShowcase } from './cleaning-app-showcase';
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
  const features = [
    { icon:CalendarDays, title:es?'Calendario y trabajos':'Bookings & calendar', desc:es?'Ve trabajos próximos, recurrentes y detalles de cada limpieza.':'See upcoming jobs, recurring visits and every cleaning detail.' },
    { icon:UsersRound, title:es?'Clientes y cotizaciones':'Clients & quotes', desc:es?'Historial, notas y estimados sin buscar en mensajes.':'Keep customer history, notes and estimates together.' },
    { icon:Receipt, title:es?'Facturas y precios':'Invoices & pricing', desc:es?'Prepara estimados y registra facturas y pagos.':'Build estimates and track invoices and recorded payments.' },
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
            <p className="tle-app-lead">{es?'Clientes, reservas, trabajos, cotizaciones y facturas. Organízalo todo desde el teléfono o la computadora.':'Bookings, clients, jobs, quotes and invoices. All organized from your phone or computer.'}</p>
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

    <section className="tle-app-finish">
      <div className="tle-app-wrap tle-app-finish-inner">
        <div><p className="tle-app-eyebrow">{es?'COMIENZA CUANDO QUIERAS':'READY WHEN YOU ARE'}</p><h2>{es?'Empieza con una agenda más organizada.':'Make your next workday easier.'}</h2><p>{es?'Explora la demo o abre tu propio espacio. Sin instalar nada desde App Store.':'Try the demo first, or open your own workspace. No App Store download needed.'}</p></div>
        <div className="tle-app-finish-action"><div className="tle-app-price"><span>{es?'PRUEBA GRATIS':'FREE TRIAL'}</span><strong>{es?'30 días':'30 days'}</strong><small>{es?'Después $3.99/mes · Sin tarjeta':'Then $3.99/month · No card required'}</small></div><MarketingCTA className="tle-app-btn primary" href={signup}>{es?'Crear mi cuenta':'Create my account'} <ArrowRight size={18} aria-hidden="true"/></MarketingCTA></div>
      </div>
    </section>
  </main>;
}
