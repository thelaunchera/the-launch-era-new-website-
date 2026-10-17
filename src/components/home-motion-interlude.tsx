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
  <rect x="213" y="155" width="209" height="146" rx="9" fill="#e5f1fa"/>
  <rect x="368" y="191" width="105" height="110" rx="7" fill="#cfe4f2"/>
  <path d="M199 166 312 102l128 64v18H199z" fill="#7aadd2"/>
  <path d="M357 192 419 146l63 46v15H357z" fill="#5e96c2"/>
  <rect x="292" y="238" width="46" height="63" rx="4" fill="#4f81a5"/>
  <rect x="235" y="208" width="40" height="41" rx="4" fill="#80bfdf" stroke="#f8fcff" strokeWidth="6"/>
  <rect className="tle-time-static-window" x="390" y="227" width="45" height="39" rx="4" fill="#80bfdf" stroke="#f8fcff" strokeWidth="6"/>
  <path d="M255 306h117l18 14H237z" fill="#b7cdda"/><path d="M286 317h54v8h-54z" fill="#91b4ca"/><g fill="#77a995"><rect x="155" y="245" width="11" height="51" rx="3" fill="#a58d75"/><circle cx="160" cy="237" r="30"/><rect x="496" y="248" width="10" height="49" rx="3" fill="#a58d75"/><circle cx="500" cy="242" r="27"/><rect x="467" y="272" width="9" height="31" rx="3" fill="#a58d75"/><circle cx="471" cy="267" r="20"/></g>
 </svg>;
}
export function HomeMotionInterlude({lang='en'}:{lang?:Lang}) {
 const root=useRef<HTMLElement>(null);
 const es=lang==='es';
 useEffect(()=>{
  const el=root.current;if(!el)return;
  let cancelled=false;let dispose:(()=>void)|undefined;
  let fallbackFrame=0;let fallbackActive=true;
  // Text-only contrast adjustment tracks the existing daylight-to-nightfall sky.
  // Neither the scene, background, nor its animation is modified.
  const heading=el.querySelector<HTMLElement>('.tle-time-heading');
  const syncHeadingContrast=()=>{
   const top=el.style.background.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
   if(!heading||!top)return;
   const linear=[Number(top[1]),Number(top[2]),Number(top[3])].map(v=>{
    const c=v/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;
   });
   const luminance=linear[0]*.2126+linear[1]*.7152+linear[2]*.0722;
   const ink=luminance<.18?'night':'day';
   if(heading.dataset.ink!==ink)heading.dataset.ink=ink;
  };
  const inkWatcher=new MutationObserver(syncHeadingContrast);
  inkWatcher.observe(el,{attributes:true,attributeFilter:['style']});
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Avoid a second WebGL renderer and third-party 3D download on resource-limited
  // devices; the native SVG + scroll-linked day/night gradient stays visible.
  const device=navigator as Navigator & { deviceMemory?:number; connection?:{saveData?:boolean} };
  const lowPower=Boolean(device.connection?.saveData ||
    (typeof device.deviceMemory==='number' && device.deviceMemory<=4) ||
    (typeof navigator.hardwareConcurrency==='number' && navigator.hardwareConcurrency<=4));
  // Native scroll scene remains functional even when the 3D engine or network is unavailable.
  const clamp=(v:number)=>Math.min(1,Math.max(0,v));
  const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
  const rgb=(a:number[],b:number[],t:number)=>'rgb('+a.map((v,i)=>Math.round(mix(v,b[i],t))).join(',')+')';
  const paintFallback=()=>{
   if(!fallbackActive||!el.isConnected)return;
   if(reduced){el.dataset.evening='true';el.dataset.activeStep='3';return;}
   const rect=el.getBoundingClientRect();
   const p=clamp(-rect.top/Math.max(1,rect.height-window.innerHeight));
   const dusk=clamp((p-.30)/.38);
   const n=p<.68?.55*(dusk*dusk*(3-2*dusk)):.55+.45*clamp((p-.68)/.32);
   const light=n<.55?clamp(n/.55):1,evening=n>.55?clamp((n-.55)/.45):0;
   const top=evening?rgb([167,198,226],[29,50,84],evening):rgb([247,251,255],[167,198,226],light);
   const bottom=evening?rgb([111,152,197],[18,32,63],evening):rgb([205,233,248],[111,152,197],light);
   el.style.background='linear-gradient(160deg,'+top+','+bottom+')';
   el.dataset.evening=String(n>.3);
   el.dataset.activeStep=String(Math.min(3,Math.floor(p*4+.02)));
   const count=el.querySelector('[data-tle-count]');
   if(count)count.textContent='0'+(Math.min(3,Math.floor(p*4+.02))+1);
  };
  const onScroll=()=>{
   if(!fallbackActive||fallbackFrame)return;
   fallbackFrame=requestAnimationFrame(()=>{fallbackFrame=0;paintFallback()});
  };
  const stopFallback=()=>{
   fallbackActive=false;
   if(fallbackFrame)cancelAnimationFrame(fallbackFrame);
   window.removeEventListener('scroll',onScroll);
   window.removeEventListener('resize',onScroll);
  };
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
  paintFallback();
  const load=()=>{
   watcher.disconnect();
   if(reduced||lowPower)return;
   import(/* @vite-ignore */ '/assets/tle-home-time-of-day.js?v=20261017-idle-gpu')
    .then(mod=>{
     if(cancelled||typeof mod.mountTimeOfDay!=='function')return;
     dispose=mod.mountTimeOfDay(el);
     if(el.dataset.render==='webgl')stopFallback();
    })
    .catch(()=>{/* Native CSS/SVG scroll animation continues without WebGL or external modules. */});
  };
  const watcher=new IntersectionObserver(([entry])=>{if(entry.isIntersecting)load()},{rootMargin:'700px'});
  watcher.observe(el);
  return()=>{
   cancelled=true;watcher.disconnect();stopFallback();inkWatcher.disconnect();dispose?.();
   el.style.removeProperty('background');
   delete el.dataset.evening;delete el.dataset.activeStep;
  };
 },[]);
 return <>
  <section ref={root} className="tle-day-night" data-tle-time-scene aria-label={es?'Una jornada del día a la noche':'A workday from morning to night'}>
   <div className="tle-time-sticky" aria-hidden="true">
    <div className="tle-time-heading">
     <span>{es?'UN SISTEMA PARA TODO EL DÍA':'ONE SYSTEM. ALL DAY LONG.'}</span>
     <strong aria-label={es?'De la primera consulta al último seguimiento.':'From the first request to the last follow-up.'}>
      {es?'De la primera':'From the first'}{' '}
      <span className="tle-time-rotator" aria-hidden="true">
       {(es?['consulta','cotización','reserva']:['request','quote','booking']).map((word,i)=>
        <span key={word} style={{animationDelay:`${i*2}s`}}>{word}</span>
       )}
      </span>{' '}
      {es?'al último seguimiento.':'to the last follow-up.'}
     </strong>
    </div>
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
