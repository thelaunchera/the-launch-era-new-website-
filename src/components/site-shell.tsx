import { Link, useRouterState } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Menu, X, Moon, Sun, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
 const [open,setOpen]=useState(false);
 const path=useRouterState({select:(state)=>state.location.pathname});
 const es=path==='/es'||path.startsWith('/es/');
 const canonical=es?'/es/website-for-your-business/':'/website-for-your-business';
 const packages=canonical+'#paquetes';
 const how=canonical+'#proceso';
 const faq=canonical+'#preguntas';
 const alternate=es?'/website-for-your-business':'/es/website-for-your-business/';
 const isWebsite=path==='/'||path==='/es'||path==='/es/'||path.startsWith('/website-for-your-business')||path.startsWith('/es/website-for-your-business')||path==='/solutions';
 useEffect(()=>{document.documentElement.lang=es?'es':'en';setOpen(false);},[path,es]);
 if(isWebsite)return <header className="tle-website-top">
   <a href={es?'/es':'/'} className="tle-website-logo" aria-label="The Launch Era"><img src="/assets/brand/tle-wordmark.svg" alt="The Launch Era" width="166" height="35"/></a>
   <nav className="tle-website-nav" aria-label={es?'Navegación principal':'Main navigation'}>
    <a href={es?'/es':'/'}>{es?'Inicio':'Home'}</a>
    <a href={packages}>{es?'Paquetes':'Packages'}</a>
    <a href={how}>{es?'Cómo funciona':'How it works'}</a>
    <a href={faq}>FAQs</a>
   </nav>
   <a href={alternate} className="tle-website-language" lang={es?'en':'es'} hrefLang={es?'en':'es'}>{es?'English':'Español'} <Globe2 size={15}/></a>
 </header>;
 const link=es?'/es/website-for-your-business/':'/website-for-your-business';
 return <><header className="site-header"><div className="nav-inner">
  <nav className="desktop-nav" aria-label={es?'Navegación':'Navigation'}><a href={link}>{es?'Website para tu negocio':'Website for your business'}</a><a href="/help">{es?'Contacto':'Contact'}</a></nav>
  <a href={es?'/es':'/'} className="wordmark" aria-label="The Launch Era"><img className="tle-brand-logo" src="/assets/brand/tle-wordmark.svg" alt="The Launch Era" width="178" height="36"/></a>
  <nav className="desktop-nav nav-right"><a href={link+'#paquetes'}>{es?'Paquetes':'Packages'}</a></nav>
  <a href={alternate} className="site-language-switch" aria-label={es?'Switch to English':'Cambiar a español'}><Globe2 size={17}/><span>{es?'English':'Español'}</span></a>
  <Button variant="ghost" size="icon" className="mobile-menu-trigger" aria-label={open?'Close':'Menu'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</Button>
 </div>{open&&<nav className="mobile-nav"><a href={link} onClick={()=>setOpen(false)}>{es?'Website para tu negocio':'Website for your business'}</a><a href="/help" onClick={()=>setOpen(false)}>{es?'Contacto':'Contact'}</a><a href={alternate} onClick={()=>setOpen(false)}>{es?'English':'Español'}</a></nav>}</header></>;
}
export function SiteFooter() {
 const path=useRouterState({select:(state)=>state.location.pathname});
 const es=path==='/es'||path.startsWith('/es/');
 const isWebsite=path==='/'||path==='/es'||path==='/es/'||path.startsWith('/website-for-your-business')||path.startsWith('/es/website-for-your-business')||path==='/solutions';
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

 if(isWebsite)return null;
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