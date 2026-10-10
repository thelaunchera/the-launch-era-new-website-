import { Link, useRouterState } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Menu, X, ArrowUpRight, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

function SaleCountdown({es=false}:{es?:boolean}) {
 const offerEnd = Date.parse('2026-11-01T04:00:00Z');
 const getRemaining = () => Math.max(0, offerEnd - Date.now());
 const [remaining,setRemaining] = useState<number|null>(null);
 useEffect(() => {
  const update = () => setRemaining(getRemaining());
  update();
  const timer = window.setInterval(update, 1000);
  return () => window.clearInterval(timer);
 }, []);
 if (remaining === null) return <span className="sale-countdown sale-loading" aria-label={es?'Oferta Fall Refresh':'Fall Refresh Offer'}><span className="sale-clock-label"><Timer size={17} aria-hidden="true"/><span className="sale-offer-copy"><b>THE FALL REFRESH OFFER</b><small>{es?'HASTA EL 31 OCT':'ENDS OCT 31'}</small></span></span></span>;
 const days = Math.floor(remaining / 86400000);
 const hours = Math.floor((remaining % 86400000) / 3600000);
 const minutes = Math.floor((remaining % 3600000) / 60000);
 const seconds = Math.floor((remaining % 60000) / 1000);
 if (remaining <= 0) return <span className="sale-countdown sale-expired"><Timer size={16}/>{es?'THE FALL REFRESH OFFER FINALIZÓ':'THE FALL REFRESH OFFER ENDED'}</span>;
 return <span className="sale-countdown" role="timer" aria-label={es?`The Fall Refresh Offer termina el 31 de octubre. Quedan ${days} días, ${hours} horas, ${minutes} minutos y ${seconds} segundos`:`The Fall Refresh Offer ends October 31. ${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds remain`}>
  <span className="sale-clock-label"><Timer size={17} aria-hidden="true"/><span className="sale-offer-copy"><b>THE FALL REFRESH OFFER</b><small>{es?'HASTA EL 31 OCT':'ENDS OCT 31'}</small></span></span>
  <span className="sale-clock-units">
   <span className="sale-clock-unit"><strong>{String(days).padStart(2,'0')}</strong><small>{es?'DÍAS':'DAYS'}</small></span>
   <span className="sale-clock-colon">:</span>
   <span className="sale-clock-unit"><strong>{String(hours).padStart(2,'0')}</strong><small>HRS</small></span>
   <span className="sale-clock-colon">:</span>
   <span className="sale-clock-unit"><strong>{String(minutes).padStart(2,'0')}</strong><small>MIN</small></span>
   <span className="sale-clock-colon">:</span>
   <span className="sale-clock-unit"><strong>{String(seconds).padStart(2,'0')}</strong><small>SEC</small></span>
  </span>
 </span>;
}

