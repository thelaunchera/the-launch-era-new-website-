import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Check, Mail, Sparkles } from 'lucide-react';

const FORM_ENDPOINT='https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-freebie';

type Language='en'|'es';

function track(event:string,params:Record<string,unknown>={}){
  if(typeof window==='undefined') return;
  window.dispatchEvent(new CustomEvent('tle:analytics',{detail:{event,...params}}));
}

function trafficContext(){
  if(typeof window==='undefined') return {source:'direct',medium:'organic',campaign:'free_lead_tracker',content:'website',landing_path:'',referrer:''};
  const qs=new URLSearchParams(window.location.search);
  let storedSource='direct',storedCampaign='';
  try{
    storedSource=sessionStorage.getItem('tleTrafficSource')||'direct';
    storedCampaign=sessionStorage.getItem('tleTrafficCampaign')||'';
  }catch{}
  return {
    source:(qs.get('utm_source')||storedSource||'direct').toLowerCase(),
    medium:(qs.get('utm_medium')||'organic').toLowerCase(),
    campaign:(qs.get('utm_campaign')||storedCampaign||'free_lead_tracker').toLowerCase(),
    content:(qs.get('utm_content')||'website').toLowerCase(),
    landing_path:window.location.pathname+window.location.search,
    referrer:document.referrer||''
  };
}

