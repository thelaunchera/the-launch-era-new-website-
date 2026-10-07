import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function SaleCountdown({es=false}:{es?:boolean}) {
 const saleEndsAt = new Date('2026-10-11T11:01:04Z').getTime();
 const [remaining,setRemaining] = useState(() => Math.max(0, saleEndsAt - Date.now()));
 useEffect(() => {
   const tick = () => setRemaining(Math.max(0, saleEndsAt - Date.now()));
   tick();
   const timer = window.setInterval(tick, 1000);
   return () => window.clearInterval(timer);
 }, []);
 const days = Math.floor(remaining / 86400000);
 const hours = Math.floor((remaining % 86400000) / 3600000);
 const minutes = Math.floor((remaining % 3600000) / 60000);
 const seconds = Math.floor((remaining % 60000) / 1000);
 if (remaining <= 0) return <span className="sale-countdown">{es?'OFERTA TERMINADA':'LIMITED-TIME OFFER ENDED'}</span>;
 return <span className="sale-countdown" aria-label={`Discount ends in ${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`}>
   <span className="sale-label">DISCOUNT ENDS IN</span>
   <strong>{days}<small>D</small></strong><span>:</span>
   <strong>{String(hours).padStart(2,'0')}<small>H</small></strong><span>:</span>
   <strong>{String(minutes).padStart(2,'0')}<small>M</small></strong><span>:</span>
   <strong>{String(seconds).padStart(2,'0')}<small>S</small></strong>
 </span>;
}

export function SiteHeader() {
 const [open,setOpen] = useState(false);
 const [path,setPath] = useState('');
 useEffect(()=>setPath(window.location.pathname),[]);
 const es=path==='/es'||path.startsWith('/es/');
 const map=(en:string,sp:string)=>es?sp:en;
 const home=es?'/es':'/';
 const solutions=es?'/es#soluciones':'/solutions';
 const how=es?'/es#como-funciona':'/how-it-works';
 const booking=es?'/es/booking-lead-automation/':'/booking-lead-automation';
 const help=es?'/es/help/':'/help';
 const switchHref=es?'/':('/es'+(path==='/'?'':path)+'/').replace(/\/+/g,'/');
 return <><div className="announcement"><span>{es?'Creado para dueñas de negocios de limpieza residencial en EE. UU. · También hablamos inglés':'Built for residential cleaning business owners in the U.S. · Se habla español'}</span><SaleCountdown es={es}/></div><header className="site-header"><div className="nav-inner"><nav className="desktop-nav" aria-label={map('Main navigation','Navegación principal')}><a href={solutions}>{map('Solutions','Soluciones')}</a><a href={how}>{map('How It Works','Cómo funciona')}</a></nav><a href={home} className="wordmark" onClick={()=>setOpen(false)}>THE LAUNCH ERA</a><nav className="desktop-nav nav-right" aria-label={map('More navigation','Más navegación')}><a href={booking}>Booking + Lead Automation</a><a href={help}>{map('Help','Ayuda')} <ArrowUpRight size={11} className="inline" /></a><a href={switchHref}>{es?'EN':'ES'}</a></nav><Button variant="ghost" size="icon" className="mobile-menu-trigger" aria-label={open?map('Close navigation','Cerrar navegación'):map('Open navigation','Abrir navegación')} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</Button></div>{open&&<nav className="mobile-nav" aria-label={map('Mobile navigation','Navegación móvil')}><a href={solutions} onClick={()=>setOpen(false)}>{map('Solutions','Soluciones')}</a><a href={how} onClick={()=>setOpen(false)}>{map('How It Works','Cómo funciona')}</a><a href={booking} onClick={()=>setOpen(false)}>Booking + Lead Automation</a><a href={help} onClick={()=>setOpen(false)}>{map('Help & Get in Touch','Ayuda y contacto')} <ArrowUpRight size={14} className="inline"/></a><a href={switchHref} onClick={()=>setOpen(false)}>{es?'English':'Español'}</a></nav>}</header></>;
}
export function SiteFooter() { return <footer className="site-footer"><div className="container"><div className="footer-top"><div><Link className="wordmark" to="/">THE LAUNCH ERA</Link><p>A little less admin. A lot more possibility.</p></div><nav className="footer-links" aria-label="Footer navigation"><Link to="/solutions">Solutions</Link><Link to="/how-it-works">How It Works</Link><Link to="/help">Get in Touch ↗</Link></nav></div><div className="footer-bottom"><span>© 2026 THE LAUNCH ERA. All rights reserved.</span><span>Thoughtfully built for U.S. residential cleaning businesses.</span></div></div></footer> }