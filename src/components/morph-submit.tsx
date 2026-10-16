import { useEffect, useRef, type ReactNode } from 'react';

type Status = 'idle' | 'sending' | 'done' | 'sent' | 'error';
export function MorphSubmit({status,children,language='en',className=''}:{
 status:Status; children:ReactNode; language?:'en'|'es'; className?:string;
}){
 const buttonRef=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  const element=buttonRef.current;
  if(!element) return;
  const width=element.getBoundingClientRect().width;
  const height=element.getBoundingClientRect().height;
  if(width>height) element.style.setProperty('--tle-morph-inset', `${Math.max(0,(width-height)/2)}px`);
 },[children]);
 const stage=status==='sending'?'loading':status==='done'||status==='sent'?'done':'idle';
 const live=stage==='done'?(language==='es'?'Enviado correctamente':'Successfully submitted'):status==='error'?(language==='es'?'No se pudo enviar. Inténtalo nuevamente.':'Could not send. Please try again.'):stage==='loading'?(language==='es'?'Enviando solicitud':'Sending request'):'';
 return <span className="tle-morph-wrap">
  <button ref={buttonRef} type="submit" disabled={stage!=='idle'} aria-busy={stage==='loading'} data-state={stage} className={`tle-morph-submit ${className}`.trim()}>
   <span className="tle-morph-green" aria-hidden="true"/>
   <span className="tle-morph-label">{children}</span>
   <span className="tle-morph-dots" aria-hidden="true"><i/><i/><i/></span>
   <svg className="tle-morph-check" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="m6 14 5.5 5.5L22 8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.7"/></svg>
  </button>
  <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{live}</span>
 </span>;
}
