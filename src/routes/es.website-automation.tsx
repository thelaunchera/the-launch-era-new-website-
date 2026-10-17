import { MarketingCTA } from '@/components/marketing-cta';
import { ServiceFAQ } from '@/components/service-faq';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Globe2, MessageSquareText, Workflow, BellRing, Check, RotateCcw, Sparkles } from 'lucide-react';

export const Route=createFileRoute('/es/website-automation/')({head:()=>({meta:[
  {title:'Automatización de Website para Negocios de Limpieza | The Launch Era'},
  {name:'description',content:'Conecta tu website actual a un flujo más claro de consultas, organización y seguimiento para tu negocio de limpieza.'},
  {property:'og:title',content:'Website Automation | The Launch Era'},
  {property:'og:description',content:'Convierte las consultas de tu website en próximos pasos organizados.'},
  {property:'og:type',content:'website'},
  {name:'twitter:card',content:'summary_large_image'}
],links:[{rel:'canonical',href:'https://thelaunchera.com/es/website-automation/'},{rel:'alternate',hrefLang:'en-US',href:'https://thelaunchera.com/website-automation'},{rel:'alternate',hrefLang:'es-US',href:'https://thelaunchera.com/es/website-automation/'},{rel:'alternate',hrefLang:'x-default',href:'https://thelaunchera.com/website-automation'}]}),component:Page});

const stages=[
  {label:'01 · RECIBIDA',title:'Ya tienes los datos',detail:'El nombre del cliente y lo que necesita aparecen juntos.',Icon:MessageSquareText},
  {label:'02 · ORGANIZADA',title:'Todo en un solo lugar',detail:'Ya no tienes que buscar entre mensajes para encontrar los detalles.',Icon:Workflow},
  {label:'03 · SIGUIENTE PASO',title:'Sabes a quién dar seguimiento',detail:'Sabes a quién responder y qué hacer después.',Icon:BellRing},
] as const;

function Page(){
  const [name,setName]=useState('Jordan M.');
  const [service,setService]=useState('Limpieza recurrente');
  const [run,setRun]=useState(0);
  const [active,setActive]=useState(-1);

  useEffect(()=>{
    if(!run) return;
    setActive(0);
    const t1=window.setTimeout(()=>setActive(1),650);
    const t2=window.setTimeout(()=>setActive(2),1300);
    return()=>{window.clearTimeout(t1);window.clearTimeout(t2)};
  },[run]);

  function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(!name.trim()) setName('Nuevo lead');
    setRun(v=>v+1);
  }

  function reset(){
    setActive(-1);
    setRun(0);
    setName('Jordan M.');
    setService('Limpieza recurrente');
  }

  const current=active>=0?stages[active]:null;

  return <main style={{background:'#faf4f7'}}>
    <section className="container service-hero">
      <div className="eyebrow">WEBSITE AUTOMATION</div>
      <p className="booking-offer-line service-discount-offer"><span className="booking-offer-tag">OFERTA ESPECIAL</span><span className="booking-offer-price"><del>$59.99</del><strong>$35</strong></span></p><h1 className="editorial">Conserva tu website. Mejora lo que pasa después.</h1>
      <p>¿Ya tienes website? Organizamos las consultas que llegan desde tu formulario de contacto o cotización para que puedas responder y dar seguimiento sin perder oportunidades.</p>
      <MarketingCTA className="cta-button service-cta" href="/service-checkout/?offer=website-automation&lang=es">Comenzar — $35 <ArrowRight/></MarketingCTA><p className="muted" style={{fontSize:13,margin:"13px 0 10px",lineHeight:1.6}}>Preparación inicial: producción estimada de 48 horas después de recibir tu formulario completo y confirmar los detalles.</p><div className="service-proof-strip" aria-label="Detalles del servicio"><span>TU WEBSITE ACTUAL</span><span>ORGANIZACIÓN DE CONSULTAS</span><span>CONFIGURACIÓN ÚNICA</span></div>
    </section>

    <section className="container service-story">
      <div className="service-demo-kicker"><Sparkles/> PRUEBA EL FLUJO — EJEMPLO INTERACTIVO</div>

      <div className="web-automation-scene web-automation-live">
        <div className="web-browser">
          <div className="browser-bar"><i/><i/><i/><span>tunegociodelimpieza.com</span></div>
          <div className="browser-page">
            <Globe2/>
            <strong>Nueva consulta</strong>
            <p>Mira cómo podrías recibir una consulta sin perder los detalles.</p>
            <form className="automation-demo-form" onSubmit={submit}>
              <label>
                <span>Nombre + contacto</span>
                <input value={name} onChange={e=>setName(e.target.value)} aria-label="Nombre o contacto del lead"/>
              </label>
              <label>
                <span>Servicio que necesita</span>
                <select value={service} onChange={e=>setService(e.target.value)} aria-label="Servicio que necesita">
                  <option>Limpieza recurrente</option>
                  <option>Limpieza profunda</option>
                  <option>Limpieza de mudanza</option>
                  <option>Limpieza de oficina</option>
                  <option>Limpieza especializada</option>
                </select>
              </label>
              <button type="submit">Ver cómo funciona <ArrowRight/></button>
            </form>
            <div className="automation-demo-note">
              <span>{active<0?'Cuando quieras':'Lead de prueba'}</span>
              <strong>{active<0?'Pruébalo con tranquilidad. Es un ejemplo y no se enviará nada.':name+' · '+service}</strong>
            </div>
          </div>
        </div>

        <div className={"automation-spine "+(active>=0?'running':'')}>
          <span/><Workflow/><span/>
        </div>

        <div className="automation-results automation-results-live">
          {stages.map(({label,title,detail,Icon},i)=>{
            const done=active>=i;
            const selected=active===i;
            return <button
              type="button"
              key={label}
              className={(done?'done ':'')+(selected?'active ':'')}
              onClick={()=>active>=0&&setActive(i)}
              disabled={active<0}
            >
              <Icon/>
              <p><small>{label}</small><strong>{title}</strong><span>{detail}</span></p>
              <span className="stage-check">{done?<Check/>:<b>{i+1}</b>}</span>
            </button>
          })}
        </div>
      </div>

      <div className={"automation-live-status "+(active>=0?'show':'')}>
        <div>
          <small>{current?current.label:'MIRA CÓMO FUNCIONA'}</small>
          <strong>{current?current.title:'Prueba con una consulta de ejemplo.'}</strong>
          <p>{current?current.detail:'Prueba el ejemplo de arriba y toca cada paso para ver cómo te ayuda.'}</p>
        </div>
        {active>=0&&<button type="button" onClick={reset}><RotateCcw/> Probar otra vez</button>}
      </div>

      <div className="service-endcap">
        <span>TU WEBSITE</span><ArrowRight/><span>CONSULTA</span><ArrowRight/><span>AUTOMATIZACIÓN</span><ArrowRight/><strong>PRÓXIMO PASO ✓</strong>
        <small>Conecta el formulario de tu website · Configuración única $35 · Evita que las consultas nuevas se pierdan.</small>
      </div>
    </section>
  <ServiceFAQ topic="website" lang="es"/></main>
}
