import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import './service-flip-card.css';

type Props = {
  title: string;
  description: string;
  href: string;
  points: string[];
  lang?: 'en' | 'es';
  children: ReactNode;
};
export function ServiceFlipCard({title,description,href,points,lang='en',children}:Props) {
  const [flipped,setFlipped]=useState(false);
  const [reduced,setReduced]=useState(false);
  const root=useRef<HTMLElement>(null);
  const front=useRef<HTMLButtonElement>(null);
  const link=useRef<HTMLAnchorElement>(null);
  const suppressFocus=useRef(false);
  const openingFocus=useRef(false);
  const open=flipped||reduced;

  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setReduced(media.matches);
    update();
    media.addEventListener?.('change',update);
    return ()=>media.removeEventListener?.('change',update);
  },[]);
  const reveal=(moveFocus=false)=>{
    setFlipped(true);
    if(moveFocus){
      openingFocus.current=true;
      window.requestAnimationFrame(()=>{
        link.current?.focus();
        window.requestAnimationFrame(()=>{openingFocus.current=false;});
      });
    }
  };
  const restore=()=>{
    suppressFocus.current=true;
    setFlipped(false);
    window.requestAnimationFrame(()=>{
      front.current?.focus();
      window.requestAnimationFrame(()=>{suppressFocus.current=false;});
    });
  };
  const onKeys=(event:KeyboardEvent<HTMLElement>)=>{
    if(event.key==='Escape'&&flipped&&!reduced){event.preventDefault();restore();}
  };
  return <article ref={root} className={'service-card tle-service-flip'+(open?' is-flipped':'')+(reduced?' is-reduced':'')}
    onMouseEnter={()=>{if(!reduced&&window.matchMedia('(hover: hover) and (pointer: fine)').matches)reveal();}}
    onMouseLeave={()=>{if(!reduced&&!openingFocus.current&&!root.current?.contains(document.activeElement))setFlipped(false);}}
    onFocusCapture={e=>{if(e.target===front.current&&!suppressFocus.current&&!open)reveal(true);}}
    onBlurCapture={e=>{if(!reduced&&!openingFocus.current&&!e.currentTarget.contains(e.relatedTarget as Node))setFlipped(false);}}
    onKeyDown={onKeys}>
    <div className="tle-service-flip__inner">
      <div className="tle-service-flip__face tle-service-flip__front" inert={open} aria-hidden={open}>
        <button ref={front} type="button" className="tle-service-flip__front-button"
          aria-label={(lang==='es'?'Ver detalles de ':'See details for ')+title} aria-expanded={open}
          onClick={()=>reveal(true)}>
          {children}
          <span className="tle-service-flip__hint" aria-hidden="true">{lang==='es'?'Toca para conocer más ↗':'Tap for details ↗'}</span>
        </button>
      </div>
      <div className="tle-service-flip__face tle-service-flip__back" inert={!open} aria-hidden={!open}>
        {!reduced&&<button className="tle-service-flip__restore" type="button"
          aria-label={lang==='es'?'Volver a la foto de '+title:'Back to photo for '+title}
          onClick={restore}><ArrowLeft size={16} aria-hidden="true"/></button>}
        <span className="tle-service-flip__back-kicker">{lang==='es'?'TU PRÓXIMO PASO':'YOUR NEXT STEP'}</span>
        <h3>{title}</h3>
        <p>{description}</p>
        <ul>{points.slice(0,3).map(point=><li key={point}><Check size={16} aria-hidden="true"/><span>{point}</span></li>)}</ul>
        <a ref={link} href={href} className="tle-service-flip__cta">
          {lang==='es'?'Explorar servicio':'Explore service'} <ArrowRight size={17} aria-hidden="true"/>
        </a>
      </div>
    </div>
  </article>;
}
