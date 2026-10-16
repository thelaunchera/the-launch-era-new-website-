import { useEffect, useRef } from 'react';
import './home-motion-interlude.css';

type Lang = 'en' | 'es';
const copy = {
 en: [
  ['MORNING', 'A new request comes in.', 'Your Booking Page collects the details while you focus on your work.'],
  ['AFTERNOON', 'Everything has its place.', 'Review inquiries, requested times and quotes in your private Command Center.'],
  ['GOLDEN HOUR', 'No quote left floating.', 'Eligible unanswered quotes receive up to two automatic follow-ups.'],
  ['EVENING', 'A clearer end to your day.', 'Know what needs your attention next. You stay in control of each booking.'],
 ],
 es: [
  ['MAÑANA', 'Llega una nueva solicitud.', 'Tu Booking Page recoge los detalles mientras te concentras en el trabajo.'],
  ['TARDE', 'Todo tiene su lugar.', 'Revisa consultas, horarios y cotizaciones en tu Command Center privado.'],
  ['ATARDECER', 'Que ninguna cotización se pierda.', 'Las cotizaciones elegibles sin respuesta reciben hasta dos seguimientos automáticos.'],
  ['NOCHE', 'Termina el día con más claridad.', 'Sabes qué necesita tu atención. Tú tienes el control de cada reserva.'],
 ],
};
function StaticScene() {
 return <svg className="tle-time-fallback" viewBox="0 0 640 420" aria-hidden="true" focusable="false">
  <defs><linearGradient id="tle-time-grass" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c1d9ce"/><stop offset="1" stopColor="#8daead"/></linearGradient></defs>
  <circle className="tle-time-static-sun" cx="497" cy="72" r="28" fill="#f2d85b"/>
  <circle className="tle-time-static-moon" cx="497" cy="72" r="24" fill="#f1f8ff"/>
  <ellipse cx="320" cy="347" rx="216" ry="45" fill="#1c3549" opacity=".15"/>
  <path d="M104 294v36c0 43 432 43 432 0v-36" fill="#7b9cb6"/>
  <ellipse cx="320" cy="294" rx="216" ry="72" fill="url(#tle-time-grass)"/>
  <rect x="213" y="155" width="209" height="146" rx="9" fill="#f8fcff"/>
  <rect x="368" y="191" width="105" height="110" rx="7" fill="#dfebf5"/>
  <path d="M199 166 312 102l128 64v18H199z" fill="#a3c8e7"/>
  <path d="M357 192 419 146l63 46v15H357z" fill="#7eaed6"/>
  <rect x="292" y="238" width="46" height="63" rx="4" fill="#6b94b4"/>
  <rect x="235" y="208" width="40" height="41" rx="4" fill="#a9d1ea" stroke="white" strokeWidth="6"/>
  <rect className="tle-time-static-window" x="390" y="227" width="45" height="39" rx="4" fill="#a9d1ea" stroke="white" strokeWidth="6"/>
  <g fill="#83b29d"><rect x="155" y="245" width="11" height="51" rx="3" fill="#a58d75"/><circle cx="160" cy="237" r="30"/><rect x="496" y="248" width="10" height="49" rx="3" fill="#a58d75"/><circle cx="500" cy="242" r="27"/><rect x="467" y="272" width="9" height="31" rx="3" fill="#a58d75"/><circle cx="471" cy="267" r="20"/></g>
 </svg>;
}
export function HomeMotionInterlude({lang='en'}:{lang?:Lang}) {
 const root=useRef<HTMLElement>(null);
 const es=lang==='es';
 useEffect(()=>{
  const el=root.current;if(!el)return;
  let cancelled=false;let dispose:(()=>void)|undefined;
  const load=()=>{
   watcher.disconnect();
   import(/* @vite-ignore */ '/assets/tle-home-time-of-day.js?v=20261016-1')
    .then(mod=>{if(!cancelled&&typeof mod.mountTimeOfDay==='function')dispose=mod.mountTimeOfDay(el)})
    .catch(()=>{/* Static SVG remains visible if WebGL/CDN is blocked. */});
  };
  const watcher=new IntersectionObserver(([entry])=>{if(entry.isIntersecting)load()},{rootMargin:'700px'});
  watcher.observe(el);
  return()=>{cancelled=true;watcher.disconnect();dispose?.()};
 },[]);
 return <>
  <section ref={root} className="tle-day-night" data-tle-time-scene aria-label={es?'Una jornada del día a la noche':'A workday from morning to night'}>
   <div className="tle-time-sticky" aria-hidden="true">
    <div className="tle-time-heading"><span>{es?'UN SISTEMA PARA TODO EL DÍA':'ONE SYSTEM. ALL DAY LONG.'}</span><strong>{es?'De la primera consulta al último seguimiento.':'From the first request to the last follow-up.'}</strong></div>
    <div className="tle-time-art" data-tle-canvas><StaticScene/></div>
    <div className="tle-time-index"><span data-tle-count>01</span> / 04 <i/></div>
   </div>
   <div className="tle-time-chapters">
    {copy[lang].map(([label,title,body],i)=><article className="tle-time-chapter" data-tle-chapter={i} key={label}><div className="tle-time-card"><span className="tle-time-label"><b>0{i+1} / 04</b> {label}</span><h3>{title}</h3><p>{body}</p></div></article>)}
   </div>
  </section>
  <section className="tle-kinetic-band" aria-label={es?'Menos mensajes y más control':'Less chasing and more control'}>
   <h2 className="tle-visually-hidden">{es?'MENOS MENSAJES. MÁS CONTROL.':'LESS CHASING. MORE CONTROL.'}</h2>
   <div className="tle-kinetic-kicker">{es?'HECHO PARA EL NEGOCIO QUE ESTÁS CREANDO':'BUILT FOR THE BUSINESS YOU ARE GROWING'}</div>
   <div className="tle-marquee-row tle-marquee-solid" aria-hidden="true"><div className="tle-marquee-track">
    {[0,1].map(n=><div className="tle-marquee-set" key={n}><span>{es?'MENOS MENSAJES':'LESS CHASING'}</span><i>✦</i><span>{es?'MÁS CONTROL':'MORE CONTROL'}</span><i>✦</i></div>)}
   </div></div>
   <div className="tle-marquee-row tle-marquee-outline" aria-hidden="true"><div className="tle-marquee-track">
    {[0,1].map(n=><div className="tle-marquee-set" key={n}><span>{es?'MÁS RESERVAS':'MORE BOOKINGS'}</span><i>✦</i><span>{es?'MENOS CAOS':'LESS CHAOS'}</span><i>✦</i></div>)}
   </div></div>
  </section>
 </>;
}
