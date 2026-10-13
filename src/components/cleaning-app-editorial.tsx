
import { ArrowRight, CalendarDays, UsersRound, Receipt, Calculator, Clock3, Route, CheckCircle2 } from 'lucide-react';

type Props={lang?:'en'|'es'};
export function CleaningAppEditorial({lang='en'}:Props){
 const es=lang==='es';
 const demo=(tab:number)=>'/cleaning-app-demo/?lang='+lang+'&embed=1&tab='+tab;
 const primary='/cleaning-app-demo/?lang='+lang;
 const features=[
  {icon:CalendarDays,title:es?'Un calendario que de verdad trabaja':'A calendar that actually works',detail:es?'Limpiezas únicas, recurrentes y trabajos próximos.':'One-time, recurring, and upcoming jobs.',tab:1},
  {icon:UsersRound,title:es?'Cada cliente en su lugar':'Every client in the right place',detail:es?'Historial, frecuencias y detalles del servicio.':'History, frequency, and service details.',tab:3},
  {icon:Receipt,title:es?'De la cotización a la factura':'From quote to invoice',detail:es?'Estimados, pendientes y pagos registrados.':'Estimates, follow-ups, and tracked invoices.',tab:5},
  {icon:Calculator,title:es?'Precios más fáciles de preparar':'Quotes without the guesswork',detail:es?'Usa tus propios precios, extras y frecuencias.':'Your rates, add-ons, and service frequency.',tab:6}
 ];
 return <div className="tle-cleaning-case">
 <link rel="stylesheet" href="/assets/tle-app-editorial.css"/>
 <section className="tle-case-hero" aria-label={es?'Presentación de Cleaning App':'Cleaning App presentation'}>
  <div className="tle-case-topline"><span>THE LAUNCH ERA</span><span>{es?'PRODUCTO · LIMPIEZA RESIDENCIAL':'PRODUCT · RESIDENTIAL CLEANING'}</span></div>
  <div className="tle-case-hero-text">
   <p className="tle-case-kicker">{es?'TU NEGOCIO, PERO ORGANIZADO.':'THE WORK BEHIND THE CLEAN.'}</p>
   <h2>CLEANING <span>APP.</span></h2>
   <p className="tle-case-lead">{es?'Menos pestañas. Menos notas perdidas. Más tiempo para llevar tu negocio.':'Less switching tabs. Fewer lost notes. More time to run your cleaning business.'}</p>
   <a className="tle-case-btn" href={primary}>{es?'Explorar demo interactiva':'Explore the interactive demo'} <ArrowRight size={18}/></a>
  </div>
  <div className="tle-case-stage">
   <div className="tle-case-monitor"><div className="tle-case-monitor-bar"><i/><i/><i/><span>Sample Cleaning App workspace</span></div><iframe src={demo(0)} loading="lazy" title={es?'Dashboard ficticio de Cleaning App':'Cleaning App fictional dashboard'} referrerPolicy="strict-origin-when-cross-origin"/></div>
   <div className="tle-case-phone tle-case-phone-hero"><div className="tle-case-notch"/><div className="tle-case-phone-screen"><iframe src={demo(1)} loading="lazy" title={es?'Calendario de muestra en móvil':'Sample mobile calendar'} referrerPolicy="strict-origin-when-cross-origin"/></div></div>
   <span className="tle-case-sticker">{es?'UNA VISTA REAL DE LA DEMO':'REAL DEMO VIEW'}<small>{es?'Registros ficticios':'Fictional records'}</small></span>
  </div>
  <p className="tle-case-fine">{es?'Vista pública interactiva con datos inventados. Nunca mostramos información de clientes reales.':'Public interactive preview with invented records. Real customer data is never shown.'}</p>
 </section>

 <section className="tle-case-editorial tle-case-story">
  <div><span className="tle-case-section-no">01 / {es?'EL PROBLEMA':'THE PROBLEM'}</span><h2>{es?'Tu negocio creció. Tus notas también.':'Your business grew. So did the chaos.'}</h2></div>
  <p>{es?'Direcciones en mensajes. Cotizaciones en notas. Trabajos en el calendario. Tu día no debería empezar buscando información.':'Addresses in messages. Quotes in notes. Jobs in a calendar. Your workday shouldn’t start with searching for information.'}</p>
 </section>

 <section className="tle-case-ui-gallery">
  <div className="tle-case-gallery-head"><span className="tle-case-section-no">02 / {es?'LA APP POR DENTRO':'INSIDE THE APP'}</span><h2>{es?'No imagines un negocio organizado. Míralo.':'Don’t imagine organized. See it.'}</h2><p>{es?'Estas vistas contienen 30 clientes ficticios, 20 trabajos y actividad de ejemplo para que puedas explorar una cuenta ocupada.':'These views include 30 fictional clients, 20 jobs, and sample activity so you can explore a busy workspace.'}</p></div>
  <div className="tle-case-gallery-grid">
   <article className="tle-case-gallery-card is-blue"><div className="tle-case-gallery-copy"><CalendarDays size={24}/><h3>{es?'Tu semana, a simple vista.':'Your whole week, at a glance.'}</h3><p>{es?'Trabajos recurrentes y próximos servicios.':'Recurring and upcoming jobs in one view.'}</p></div><div className="tle-case-mini-device"><iframe src={demo(1)} loading="lazy" title={es?'Agenda ficticia':'Fictional schedule'}/></div></article>
   <article className="tle-case-gallery-card is-ivory"><div className="tle-case-gallery-copy"><UsersRound size={24}/><h3>{es?'Clientes sin información perdida.':'Clients without the scattered details.'}</h3><p>{es?'Nombre, frecuencia, servicio e historial.':'Name, frequency, service, and history.'}</p></div><div className="tle-case-mini-device"><iframe src={demo(3)} loading="lazy" title={es?'Clientes ficticios':'Fictional clients'}/></div></article>
   <article className="tle-case-gallery-card is-black"><div className="tle-case-gallery-copy"><Receipt size={24}/><h3>{es?'Facturas que puedes encontrar.':'Invoices you can actually find.'}</h3><p>{es?'Pagado, enviado, pendiente y vencido.':'Paid, sent, pending, and overdue.'}</p></div><div className="tle-case-mini-device"><iframe src={demo(5)} loading="lazy" title={es?'Facturas ficticias':'Fictional invoices'}/></div></article>
  </div>
 </section>

 <section className="tle-case-flow">
  <span className="tle-case-section-no">03 / {es?'UN SISTEMA, NO MIL APLICACIONES':'ONE FLOW, NOT FIVE APPS'}</span>
  <h2>{es?'Desde “¿cuánto cuesta?” hasta “pagado”.':'From “How much?” to “Paid.”'}</h2>
  <div className="tle-case-steps">{(es?['Estimado','Cotización','Reserva','Trabajo','Factura']:['Estimate','Quote','Booking','Job','Invoice']).map((step,i)=><div key={step}><small>0{i+1}</small><strong>{step}</strong>{i<4&&<ArrowRight size={20}/>}</div>)}</div>
  <p>{es?'Tus clientes, trabajos y operaciones en un solo espacio.':'Clients, work, and day-to-day operations together.'}</p>
 </section>

 <section className="tle-case-features">
  <span className="tle-case-section-no">04 / {es?'FUNCIONES QUE IMPORTAN':'THE FEATURES THAT MATTER'}</span>
  <h2>{es?'Pensada para el trabajo de todos los días.':'Made for the everyday work.'}</h2>
  <div className="tle-case-feature-grid">{features.map(({icon:Icon,title,detail,tab})=><a href={primary+'&tab='+tab} key={title} className="tle-case-feature"><Icon size={23}/><h3>{title}</h3><p>{detail}</p><span>{es?'Ver en demo':'See in demo'} <ArrowRight size={15}/></span></a>)}</div>
  <div className="tle-case-feature-bottom"><span><Clock3 size={17}/> {es?'Horas y millaje':'Time & mileage'}</span><span><Route size={17}/> {es?'Rutas':'Routes'}</span><span><CheckCircle2 size={17}/> {es?'Reservas y seguimientos':'Bookings & follow-ups'}</span></div>
 </section>

 <section className="tle-case-cta">
  <span className="tle-case-section-no">{es?'LISTA PARA TU PRÓXIMO TRABAJO':'READY FOR YOUR NEXT JOB'}</span>
  <h2>{es?'Más organizada. Desde el próximo cliente.':'More organized. Starting with the next client.'}</h2>
  <p>{es?'Explora la demo sin registro o crea tu propio espacio de trabajo.':'Explore the interactive preview with no signup, or create your own workspace.'}</p>
  <div className="tle-case-actions"><a className="tle-case-btn" href={primary}>{es?'Ver demo interactiva':'See interactive demo'} <ArrowRight size={18}/></a><a className="tle-case-link" href="https://app.thelaunchera.com/?entry=signup">{es?'Comenzar prueba gratis':'Start free trial'} <ArrowRight size={17}/></a></div>
  <small>{es?'Demo con datos ficticios · Prueba de 30 días sin tarjeta · después $3.99/mes':'Fictional demo data · 30-day trial, no card · then $3.99/month'}</small>
 </section>
 </div>
}