export function FreebiePage({language}:{language:Language}){
  const es=language==='es';
  const [email,setEmail]=useState('');
  const [status,setStatus]=useState<'idle'|'sending'|'sent'|'error'>('idle');
  const startedAt=useRef(Date.now());
  const formStarted=useRef(false);

  useEffect(()=>{
    try{
      const key='tle-freebie-view:'+language;
      if(!sessionStorage.getItem(key)){
        sessionStorage.setItem(key,'1');
        track('freebie_view',{freebie:'cleaning_lead_tracker',language,...trafficContext()});
      }
    }catch{
      track('freebie_view',{freebie:'cleaning_lead_tracker',language,...trafficContext()});
    }
  },[language]);

  function markFormStart(){
    if(formStarted.current) return;
    formStarted.current=true;
    track('freebie_form_start',{freebie:'cleaning_lead_tracker',language,...trafficContext()});
  }

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!email.trim()) return;
    setStatus('sending');
    const form=new FormData(event.currentTarget);
    const context=trafficContext();
    try{
      const response=await fetch(FORM_ENDPOINT,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          email:email.trim(),
          language,
          ...context,
          started_at:startedAt.current,
          website:String(form.get('website')||'')
        })
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!data?.ok) throw new Error(data?.error||'request failed');
      track('freebie_submit',{freebie:'cleaning_lead_tracker',language,...context});
      if(data?.email_sent) track('freebie_email_sent',{freebie:'cleaning_lead_tracker',language,...context});
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
            {es?'Free Cleaning Lead Tracker':'Free Cleaning Lead Tracker'}
          </div>
          <h1 className="max-w-3xl font-serif text-[clamp(3rem,7vw,6.7rem)] leading-[.92] tracking-[-.055em]">
            {es?'Deja de guardar leads en tu memoria.':'Stop keeping leads in your memory.'}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-black/65">
            {es
              ?'Recibe gratis el Lead Tracker + Starter Kit para organizar consultas, cotizaciones y seguimientos sin buscar entre DMs, screenshots y notas.'
              :'Get the free Lead Tracker + Starter Kit to organize inquiries, quotes, and follow-ups without digging through DMs, screenshots, and notes.'}
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {(es
              ?['Lead Tracker editable','Starter Kit de 12 páginas','Guiones para consultas + cotizaciones','Reset de leads en 10 minutos']
              :['Editable Lead Tracker','12-page Starter Kit','Inquiry + quote scripts','10-minute lead reset']
            ).map(item=><span key={item} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-medium"><Check size={15}/>{item}</span>)}
          </div>
          <a href="#freebie-form" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#191919] px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5">
            {es?'Quiero el Lead Tracker gratis':'Get the Free Lead Tracker'} <ArrowRight size={17}/>
          </a>
        </div>

        <div className="relative min-h-[460px] md:min-h-[560px]">
          <div className="absolute inset-y-0 right-0 w-[78%] overflow-hidden rounded-[34px] border border-black/10 bg-[#DCEBFA] shadow-[18px_18px_0_#F2D85B]">
            <img src="https://images.pexels.com/photos/19905182/pexels-photo-19905182/free-photo-of-woman-writing-in-notebook-on-desk.jpeg?auto=compress&dpr=1&h=1200&w=900" alt={es?'Dueña de negocio organizando sus leads':'Cleaning business owner organizing leads'} className="h-full w-full object-cover"/>
          </div>
          <div className="absolute bottom-6 left-0 w-[68%] rotate-[-3deg] rounded-3xl border border-black/10 bg-white p-6 shadow-2xl">
            <span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#87546F]">THE LAUNCH ERA</span>
            <h2 className="mt-3 font-serif text-4xl leading-none">Free Cleaning Lead Tracker</h2>
            <p className="mt-3 text-sm leading-6 text-black/60">
              {es?'Cada consulta con un estado. Cada lead con un próximo paso.':'Every inquiry with a status. Every lead with a next step.'}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="py-16 md:py-24" id="freebie-form">
      <div className="mx-auto grid w-[min(1080px,calc(100%-32px))] gap-7 md:grid-cols-[.9fr_1.1fr]">
        <aside className="rounded-[30px] bg-[#191919] p-7 text-white md:p-10">
          <span className="text-[11px] font-bold uppercase tracking-[.14em] text-[#F2D85B]">{es?'Qué recibes':'What you get'}</span>
          <h2 className="mt-4 font-serif text-5xl leading-[.98]">{es?'Un recurso. Cuatro herramientas útiles.':'One resource. Four useful tools.'}</h2>
          <p className="mt-5 leading-7 text-white/65">
            {es?'Sin otro sistema complicado. Solo una forma práctica de saber quién necesita atención y cuál es el próximo paso.':'No complicated new system. Just a practical way to know who needs attention and what the next step is.'}
          </p>
          <div className="mt-7 grid gap-3 text-sm">
            {(es
              ?['01 · Lead Tracker editable','02 · Starter Kit de 12 páginas','03 · Guiones para consultas + quotes','04 · Rescate de leads en 10 minutos']
              :['01 · Editable Lead Tracker','02 · 12-page Starter Kit','03 · Inquiry + quote scripts','04 · 10-minute lead rescue']
            ).map(item=><div key={item} className="rounded-2xl bg-white px-4 py-3 font-semibold text-[#191919]">{item}</div>)}
          </div>
        </aside>

        <div className="rounded-[30px] border border-black/10 bg-white p-7 shadow-[0_20px_60px_rgba(25,25,25,.06)] md:p-10">
          {status==='sent' ? <div className="flex min-h-[290px] flex-col justify-center">
            <Sparkles className="mb-5 text-[#87546F]" size={34}/>
            <h2 className="font-serif text-5xl leading-none">{es?'¡Listo! Revisa tu correo.':'Your free kit is on its way.'}</h2>
            <p className="mt-4 max-w-lg leading-7 text-black/60">
              {es
                ?<>Te enviamos un correo a <strong className="text-[#191919]">{email}</strong> con un botón para abrir tu Starter Kit. Revísalo en unos minutos.</>
                :<>Check <strong className="text-[#191919]">{email}</strong> for an email with a button to open your Starter Kit. It should arrive shortly.</>}
            </p>
            <p className="mt-6 max-w-lg rounded-2xl bg-[#FAF8F3] px-4 py-3 text-sm leading-6 text-black/60">
              {es?'¿No lo encuentras? Revisa también Promociones o Spam.':'Can’t find it? Check Promotions or Spam, too.'}
            </p>
          </div> : <>
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-full bg-[#DCEBFA]"><Mail size={21}/></div>
            <h2 className="font-serif text-5xl leading-none">{es?'Envíamelo a mi correo.':'Send it to my inbox.'}</h2>
            <p className="mt-4 leading-7 text-black/60">
              {es?'Te enviaremos el Lead Tracker + Starter Kit directamente a tu correo.':'We’ll send the Lead Tracker + Starter Kit directly to your inbox.'}
            </p>
            <form onSubmit={submit} className="mt-8">
              <label className="text-sm font-semibold" htmlFor="freebie-email">{es?'Correo electrónico':'Email address'}</label>
              <input id="freebie-email" type="email" required value={email} onFocus={markFormStart} onChange={e=>setEmail(e.target.value)} placeholder="you@business.com" className="mt-2 h-14 w-full rounded-2xl border border-black/20 bg-[#FAF8F3] px-4 outline-none transition focus:border-black"/>
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              {status==='error'&&<p className="mt-3 rounded-2xl bg-[#FFF8D8] p-3 text-sm">
                {es?'No pudimos enviarte el correo esta vez. Inténtalo de nuevo.':'We couldn’t send your email this time. Please try again.'}
              </p>}
              <button type="submit" disabled={status==='sending'} className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#F2D85B] px-5 text-sm font-bold text-[#191919] transition hover:-translate-y-0.5 disabled:opacity-60">
                {status==='sending'?(es?'Enviando…':'Sending…'):(es?'ENVIARME EL LEAD TRACKER':'SEND ME THE FREE LEAD TRACKER')} <ArrowRight size={17}/>
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-black/50">
                {es?'Usaremos tu correo para enviarte el Starter Kit que pediste.':'We’ll use your email to send the Starter Kit you requested.'}
              </p>
            </form>
          </>}
        </div>
      </div>
    </section>
  </main>;
}
