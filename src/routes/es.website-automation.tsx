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
]}),component:Page});

const stages=[
  {label:'01 · CAPTURADA',title:'Consulta organizada',detail:'Nombre, contacto y servicio quedan guardados en un solo registro.',Icon:MessageSquareText},
  {label:'02 · DIRIGIDA',title:'Próximo paso correcto',detail:'La consulta entra al flujo correcto en vez de quedarse perdida en un inbox.',Icon:Workflow},
  {label:'03 · SEGUIMIENTO',title:'La conversación sigue',detail:'El próximo paso queda claro para que el lead no se enfríe.',Icon:BellRing},
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
      <h1 className="editorial">Un website que sigue trabajando cuando tú ya cerraste.</h1>
      <p>Conectamos tu website actual a un flujo más claro de consultas y seguimiento para que los clientes potenciales sepan qué hacer después.</p>
      <a className="cta-button service-cta" href="/service-checkout/?offer=website-automation&lang=es">Comenzar — $59.99 <ArrowRight/></a>
    </section>

    <section className="container service-story">
      <div className="service-demo-kicker"><Sparkles/> PRUEBA EL FLUJO — ESTA ES UNA DEMO EN VIVO</div>

      <div className="web-automation-scene web-automation-live">
        <div className="web-browser">
          <div className="browser-bar"><i/><i/><i/><span>tunegociodelimpieza.com</span></div>
          <div className="browser-page">
            <Globe2/>
            <strong>Nueva consulta</strong>
            <p>Prueba cómo se siente un flujo de leads cuando el próximo paso ya está organizado.</p>
            <form className="automation-demo-form" onSubmit={submit}>
              <label>
                <span>Nombre + contacto</span>
                <input value={name} onChange={e=>setName(e.target.value)} aria-label="Nombre o contacto del lead"/>
              </label>
              <label>
                <span>Servicio que necesita</span>
                <select value={service} onChange={e=>setService(e.target.value)} aria-label="Servicio que necesita">
                  <option>Limpieza recurrente</option>
                  <option>Deep cleaning</option>
                  <option>Move-in / move-out</option>
                  <option>Limpieza de oficina</option>
                  <option>Limpieza especializada</option>
                </select>
              </label>
              <button type="submit">Enviar consulta <ArrowRight/></button>
            </form>
            <div className="automation-demo-note">
              <span>{active<0?'Lista para probar':'Lead de prueba'}</span>
              <strong>{active<0?'Nada se envía a ningún lugar. Prueba el flujo.':name+' · '+service}</strong>
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
          <small>{current?current.label:'DEMO EN VIVO'}</small>
          <strong>{current?current.title:'Envía una consulta de prueba para comenzar.'}</strong>
          <p>{current?current.detail:'Después de iniciar el flujo puedes tocar cada paso para ver qué está haciendo.'}</p>
        </div>
        {active>=0&&<button type="button" onClick={reset}><RotateCcw/> Probar otra consulta</button>}
      </div>

      <div className="service-endcap">
        <span>TU WEBSITE</span><ArrowRight/><span>CONSULTA</span><ArrowRight/><span>AUTOMATIZACIÓN</span><ArrowRight/><strong>PRÓXIMO PASO ✓</strong>
        <small>Producción en 48 horas · servicio único $59.99 · costos externos de plataforma no incluidos.</small>
      </div>
    </section>
  </main>
}
