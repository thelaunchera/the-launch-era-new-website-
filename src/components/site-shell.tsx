import { Link, useRouterState } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Menu, X, Moon, Sun, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  '/ai-booking-assistant':'/es/ai-booking-assistant/',
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
  '/es/ai-booking-assistant':'/ai-booking-assistant/',
  '/es/ai-booking-assistant/':'/ai-booking-assistant/',
  '/es/booking-lead-automation/':'/booking-lead-automation',
  '/es/website-automation':'/website-automation',
  '/es/website-automation/':'/website-automation',
  '/es/virtual-assistant':'/virtual-assistant',
  '/es/virtual-assistant/':'/virtual-assistant',
  '/es/free-cleaning-lead-guide':'/free-cleaning-lead-guide',
  '/es/free-cleaning-lead-guide/':'/free-cleaning-lead-guide'
 };
 const switchHref=es?(esToEn[path]||'/'):(enToEs[path]||'/es');
 const offerPage=path==='/'||path==='/es'||path==='/es/'||path==='/booking-lead-automation'||path==='/booking-lead-automation/'||path==='/es/booking-lead-automation'||path==='/es/booking-lead-automation/';
 return <><div className={offerPage?'announcement announcement-offer tle-top-banner':'announcement announcement-info tle-top-banner'}><span className="tle-top-banner__copy">{es?'Reservas y seguimientos organizados, incluso mientras trabajas.':'Your bookings and follow-ups, organized while you work.'}</span><a className="tle-top-banner__link" href={es?'/experience-cleaning/?lang=es&source=top-banner':'/experience-cleaning/?lang=en&source=top-banner'}>{es?'Ver el demo':'See the demo'}</a></div><header className="site-header"><div className="nav-inner"><nav className="desktop-nav" aria-label={map('Main navigation','Navegación principal')}><a href={solutions}>{map('Solutions','Soluciones')}</a><a href={how}>{map('How It Works','Cómo funciona')}</a></nav><a href={home} className="wordmark" onClick={()=>setOpen(false)} aria-label="The Launch Era"><img className="tle-brand-logo" src="/assets/brand/tle-wordmark.svg" alt="The Launch Era" width="178" height="36" /></a><nav className="desktop-nav nav-right" aria-label={map('More navigation','Más navegación')}><a href={freebie}>{map('Free Lead Tracker','Lead Tracker Gratis')}</a><a href={booking}>Booking Automation + Command Center</a><a href={es?"/es/ai-booking-assistant/":"/ai-booking-assistant/"}>{map("AI Assistants","Asistentes IA")}</a><a href={help}>{map('Support','Ayuda')}</a></nav><a href={switchHref} className="site-language-switch" lang={es?'en':'es'} hrefLang={es?'en':'es'} aria-label={es?'Switch website to English':'Cambiar el sitio a español'}><Globe2 size={17} aria-hidden="true"/><span>{es?'English':'Español'}</span></a><Button variant="ghost" size="icon" className="mobile-menu-trigger" aria-label={open?map('Close navigation','Cerrar navegación'):map('Open navigation','Abrir navegación')} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</Button></div>{open&&<nav className="mobile-nav" aria-label={map('Mobile navigation','Navegación móvil')}><a href={solutions} onClick={()=>setOpen(false)}>{map('Solutions','Soluciones')}</a><a href={how} onClick={()=>setOpen(false)}>{map('How It Works','Cómo funciona')}</a><a href={freebie} onClick={()=>setOpen(false)}>{map('Free Lead Tracker','Lead Tracker Gratis')}</a><a href={booking} onClick={()=>setOpen(false)}>Booking Automation + Command Center</a><a href={es?"/es/ai-booking-assistant/":"/ai-booking-assistant/"} onClick={()=>setOpen(false)}>{map("AI Assistants","Asistentes IA")}</a><a href={help} onClick={()=>setOpen(false)}>{map('Support','Ayuda')}</a><a href={switchHref} onClick={()=>setOpen(false)}>{es?'English':'Español'}</a></nav>}</header></>;
}
export function SiteFooter() {
 const path=useRouterState({select:(state)=>state.location.pathname});
 const es=path==='/es'||path.startsWith('/es/');
 const footerRef=useRef<HTMLElement|null>(null);
 const [dark,setDark]=useState(false);
 const [ready,setReady]=useState(false);
 useEffect(()=>{
  let stored:string|null=null;
  try{stored=window.localStorage.getItem('tle_footer_theme_v1')}catch{}
  const prefersDark=window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  setDark(stored==='dark'||(stored!=='light'&&prefersDark));
  const frame=window.requestAnimationFrame(()=>setReady(true));
  return ()=>window.cancelAnimationFrame(frame);
 },[]);
 function toggleFooterTheme(){
  const footer=footerRef.current;
  if(!footer)return;
  const control=footer.querySelector<HTMLElement>('.tle-footer-toggle');
  if(control){
   const button=control.getBoundingClientRect(), bounds=footer.getBoundingClientRect();
   footer.style.setProperty('--tle-footer-reveal-x', String(button.left+button.width/2-bounds.left)+'px');
   footer.style.setProperty('--tle-footer-reveal-y', String(button.top+button.height/2-bounds.top)+'px');
   document.documentElement.style.setProperty('--tle-footer-reveal-x', String(button.left+button.width/2-bounds.left)+'px');
   document.documentElement.style.setProperty('--tle-footer-reveal-y', String(button.top+button.height/2-bounds.top)+'px');
  }
  const next=!dark;
  try{window.localStorage.setItem('tle_footer_theme_v1',next?'dark':'light')}catch{}
  const doc=document as Document & {startViewTransition?:(update:()=>void)=>{finished:Promise<void>}};
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  if(!reduced&&doc.startViewTransition){
   document.documentElement.dataset.tleFooterDirection=next?'open':'close';
   try{
    const transition=doc.startViewTransition(()=>flushSync(()=>setDark(next)));
    void transition.finished.finally(()=>delete document.documentElement.dataset.tleFooterDirection).catch(()=>{});
   }catch{
    delete document.documentElement.dataset.tleFooterDirection;
    setDark(next);
   }
  }else setDark(next);
 }

 return <footer ref={footerRef} className={'site-footer tle-footer-theme'+(dark?' tle-footer-dark':'')+(ready?' tle-footer-ready':'')}><span className="tle-footer-dark-layer" aria-hidden="true"/><div className="container"><div className="footer-top"><div className="footer-brand"><a className="wordmark" href={es?'/es':'/'} aria-label="The Launch Era"><img className="tle-brand-logo" src="/assets/brand/tle-wordmark.svg" alt="The Launch Era" width="184" height="37" loading="lazy" /></a><p>{es?'Tu negocio merece una experiencia digital que se note.':'Digital experiences designed for real businesses.'}</p><div className="footer-contact" aria-label={es?'Contacto':'Contact'}><span className="footer-contact-label">{es?'¿TIENES UNA PREGUNTA?':'QUESTIONS? WE’RE HERE TO HELP.'}</span><a href={es?'/es#contacto':'/help'}>{es?'Abrir formulario de contacto':'Open contact form'}</a><p>{es?'Cuéntanos qué necesitas. Te responderemos por correo.':'Tell us what you need. We’ll reply by email.'}</p></div></div><nav className="footer-links" aria-label={es?'Navegación del pie de página':'Footer navigation'}><a href={es?'/es#soluciones':'/solutions'}>{es?'Soluciones':'Solutions'}</a><a href={es?'/es#como-funciona':'/how-it-works'}>{es?'Cómo funciona':'How It Works'}</a><a href={es?'/es#contacto':'/help'}>{es?'Contacto':'Contact'}</a><a href={es?'/es/privacy.html':'/privacy.html'}>{es?'Privacidad':'Privacy'}</a><a href={es?'/es/terms.html':'/terms.html'}>{es?'Términos':'Terms'}</a><a href={es?'/es/refunds.html':'/refunds.html'}>{es?'Reembolsos':'Refunds'}</a><a href={es?'/es/cookies.html':'/cookies.html'}>Cookies</a><a href={es?'/es/privacy-choices.html':'/privacy-choices.html'}>{es?'Tus datos':'Your data'}</a><button type="button" className="privacy-settings" data-privacy-settings>{es?'Ajustes de cookies':'Cookie settings'}</button></nav><section className="tle-newsletter" aria-label={es?'Boletín por correo':'Email newsletter'}>
  <h2 className="tle-newsletter-title">{es?'Ideas para crear algo que se note.':'Ideas worth putting to work.'}</h2>
  <p className="tle-newsletter-copy">{es?'Recursos, diseño y herramientas para convertir tus ideas en proyectos reales.':'Practical notes on websites, visual design and tools for your next big idea.'}</p>
  <form className="tle-newsletter-form" data-tle-newsletter data-language={es?'es':'en'} noValidate>
    <div className="tle-newsletter-row">
      <label className="sr-only" htmlFor="tle-newsletter-email">{es?'Correo electrónico':'Email address'}</label>
      <input id="tle-newsletter-email" className="tle-newsletter-input" data-newsletter-email type="email" name="email" autoComplete="email" inputMode="email" maxLength={254} required placeholder={es?'Tu correo electrónico':'Your email address'} aria-describedby="tle-newsletter-error"/>
      <button className="tle-newsletter-submit" type="submit"><span data-newsletter-button-label>{es?'Suscribirme':'Subscribe'}</span></button>
      <div className="tle-newsletter-confirm" data-newsletter-confirmation aria-live="polite" aria-atomic="true" aria-hidden="true" role="status">
        <svg className="tle-newsletter-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5L19 7"/></svg>
        <span data-newsletter-confirmation-label></span>
      </div>
    </div>
    <div className="tle-newsletter-honeypot" aria-hidden="true"><label>Company website<input name="company_web" data-newsletter-website type="text" tabIndex={-1} autoComplete="off"/></label></div>
    <p className="tle-newsletter-error" id="tle-newsletter-error" data-newsletter-error aria-live="polite"></p>
  </form>
  <p className="tle-newsletter-consent">{es?<>Al suscribirte aceptas recibir correos ocasionales. Puedes darte de baja cuando quieras. <a href="/es/privacy.html">Privacidad</a>.</>:<>By subscribing, you agree to occasional emails. Unsubscribe anytime. <a href="/privacy.html">Privacy</a>.</>}</p>
</section></div><div className="footer-bottom"><span>© 2026 THE LAUNCH ERA. {es?'Todos los derechos reservados.':'All rights reserved.'}</span><span>{es?'Websites, reservas y soluciones digitales para negocios.':'Websites, booking experiences and digital tools for businesses.'}<small style={{display:"block",marginTop:6}}>Powered by <a href="https://thelaunchera.com/" style={{color:"inherit",textDecoration:"underline",textUnderlineOffset:3}}>The Launch Era</a></small></span><div className="tle-footer-theme-control"><span className="tle-footer-theme-label">{es?'Apariencia':'Appearance'}</span><button className="tle-footer-toggle" type="button" role="switch" aria-checked={dark} aria-label={es?'Alternar el modo claro u oscuro del pie de página':'Toggle light or dark footer theme'} onClick={toggleFooterTheme}><span className="tle-footer-toggle-track"><span className="tle-footer-toggle-thumb"><Sun className="tle-footer-icon-sun" size={13} aria-hidden="true"/><Moon className="tle-footer-icon-moon" size={13} aria-hidden="true"/></span></span></button></div></div></div></footer>
}