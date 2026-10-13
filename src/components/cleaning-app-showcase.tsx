import { ArrowUpRight } from 'lucide-react';

type Props={lang?:'en'|'es'};

export function CleaningAppShowcase({lang='en'}:Props){
 const es=lang==='es';
 const demo=(tab:number)=>`/cleaning-app-demo/?lang=${lang}&embedded=1&tab=${tab}`;

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


 </div>;
}
