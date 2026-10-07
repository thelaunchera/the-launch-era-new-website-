import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, ExternalLink, Mail, Sparkles } from 'lucide-react';

const FORM_ENDPOINT='https://hook.us2.make.com/71gescpt0jssc2102yon8qhubqbau1rj';
const FREEBIE_URLS={
  en:'https://drive.google.com/file/d/1Ee9o6t4fuYArrqToFrFSy1df8BvTYC6D/view?usp=drivesdk',
  es:'https://drive.google.com/file/d/1AWoKb8c2Qfu_sgcyk8JkpVbpTOUPPQR-/view?usp=drivesdk',
} as const;
const TRACKER_URL='https://docs.google.com/spreadsheets/d/1NYhsQDqQZB9UnJeTqfgFOCXlAYTtzOCC/edit';

type Language='en'|'es';

export function FreebiePage({language}:{language:Language}){
  const es=language==='es';
  const [email,setEmail]=useState('');
  const [status,setStatus]=useState<'idle'|'sending'|'sent'|'error'>('idle');

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!email.trim()) return;
    setStatus('sending');
    try{
      const response=await fetch(FORM_ENDPOINT,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          type:'tle.freebie_requested',
          data:{object:{customer_details:{email:email.trim()},metadata:{language,freebie_url:FREEBIE_URLS[language]}}}
        })
      });
      if(!response.ok) throw new Error('request failed');
      setStatus('sent');
    }catch{
      setStatus('error');
    }
  }

  return <main className="bg-[#FAF8F3] text-[#191919]">
    <section className="overflow-hidden border-b border-black/10">
      <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 py-14 md:grid-cols-[1.05fr_.95fr] md:items-center md:py-20">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-black/10 bg-[#F2D85B] px-4 py-2 text-[11px] font-bold uppercase tracking-[.12em]">
            {es?'Starter kit gratis + tracker':'Free starter kit + tracker'}
          </div>
          <h1 className="max-w-3xl font-serif text-[clamp(3rem,7vw,6.7rem)] leading-[.92] tracking-[-.055em]">
            {es?'Tus leads no deberían perderse entre mensajes.':'Your leads should not disappear between messages.'}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-black/65">
            {es
              ?'Un sistema simple para darle a cada consulta un estado, un próximo paso y una fecha de seguimiento.'
              :'A simple system to give every cleaning inquiry a status, a next step and a follow-up date.'}
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {(es
              ?['Guía móvil de 11 páginas','3 guiones de seguimiento','Reset de leads en 10 minutos','Tracker editable']
              :['11-page mobile guide','3 follow-up scripts','10-minute lead reset','Editable tracker']
            ).map(item=><span key={item} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-medium"><Check size={15}/>{item}</span>)}
          </div>
          <a href="#freebie-form" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#191919] px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5">
            {es?'Quiero el Starter Kit':'Get the Starter Kit'} <ArrowRight size={17}/>
          </a>
        </div>

        <div className="relative min-h-[460px] md:min-h-[560px]">
          <div className="absolute inset-y-0 right-0 w-[78%] overflow-hidden rounded-[34px] border border-black/10 bg-[#DCEBFA] shadow-[18px_18px_0_#F2D85B]">
            <img src="https://images.pexels.com/photos/19905182/pexels-photo-19905182/free-photo-of-woman-writing-in-notebook-on-desk.jpeg?auto=compress&dpr=1&h=1200&w=900" alt={es?'Dueña de negocio organizando sus leads':'Cleaning business owner organizing leads'} className="h-full w-full object-cover"/>
          </div>
          <div className="absolute bottom-6 left-0 w-[68%] rotate-[-3deg] rounded-3xl border border-black/10 bg-white p-6 shadow-2xl">
            <span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#87546F]">THE LAUNCH ERA</span>
            <h2 className="mt-3 font-serif text-4xl leading-none">{es?'Lead-to-Booking Starter Kit':'Lead-to-Booking Starter Kit'}</h2>
            <p className="mt-3 text-sm leading-6 text-black/60">
              {es?'Una forma clara de ver qué pasó con cada lead y qué sigue.':'A clear way to see what happened with every lead and what happens next.'}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="py-16 md:py-24" id="freebie-form">
      <div className="mx-auto grid w-[min(1080px,calc(100%-32px))] gap-7 md:grid-cols-[.9fr_1.1fr]">
        <aside className="rounded-[30px] bg-[#191919] p-7 text-white md:p-10">
          <span className="text-[11px] font-bold uppercase tracking-[.14em] text-[#F2D85B]">{es?'Qué incluye':'What is inside'}</span>
          <h2 className="mt-4 font-serif text-5xl leading-[.98]">{es?'Un freebie. Cuatro herramientas útiles.':'One freebie. Four useful tools.'}</h2>
          <p className="mt-5 leading-7 text-white/65">
            {es?'Sin sistemas complicados. Solo una forma práctica de saber quién necesita atención y cuál es el próximo paso.':'No complicated system. Just a practical way to know who needs attention and what the next step is.'}
          </p>
          <div className="mt-7 grid gap-3 text-sm">
            {(es
              ?['01 · Starter Kit móvil','02 · 3 guiones de follow-up','03 · Reset de leads en 10 minutos','04 · Tracker editable']
              :['01 · Mobile Starter Kit','02 · 3 follow-up scripts','03 · 10-minute lead reset','04 · Editable lead tracker']
            ).map(item=><div key={item} className="rounded-2xl bg-white px-4 py-3 font-semibold text-[#191919]">{item}</div>)}
          </div>
        </aside>

        <div className="rounded-[30px] border border-black/10 bg-white p-7 shadow-[0_20px_60px_rgba(25,25,25,.06)] md:p-10">
          {status==='sent' ? <div className="flex min-h-[380px] flex-col justify-center">
            <Sparkles className="mb-5 text-[#87546F]" size={34}/>
            <h2 className="font-serif text-5xl leading-none">{es?'Ya lo tienes.':'You are in.'}</h2>
            <p className="mt-4 max-w-lg leading-7 text-black/60">
              {es?'Recibimos tu solicitud. También puedes abrir el recurso ahora mismo mientras llega el correo.':'We received your request. You can also open the resource now while the email is on its way.'}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={FREEBIE_URLS[language]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#191919] px-5 py-3 text-sm font-semibold text-white">
                {es?'Abrir mi Starter Kit':'Open my Starter Kit'} <ExternalLink size={16}/>
              </a>
              {es&&<a href={TRACKER_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-black/15 px-5 py-3 text-sm font-semibold">
                Abrir tracker editable <ExternalLink size={16}/>
              </a>}
            </div>
          </div> : <>
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-full bg-[#DCEBFA]"><Mail size={21}/></div>
            <h2 className="font-serif text-5xl leading-none">{es?'Envíamelo a mi correo.':'Send it to my inbox.'}</h2>
            <p className="mt-4 leading-7 text-black/60">
              {es?'Te enviaremos el Starter Kit que ya tenemos preparado para The Launch Era.':'We will send the Starter Kit already prepared for The Launch Era.'}
            </p>
            <form onSubmit={submit} className="mt-8">
              <label className="text-sm font-semibold" htmlFor="freebie-email">{es?'Correo electrónico':'Email address'}</label>
              <input id="freebie-email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@business.com" className="mt-2 h-14 w-full rounded-2xl border border-black/20 bg-[#FAF8F3] px-4 outline-none transition focus:border-black"/>
              {status==='error'&&<p className="mt-3 rounded-2xl bg-[#FFF8D8] p-3 text-sm">
                {es?'No pudimos confirmar el envío por correo. Puedes abrir el recurso directamente abajo y volver a intentarlo después.':'We could not confirm the email delivery. You can open the resource directly below and try again later.'}
              </p>}
              <button type="submit" disabled={status==='sending'} className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#F2D85B] px-5 text-sm font-bold text-[#191919] transition hover:-translate-y-0.5 disabled:opacity-60">
                {status==='sending'?(es?'Enviando…':'Sending…'):(es?'ENVIARME EL STARTER KIT':'SEND ME THE STARTER KIT')} <ArrowRight size={17}/>
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-black/50">
                {es?'Usaremos tu correo solamente para enviarte el recurso solicitado.':'We will use your email only to send the resource you requested.'}
              </p>
              {status==='error'&&<a href={FREEBIE_URLS[language]} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold underline">
                {es?'Abrir el recurso ahora':'Open the resource now'} <ExternalLink size={14}/>
              </a>}
            </form>
          </>}
        </div>
      </div>
    </section>
  </main>;
}
