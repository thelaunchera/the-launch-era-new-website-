import { ArrowUpRight, CalendarDays, UsersRound, FileText, Receipt, Clock3, MapPinned, Calculator } from 'lucide-react';

type Props={lang?:'en'|'es'};

export function CleaningAppShowcase({lang='en'}:Props){
 const es=lang==='es';
 const demo=(tab:number)=>`/cleaning-app-demo/?lang=${lang}&embedded=1&tab=${tab}`;
 const features=[
  {icon:<CalendarDays size={21}/>,label:es?'Reservas + Calendario':'Bookings + Calendar',body:es?'Trabajo recurrente, próximas visitas y detalles claros.':'Recurring work, upcoming visits and the details for each clean.'},
  {icon:<UsersRound size={21}/>,label:es?'Clientes + Trabajos':'Clients + Jobs',body:es?'Cada cliente, sus servicios y su historial en un lugar.':'Every client, their services and history, together.'},
  {icon:<FileText size={21}/>,label:es?'Cotizaciones':'Quotes',body:es?'De estimado pendiente a seguimiento.':'From open estimate to the next follow-up.'},
  {icon:<Receipt size={21}/>,label:es?'Facturas':'Invoices',body:es?'Lo enviado, pagado y pendiente, sin buscar mensajes.':'Sent, paid and outstanding, without digging through messages.'},
  {icon:<Calculator size={21}/>,label:es?'Calculadora de precios':'Pricing Calculator',body:es?'Prepara estimados con las reglas de tu negocio.':'Prepare estimates using your own pricing rules.'},
  {icon:<Clock3 size={21}/>,label:es?'Equipo + Tiempo':'Team + Time',body:es?'Horarios y tiempo de trabajo organizados.':'Keep assignments and time entries organized.'},
  {icon:<MapPinned size={21}/>,label:es?'Rutas':'Routes',body:es?'Organiza la próxima parada.':'Know which stop comes next.'}
 ];
 return <div className="tle-cleaning-case">
  <section className="tle-case-cover" aria-label={es?'Presentación de Cleaning App':'Cleaning App visual overview'}>
   <div className="tle-case-header"><span>THE LAUNCH ERA / PRODUCT STORY</span><span>{es?'UN ESPACIO PARA TU NEGOCIO':'BUILT FOR CLEANING BUSINESSES'}</span></div>
   <div className="tle-case-title"><span>CLEANING</span><span>APP<span className="tle-case-dot">.</span></span></div>
   <p className="tle-case-caption">{es?'De la próxima reserva a la última factura. Todo está conectado.':'From the next booking to the final invoice. Every detail stays connected.'}</p>
   <div className="tle-case-product">
    <div className="tle-case-desktop"><div className="tle-device-top"><span/><span/><span/><small>THE LAUNCH ERA / WORKSPACE PREVIEW</small></div><div className="tle-frame-wide"><iframe title={es?'Vista de ejemplo del dashboard':'Sample dashboard preview'} loading="lazy" src={demo(0)}/></div></div>
    <div className="tle-case-mobile"><div className="tle-phone-notch"/><iframe title={es?'Calendario de ejemplo':'Sample calendar preview'} loading="lazy" src={demo(1)}/><div className="tle-phone-home"/></div>
   </div>
   <div className="tle-case-meta"><span>{es?'VISTAS ILUSTRATIVAS CON DATOS FICTICIOS':'ILLUSTRATIVE VIEWS · FICTIONAL DATA'}</span><a href={`/cleaning-app-demo/?lang=${lang}`}>{es?'Explorar demo realista':'Explore the sample workspace'} <ArrowUpRight size={16}/></a></div>
  </section>
  <section className="tle-case-statement">
   <div><span className="tle-case-index">01 / {es?'TU DÍA EN ORDEN':'THE BIG PICTURE'}</span><h2>{es?'Todo lo que necesitas ver.':'The whole day, in one view.'}</h2></div>
   <p>{es?'Un calendario ocupado no tiene por qué significar un negocio desorganizado. Ten a la vista las visitas, tus clientes y lo que falta por hacer.':'A full calendar shouldn’t mean a messy business. See the work coming up, the clients behind it, and what still needs attention.'}</p>
  </section>
  <section className="tle-case-mosaic">
   <div className="tle-case-mosaic-large"><div className="tle-case-card-label"><span>02 / {es?'CALENDARIO':'CALENDAR'}</span><strong>{es?'Siempre sabes qué sigue.':'Know what comes next.'}</strong></div><div className="tle-case-frame"><iframe title={es?'Calendario semanal ficticio':'Fictional weekly cleaning schedule'} src={demo(1)} loading="lazy"/></div></div>
   <div className="tle-case-mosaic-small"><div className="tle-case-card-label"><span>03 / {es?'CLIENTES':'CLIENTS'}</span><strong>{es?'Los detalles, juntos.':'Keep the details together.'}</strong></div><div className="tle-case-frame"><iframe title={es?'Clientes de ejemplo':'Fictional clients list'} src={demo(3)} loading="lazy"/></div></div>
   <div className="tle-case-mosaic-small second"><div className="tle-case-card-label"><span>04 / {es?'FACTURAS':'INVOICES'}</span><strong>{es?'Menos pendientes perdidos.':'Fewer loose ends.'}</strong></div><div className="tle-case-frame"><iframe title={es?'Facturas ficticias':'Fictional invoice list'} src={demo(5)} loading="lazy"/></div></div>
  </section>

 </div>;
}
