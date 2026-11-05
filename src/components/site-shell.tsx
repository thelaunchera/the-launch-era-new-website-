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
 const home=es?'/es':'/';
 const landing=es?'/es/website-for-your-business/':'/website-for-your-business';
 const packages=landing+'#packages';
 const how=landing+'#how-it-works';
 const contact='/help';
 const switchHref=es?(path.startsWith('/es/website-for-your-business')?'/website-for-your-business':'/'):(path.startsWith('/website-for-your-business')?'/es/website-for-your-business/':'/es');
 return <><div className="announcement announcement-info tle-top-banner"><span className="tle-top-banner__copy">{es?'Websites y automatizaciones para cualquier negocio.':'Websites and automations for every kind of business.'}</span><a className="tle-top-banner__link" href={packages}>{es?'Ver dos paquetes':'See two packages'}</a></div><header className="site-header"><div className="nav-inner">
  <nav className="desktop-nav" aria-label={es?'Navegación principal':'Main navigation'}><a href={packages}>{es?'Paquetes':'Packages'}</a><a href={how}>{es?'Cómo funciona':'How it works'}</a></nav>
  <a href={home} className="wordmark" onClick={()=>setOpen(false)} aria-label="The Launch Era"><img className="tle-brand-logo" src="/assets/brand/tle-wordmark.svg" alt="The Launch Era" width="178" height="36"/></a>
  <nav className="desktop-nav nav-right" aria-label={es?'Más navegación':'More navigation'}><a href={contact}>{es?'Contacto':'Contact'}</a><a href={landing}>{es?'Website para tu negocio':'Website for your business'}</a></nav>
  <a href={switchHref} className="site-language-switch" lang={es?'en':'es'} hrefLang={es?'en':'es'} aria-label={es?'Switch website to English':'Cambiar el sitio a español'}><Globe2 size={17} aria-hidden="true"/><span>{es?'English':'Español'}</span></a>
  <Button variant="ghost" size="icon" className="mobile-menu-trigger" aria-label={open?(es?'Cerrar menú':'Close menu'):(es?'Abrir menú':'Open menu')} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</Button>
 </div>{open&&<nav className="mobile-nav" aria-label={es?'Menú móvil':'Mobile navigation'}><a href={packages} onClick={()=>setOpen(false)}>{es?'Paquetes':'Packages'}</a><a href={how} onClick={()=>setOpen(false)}>{es?'Cómo funciona':'How it works'}</a><a href={contact} onClick={()=>setOpen(false)}>{es?'Contacto':'Contact'}</a><a href={switchHref} onClick={()=>setOpen(false)}>{es?'English':'Español'}</a></nav>}</header></>;
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

 return <footer ref={footerRef} className={'site-footer tle-footer-theme'+(dark?' tle-footer-dark':'')+(ready?' tle-footer-ready':'')}><span className="tle-footer-dark-layer" aria-hidden="true"/><div className="container"><div className="footer-top"><div className="footer-brand"><a className="wordmark" href={es?'/es':'/'} aria-label="The Launch Era"><img className="tle-brand-logo" src="/assets/brand/tle-wordmark.svg" alt="The Launch Era" width="184" height="37" loading="lazy" /></a><p>{es?'Websites y automatizaciones a tu medida.':'Websites that work for your business.'}</p><div className="footer-contact" aria-label={es?'Contacto':'Contact'}><span className="footer-contact-label">{es?'¿TIENES UNA PREGUNTA?':'QUESTIONS? WE’RE HERE TO HELP.'}</span><a href={'/help'}>{es?'Abrir formulario de contacto':'Open contact form'}</a><p>{es?'Cuéntanos qué necesitas. Te responderemos por correo.':'Tell us what you need. We’ll reply by email.'}</p></div></div><nav className="footer-links" aria-label={es?'Navegación del pie de página':'Footer navigation'}><a href={es?'/es/website-for-your-business/':'/website-for-your-business'}>{es?'Soluciones':'Solutions'}</a><a href={es?'/es/website-for-your-business/#how-it-works':'/website-for-your-business/#how-it-works'}>{es?'Cómo funciona':'How It Works'}</a><a href={'/help'}>{es?'Contacto':'Contact'}</a><a href={es?'/es/privacy.html':'/privacy.html'}>{es?'Privacidad':'Privacy'}</a><a href={es?'/es/terms.html':'/terms.html'}>{es?'Términos':'Terms'}</a><a href={es?'/es/refunds.html':'/refunds.html'}>{es?'Reembolsos':'Refunds'}</a><a href={es?'/es/cookies.html':'/cookies.html'}>Cookies</a><a href={es?'/es/privacy-choices.html':'/privacy-choices.html'}>{es?'Tus datos':'Your data'}</a><button type="button" className="privacy-settings" data-privacy-settings>{es?'Ajustes de cookies':'Cookie settings'}</button></nav><section className="tle-newsletter" aria-label={es?'Boletín por correo':'Email newsletter'}>
  <h2 className="tle-newsletter-title">{es?'Ideas útiles para tu negocio.':'Good ideas for a smoother workday.'}</h2>
  <p className="tle-newsletter-copy">{es?'Consejos breves sobre websites, clientes y automatizaciones.':'Short tips about websites, customer inquiries and automations.'}</p>
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
</section></div><div className="footer-bottom"><span>© 2026 THE LAUNCH ERA. {es?'Todos los derechos reservados.':'All rights reserved.'}</span><span>{es?'Websites y automatizaciones para cualquier negocio.':'Websites and automations for businesses across industries.'}<small style={{display:"block",marginTop:6}}>Powered by <a href="https://thelaunchera.com/" style={{color:"inherit",textDecoration:"underline",textUnderlineOffset:3}}>The Launch Era</a></small></span><div className="tle-footer-theme-control"><span className="tle-footer-theme-label">{es?'Apariencia':'Appearance'}</span><button className="tle-footer-toggle" type="button" role="switch" aria-checked={dark} aria-label={es?'Alternar el modo claro u oscuro del pie de página':'Toggle light or dark footer theme'} onClick={toggleFooterTheme}><span className="tle-footer-toggle-track"><span className="tle-footer-toggle-thumb"><Sun className="tle-footer-icon-sun" size={13} aria-hidden="true"/><Moon className="tle-footer-icon-moon" size={13} aria-hidden="true"/></span></span></button></div></div></div></footer>
}