export function SiteHeader() {
 const [open,setOpen] = useState(false);
 const path=useRouterState({select:(state)=>state.location.pathname});
 useEffect(()=>{document.documentElement.lang=(path==='/es'||path.startsWith('/es/'))?'es':'en';setOpen(false);},[path]);
 const es=path==='/es'||path.startsWith('/es/');
 const map=(en:string,sp:string)=>es?sp:en;
 const home=es?'/es':'/';
 const solutions=es?'/es#soluciones':'/solutions';
 const how=es?'/es#como-funciona':'/how-it-works';
 const booking=es?'/es/booking-lead-automation/':'/booking-lead-automation';
 const freebie=es?'/es/free-cleaning-lead-guide?utm_content=site_nav_es':'/free-cleaning-lead-guide?utm_content=site_nav';
 const help=es?'/es#contacto':'/help';
 const enToEs:Record<string,string>={
  '/':'/es',
  '/booking-lead-automation':'/es/booking-lead-automation/',
  '/cleaning-web-app':'/es/cleaning-web-app/',
  '/website-automation':'/es/website-automation/',
  '/virtual-assistant':'/es/virtual-assistant/',
  '/free-cleaning-lead-guide':'/es/free-cleaning-lead-guide',
  '/solutions':'/es#soluciones',
  '/how-it-works':'/es#como-funciona',
  '/help':'/es#contacto'
 };
 const esToEn:Record<string,string>={
  '/es':'/',
  '/es/booking-lead-automation':'/booking-lead-automation',
  '/es/booking-lead-automation/':'/booking-lead-automation',
  '/es/cleaning-web-app':'/cleaning-web-app',
  '/es/cleaning-web-app/':'/cleaning-web-app',
  '/es/website-automation':'/website-automation',
  '/es/website-automation/':'/website-automation',
  '/es/virtual-assistant':'/virtual-assistant',
  '/es/virtual-assistant/':'/virtual-assistant',
  '/es/free-cleaning-lead-guide':'/free-cleaning-lead-guide',
  '/es/free-cleaning-lead-guide/':'/free-cleaning-lead-guide'
 };
 const switchHref=es?(esToEn[path]||'/'):(enToEs[path]||'/es');
 const offerPage=path==='/'||path==='/es'||path==='/es/'||path==='/booking-lead-automation'||path==='/booking-lead-automation/'||path==='/es/booking-lead-automation'||path==='/es/booking-lead-automation/';
 return <><div className={offerPage?'announcement announcement-offer':'announcement announcement-info'}><span>{es?'Creado para dueñas de negocios de limpieza en EE. UU. · También hablamos inglés':'Built for cleaning business owners in the U.S. · Spanish support available'}</span>{offerPage&&<SaleCountdown es={es}/>}</div><header className="site-header"><div className="nav-inner"><nav className="desktop-nav" aria-label={map('Main navigation','Navegación principal')}><a href={solutions}>{map('Solutions','Soluciones')}</a><a href={how}>{map('How It Works','Cómo funciona')}</a></nav><a href={home} className="wordmark" onClick={()=>setOpen(false)}>THE LAUNCH ERA</a><nav className="desktop-nav nav-right" aria-label={map('More navigation','Más navegación')}><a href={freebie}>{map('Free Lead Tracker','Lead Tracker Gratis')}</a><a href={booking}>Booking Automation + Command Center</a><a href={help}>{map('Help','Ayuda')} <ArrowUpRight size={11} className="inline" /></a><a href={switchHref}>{es?'EN':'ES'}</a></nav><Button variant="ghost" size="icon" className="mobile-menu-trigger" aria-label={open?map('Close navigation','Cerrar navegación'):map('Open navigation','Abrir navegación')} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</Button></div>{open&&<nav className="mobile-nav" aria-label={map('Mobile navigation','Navegación móvil')}><a href={solutions} onClick={()=>setOpen(false)}>{map('Solutions','Soluciones')}</a><a href={how} onClick={()=>setOpen(false)}>{map('How It Works','Cómo funciona')}</a><a href={freebie} onClick={()=>setOpen(false)}>{map('Free Lead Tracker','Lead Tracker Gratis')}</a><a href={booking} onClick={()=>setOpen(false)}>Booking Automation + Command Center</a><a href={help} onClick={()=>setOpen(false)}>{map('Help & Get in Touch','Ayuda y contacto')} <ArrowUpRight size={14} className="inline"/></a><a href={switchHref} onClick={()=>setOpen(false)}>{es?'English':'Español'}</a></nav>}</header></>;
}
export function SiteFooter() {
 const path=useRouterState({select:(state)=>state.location.pathname});
 const es=path==='/es'||path.startsWith('/es/');
 return <footer className="site-footer"><div className="container"><div className="footer-top"><div><a className="wordmark" href={es?'/es':'/'}>THE LAUNCH ERA</a><p>{es?'Menos trabajo administrativo. Más espacio para crecer.':'A little less admin. A lot more possibility.'}</p></div><nav className="footer-links" aria-label={es?'Navegación del pie de página':'Footer navigation'}><a href={es?'/es#soluciones':'/solutions'}>{es?'Soluciones':'Solutions'}</a><a href={es?'/es#como-funciona':'/how-it-works'}>{es?'Cómo funciona':'How It Works'}</a><a href={es?'/es#contacto':'/help'}>{es?'Contacto ↗':'Get in Touch ↗'}</a></nav></div><div className="footer-bottom"><span>© 2026 THE LAUNCH ERA. {es?'Todos los derechos reservados.':'All rights reserved.'}</span><span>{es?'Creado para negocios de limpieza en EE. UU.':'Thoughtfully built for U.S. cleaning businesses.'}</span></div></div></footer>
}