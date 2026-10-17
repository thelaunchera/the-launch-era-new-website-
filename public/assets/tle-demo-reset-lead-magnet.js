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
    sonnyTitle:'Conoce a Sonny',
    sonnySub:'Prueba cómo ayuda a tus clientes · Demo con IA',
    sonnyToggle:'Probar Sonny',
    sonnyClose:'Cerrar chat',
    sonnySend:'Enviar',
    sonnyPlaceholder:'Pregunta por una cita de limpieza',
    intro:'¡Hola! Soy Sonny 👋 Puedo resolver dudas, ayudarte a elegir una limpieza y preparar una solicitud organizada. Probemos: ¿es para una casa o un negocio?',
    status:'Simulación: no se envía ninguna reserva ni correo.',
    waiting:'Sonny está respondiendo…',
    error:'No pude responder ahora mismo. Prueba otra vez o continúa con el formulario de ejemplo.',
    limit:'Se alcanzó el límite de esta demostración.',
    complete:'Tu solicitud está lista para revisar. Puedes completar la reserva de ejemplo en el formulario de arriba.',
    use:'Usar los datos en el formulario de ejemplo',
    retry:'No entendí esa respuesta. Prueba otra vez.',
    learn:'Añade un asistente de IA a tu página de reservas'
  } : {
    person:'PERSONALIZED FOR',
    area:'Service area: ',
    tracker:'View demo Command Center →',
    sonnyTitle:'Meet Sonny',
    sonnySub:'See how I help your customers · AI demo',
    sonnyToggle:'Try Sonny',
    sonnyClose:'Close chat',
    sonnySend:'Send',
    sonnyPlaceholder:'Ask about a cleaning appointment',
    intro:'Hi! I’m Sonny 👋 I can answer questions, help customers choose a cleaning and organize a booking request. Let’s try it! Is this for a home or a business?',
    status:'Simulation only. No real booking or email will be sent.',
    waiting:'Sonny is responding…',
    error:'I couldn’t answer just now. Please try again, or continue with the sample form.',
    limit:'You have reached the demo conversation limit.',
    complete:'Your sample request is ready for review. You can finish the example booking form above.',
    use:'Use details in the sample form',
    retry:'I didn’t catch that. Please try again.',
    learn:'Add an AI assistant to your booking page'
  };
  function renderBrand(){
    // Keep historic DOM IDs for existing route/customer QA, but put all
    // visible personalized branding INSIDE the photographic hero only.
    const companyName=business || 'Sunshine Cleaning Demo';
    for (const id of ['bookingPortalCompany','bookingPortalCompanyFinal']) {
      const target=el(id);
      if(target)target.textContent=companyName;
    }
    el('leadContext').hidden=true;
    if (business || area) {
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
    const extras=active?.dataset.kind==='residential'
      ? [...document.querySelectorAll('input[name="demo-extras"]:checked')].map(item=>item.value)
      : [];
    const extraWords=lang()==='es'
      ? {petsLabel:'Mascotas en casa',firstLabel:'Primera limpieza',ovenLabel:'Interior del horno',fridgeLabel:'Interior del refrigerador'}
      : {petsLabel:'Pets at home',firstLabel:'First-time cleaning',ovenLabel:'Inside oven',fridgeLabel:'Inside refrigerator'};
    const extraDescription=extras.map(key=>extraWords[key]).filter(Boolean).join(', ');
    const combinedNotes=[input('notes'),extraDescription
      ? (lang()==='es'?'Detalles opcionales: ':'Optional details: ')+extraDescription
      : ''].filter(Boolean).join('\n');
    const details={
      name:input('customerName'),
      email:input('customerEmail'),
      service:selected,
      businessName:business,
      homeType:active?.dataset.kind==='residential'
        ? [input('propertyType'),input('beds')+' bedrooms',input('baths')+' bathrooms',input('squareFeet')?input('squareFeet')+' sq ft':''].filter(Boolean).join(' · ')
        : [input('spaceType'),input('squareFeet')?input('squareFeet')+' sq ft':''].filter(Boolean).join(' · '),
      propertyType:active?.dataset.kind==='residential'?input('propertyType'):input('spaceType'),
      squareFeet:input('squareFeet'),
      bedrooms:active?.dataset.kind==='residential'?input('beds'):'',
      bathrooms:active?.dataset.kind==='residential'?input('baths'):'',
      freq:freq,
      estimate:price ? 'Est. $'+price : 'Custom quote',
      estimateValue:price,
      streetAddress:input('customerStreet'),
      addressLine2:input('customerUnit'),
      city:input('customerCity'),
      state:input('customerState'),
      zip:input('customerZip'),
      fullAddress:[input('customerStreet'),input('customerUnit'),input('customerCity'),input('customerState'),input('customerZip')].filter(Boolean).join(', '),
      date:input('preferredDate'),
      time:el('tlePreferredTime')?.value||'Flexible',
      notes:combinedNotes,
      extras,
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
    el('sonnyToggle').setAttribute('aria-label',shown ? p.sonnyClose : p.sonnyToggle);
    el('sonnyToggle').setAttribute('title',shown ? p.sonnyClose : p.sonnyToggle);
    el('sonnyInput').placeholder=p.sonnyPlaceholder;
    el('sonnyInput').setAttribute('aria-label',p.sonnyPlaceholder);
    el('sonnySend').textContent=p.sonnySend;
    el('sonnyUse').textContent=p.use;
    const learn=el('sonnyLearn');
    if(learn){
      learn.textContent=p.learn+' ↗';
      learn.href=lang()==='es'?'/es/ai-booking-assistant/':'/ai-booking-assistant/';
    }
    document.querySelectorAll('#sonnyIdeas .sonny-idea').forEach(button=>{
      button.textContent=button.dataset[lang()]||button.textContent;
    });
    el('sonnyIdeas')?.setAttribute('aria-label',lang()==='es'?'Prueba un ejemplo con Sonny':'Try an example with Sonny');
    if(!busy)el('sonnyStatus').textContent=p.status;
  }
  function toggleSonny(next){
    shown=next;
    el('sonnyBody').hidden=!next;
    el('sonnyToggle').setAttribute('aria-expanded',String(next));
    updateSonnyWords();
    if(next){
      if(!el('sonnyLog').children.length) addLine(phrases().intro);
      el('sonnyInput').focus();
    }
  }
  el('sonnyToggle').addEventListener('click',()=>toggleSonny(!shown));
  updateSonnyWords();
  // Suggestions are real user messages to the same AI endpoint, not canned bot replies.
  document.querySelectorAll('#sonnyIdeas .sonny-idea').forEach(button=>{
    button.addEventListener('click',()=>{
      if(busy||el('sonnyInput').disabled)return;
      el('sonnyInput').value=button.dataset[lang()]||'';
      el('sonnyForm').requestSubmit();
    });
  });

  // Keep the optional chat from covering the booking flow after the visitor
  // resumes scrolling or selects another control. Preserve the conversation
  // and the original #sonnyToggle/#sonnyBody handlers; only collapse the panel.
  let sonnyOpenedAt=0;
  const originalSonnyClick=el('sonnyToggle');
  originalSonnyClick.addEventListener('click',()=>{
    if(shown)sonnyOpenedAt=Date.now();
  });
  let previousPageScroll=window.scrollY;
  window.addEventListener('scroll',()=>{
    const current=window.scrollY;
    const moved=Math.abs(current-previousPageScroll);
    previousPageScroll=current;
    if(shown && window.matchMedia('(max-width:700px)').matches &&
       moved>=12 && Date.now()-sonnyOpenedAt>650){
      toggleSonny(false);
    }
  },{passive:true});
  document.addEventListener('pointerdown',event=>{
    if(!shown || event.target.closest('.sonny, #bookingHeroSonny'))return;
    toggleSonny(false);
  },{passive:true});
  el('sonnyForm').addEventListener('submit',async event=>{
    event.preventDefault();
    if(busy)return;
    const msg=el('sonnyInput').value.trim().slice(0,650);
    if(!msg)return;
    busy=true;
    el('sonnyInput').value='';
    el('sonnySend').disabled=true;
    addLine(msg,'user');
    el('sonnyIdeas').hidden=true;
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
      const valid=res.ok&&typeof result.reply==='string'&&result.reply.trim().length>0;
      pending.textContent=valid?result.reply:(res.status===429?phrases().limit:res.status===400?phrases().retry:phrases().error);
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
    // The public service gallery first flips to explain a clean.
    // Sonny explicitly chooses its back CTA when using a prepared draft.
    if(picked){
      const card=picked.closest('[data-flip-card]');
      if(card){
        const select=card.querySelector('[data-flip-select]');
        const front=card.querySelector('.service');
        // Clear the preview face's inert state via its normal flip handler.
        front?.click();
        select?.click();
      }else picked.click();
    }else el('customQuote').click();
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
