/* TLE lead magnet v1: static personalized booking demo and optional Sonny.
 * Scoped ONLY to public/booking-demo-reset.html. No third-party animations,
 * actual bookings, payments, mail sends, tracking beacons or client data.
 */
(() => {
  'use strict';
  const el = id => document.getElementById(id);
  if (!el('bookingPage') || !el('sonnyBody')) return;
  const qs = new URLSearchParams(location.search);
  if (qs.has('key') || qs.get('owner_preview') === '1') {
    location.replace('/lead-private-preview.html?' + qs.toString());
    return;
  }
  const leadBrand = {
    paula:'PAULA DIAS CLEANING',yalanda:'HAVENS TOUCH HOUSEKEEPING',
    ako:'AKO CLEANING SERVICES',ceaz:'CEAZ CLEANING SERVICES',
    maidright:'CLEANING MAID RIGHT',novaclean:'NOVACLEAN',
    gleamglow:'GLEAM GLOW CLEANING'
  };
  const clean = (v,max=100) => String(v||'').replace(/[<>\u0000-\u001f]/g,' ').trim().slice(0,max);
  const business = clean(qs.get('business') || leadBrand[qs.get('lead')] || '',100);
  const area = clean(qs.get('area'),100);
  const services = clean(qs.get('services')||'Standard cleaning, deep cleaning, move-in/out cleaning, commercial quotes',180);
  const scope = ['business','lead','rid','area','services','lang','source'];
  const sourceScope = {};
  for (const key of scope) {
    if(qs.has(key)) sourceScope[key] = qs.get(key);
  }
  const savedKey = 'tleSampleBooking:'+JSON.stringify([qs.get('business')||'',qs.get('lead')||'',qs.get('rid')||'']);
  const lang = () => el('language').value === 'es' ? 'es' : 'en';
  const phrases = () => lang()==='es' ? {
    person:'PERSONALIZADO PARA',
    area:'Zona de servicio: ',
    tracker:'Ver Command Center de ejemplo →',
    sonnyTitle:'¿Quieres probar a Sonny?',
    sonnySub:'Asistente de reservas con IA opcional · Solo demo',
    sonnyToggle:'Probar Sonny',
    sonnyClose:'Cerrar chat',
    sonnySend:'Enviar',
    sonnyPlaceholder:'Pregunta por una cita de limpieza',
    intro:'¡Hola! Soy Sonny, el asistente de reservas de ejemplo. ¿Qué tipo de limpieza necesitas?',
    status:'Simulación: no se envía ninguna reserva ni correo.',
    waiting:'Sonny está respondiendo…',
    error:'Sonny no está disponible en este momento. Puedes seguir usando el formulario.',
    limit:'Se alcanzó el límite de esta demostración.',
    complete:'Tu solicitud está lista para revisar. Puedes completar la reserva de ejemplo en el formulario de arriba.',
    use:'Usar los datos en el formulario de ejemplo'
  } : {
    person:'PERSONALIZED FOR',
    area:'Service area: ',
    tracker:'View demo Command Center →',
    sonnyTitle:'Want to try Sonny?',
    sonnySub:'Optional AI booking assistant · Demo only',
    sonnyToggle:'Try Sonny',
    sonnyClose:'Close chat',
    sonnySend:'Send',
    sonnyPlaceholder:'Ask about a cleaning appointment',
    intro:'Hi! I’m Sonny, your sample booking assistant. What kind of cleaning do you need?',
    status:'Simulation only. No real booking or email will be sent.',
    waiting:'Sonny is responding…',
    error:'Sonny is temporarily unavailable. You can still use the booking form above.',
    limit:'You have reached the demo conversation limit.',
    complete:'Your sample request is ready for review. You can finish the example booking form above.',
    use:'Use details in the sample form'
  };
  function renderBrand(){
    if (business || area) {
      el('leadContext').hidden=false;
      el('leadContextLabel').textContent=phrases().person;
      el('leadBusiness').textContent=business || (lang()==='es'?'Tu negocio de limpieza':'Your cleaning business');
      el('leadArea').textContent=area ? phrases().area+area : '';
      document.title=(business? business+' — ':'')+(lang()==='es'?'Demo de reservas':'Booking Demo')+' | The Launch Era';
    }
    const qp = new URLSearchParams();
    for(const key of ['business','lead','rid','area','services','source']){
      if (sourceScope[key]) qp.set(key,sourceScope[key]);
    }
    qp.set('lang',lang());
    el('trackerLink').href='/lead-demo-tracker.html?'+qp.toString();
    el('trackerLink').textContent=phrases().tracker;
  }
  function saveRequest(){
    const input=id=>el(id)?.value.trim()||'';
    const active=document.querySelector('.service[aria-pressed="true"]');
    const selected=active?.querySelector('.service-title')?.textContent?.trim()
      || (lang()==='es'?'Cotización personalizada':'Custom quote');
    const price=active ? Number(active.dataset.price)||0 : 0;
    const freq=active?.dataset.kind==='residential' ? input('frequency') : 'Custom quote';
    const details={
      name:input('customerName'),
      email:input('customerEmail'),
      service:selected,
      businessName:business,
      homeType:active?.dataset.kind==='residential'
        ? input('beds')+' bedrooms · '+input('baths')+' bathrooms'
        : input('spaceType'),
      freq:freq,
      estimate:price ? 'Est. $'+price : 'Custom quote',
      estimateValue:price,
      zip:input('customerZip'),
      date:input('preferredDate'),
      time:el('tlePreferredTime')?.value||'Flexible',
      notes:input('notes'),
      status:'new',
      demoOnly:true
    };
    try { sessionStorage.setItem(savedKey,JSON.stringify(details)); } catch {}
  }
  el('finish').addEventListener('click',saveRequest);
  el('language').addEventListener('change',()=>{
    renderBrand();
    updateSonnyWords();
  });
  renderBrand();

  let shown=false,busy=false,threadId;
  const history=[];
  const bookingDraft={};
  const safeUuid=()=>{
    if(crypto?.randomUUID) return crypto.randomUUID();
    const buf=new Uint8Array(16);crypto.getRandomValues(buf);
    return [...buf].map(x=>x.toString(16).padStart(2,'0')).join('');
  };
  threadId=safeUuid();
  function addLine(msg,type='bot'){
    const item=document.createElement('p');
    item.className='sonny-line '+type;
    item.textContent=String(msg||'');
    el('sonnyLog').appendChild(item);
    el('sonnyLog').scrollTop=el('sonnyLog').scrollHeight;
    return item;
  }
  function updateSonnyWords(){
    const p=phrases();
    el('sonnyTitle').textContent=p.sonnyTitle;
    el('sonnySubtitle').textContent=p.sonnySub;
    el('sonnyToggle').textContent=shown ? p.sonnyClose:p.sonnyToggle;
    const launcher=el('sonnyAvatarLauncher');
    if(launcher)launcher.setAttribute('aria-label',lang()==='es'?'Hablar con Sonny — solo demo':'Chat with Sonny — sample demo');
    el('sonnyInput').placeholder=p.sonnyPlaceholder;
    el('sonnyInput').setAttribute('aria-label',p.sonnyPlaceholder);
    el('sonnySend').textContent=p.sonnySend;
    el('sonnyUse').textContent=p.use;
    if(!busy)el('sonnyStatus').textContent=p.status;
  }
  function toggleSonny(next){
    shown=next;
    el('sonnyBody').hidden=!next;
    el('sonnyToggle').setAttribute('aria-expanded',String(next));
    el('sonnyAvatarLauncher')?.setAttribute('aria-expanded',String(next));
    updateSonnyWords();
    if(next){
      if(!el('sonnyLog').children.length) addLine(phrases().intro);
      el('sonnyInput').focus();
    }
  }
  el('sonnyToggle').addEventListener('click',()=>toggleSonny(!shown));
  const sonnyLauncher=el('sonnyAvatarLauncher');
  if(sonnyLauncher){
    sonnyLauncher.addEventListener('click',()=>{
      if(!shown)toggleSonny(true);
      document.querySelector('section.sonny')?.scrollIntoView({block:'center',behavior:'auto'});
      el('sonnyInput').focus({preventScroll:true});
    });
    const card=document.querySelector('section.sonny');
    if(card&&'IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{
        // When the in-page Sonny card is visible, avoid a duplicate launcher.
        sonnyLauncher.hidden=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=0.45);
      },{threshold:[0,0.45]});
      observer.observe(card);
    }else sonnyLauncher.hidden=false;
  }
  updateSonnyWords();
  el('sonnyForm').addEventListener('submit',async event=>{
    event.preventDefault();
    if(busy)return;
    const msg=el('sonnyInput').value.trim().slice(0,650);
    if(!msg)return;
    busy=true;
    el('sonnyInput').value='';
    el('sonnySend').disabled=true;
    addLine(msg,'user');
    el('sonnyStatus').textContent=phrases().waiting;
    const pending=addLine(phrases().waiting);
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),27000);
    try {
      const context=history.slice(-8).map(x=>x.role+': '+x.message).join('\n').slice(-1100);
      const res=await fetch('https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-ai-booking-demo',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          customer_message:msg,
          business_name:business||'Demo Cleaning Business',
          service_area:area,
          services_offered:services,
          thread_id:threadId,
          language:lang(),
          conversation_history:context,
          booking_draft:bookingDraft
        }),
        signal:controller.signal
      });
      const result=await res.json().catch(()=>({}));
      const valid=res.ok&&typeof result.reply==='string';
      pending.textContent=valid?result.reply:(res.status===429?phrases().limit:phrases().error);
      if(valid){
        history.push({role:'Visitor',message:msg.slice(0,230)},{role:'Assistant',message:result.reply.slice(0,230)});
        if(history.length>16)history.splice(0,history.length-16);
        if(result.booking&&typeof result.booking==='object'&&!Array.isArray(result.booking)){
          for(const [k,v] of Object.entries(result.booking)){
            if((typeof v==='string'&&v.trim())||(typeof v==='number'&&Number.isFinite(v)))bookingDraft[k]=v;
          }
        }
        if(result.ready_for_review===true){addLine(phrases().complete);el('sonnyUse').hidden=false;}
      }
      if(res.status===429){el('sonnyInput').disabled=true;}
    } catch {pending.textContent=phrases().error;}
    finally{
      clearTimeout(timeout);busy=false;
      el('sonnySend').disabled=el('sonnyInput').disabled;
      el('sonnyStatus').textContent=phrases().status;
      el('sonnyLog').scrollTop=el('sonnyLog').scrollHeight;
    }
  });
  // Sonny only prepares a sample request; the visitor must review it and
  // explicitly finish the offline demo. Never submit a real booking or email.
  el('sonnyUse').addEventListener('click',()=>{
    const d=bookingDraft;
    const svc=String(d.service||'').toLowerCase();
    const commercial=d.category==='commercial'||['office','retail','medical','commercial'].includes(svc);
    el(commercial?'comTab':'resTab').click();
    const options=[...document.querySelectorAll('.service')];
    let picked=options.find(b=>b.dataset.kind===(commercial?'commercial':'residential')&&(
      b.dataset.id===svc || b.dataset.id==='standard'&&/standard|regular/.test(svc)||
      b.dataset.id==='deep'&&svc.includes('deep')||b.dataset.id==='move'&&svc.includes('move')
    ));
    if(picked)picked.click();
    else el('customQuote').click();
    if(picked)el('chooseNext').click();
    const name=[d.first_name,d.last_name].filter(v=>typeof v==='string'&&v.trim()).join(' ')
      ||d.customer_name||d.name||'';
    if(typeof name==='string')el('customerName').value=name.slice(0,80);
    const email=d.email||d.customer_email;
    if(typeof email==='string')el('customerEmail').value=email.slice(0,120);
    if(typeof d.zip==='string')el('customerZip').value=d.zip.slice(0,10);
    if(typeof d.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d.date))el('preferredDate').value=d.date;
    if(Number.isFinite(d.bedrooms))el('beds').value=String(Math.min(4,Math.max(1,d.bedrooms)));
    if(Number.isFinite(d.bathrooms))el('baths').value=String(Math.min(3,Math.max(1,d.bathrooms)));
    if(['one time','weekly','biweekly','monthly'].includes(d.frequency))
      el('frequency').value=d.frequency==='one time'?'one':d.frequency;
    if(typeof d.notes==='string')el('notes').value=d.notes.slice(0,1000);
    toggleSonny(false);
    el('detailsPanel').scrollIntoView({behavior:'auto',block:'start'});
  });
})();
