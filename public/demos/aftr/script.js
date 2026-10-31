(() => {
  const body = document.body;
  const ageGate = document.getElementById('ageGate');
  const toast = document.getElementById('toast');
  const modalWrap = document.getElementById('modalWrap');
  const modalContent = document.getElementById('modalContent');
  const menu = document.getElementById('mobileNav');
  const menuToggle = document.getElementById('menuToggle');
  let lastFocus = null;
  let toastTimer;
  document.getElementById('year').textContent = new Date().getFullYear();
  // Concept age acknowledgment, not real ID verification.
  const ageAccepted = (() => {try { return sessionStorage.getItem('aftr_age_confirmed') === 'yes'; } catch {return false;}})();
  if (!ageAccepted) { ageGate.hidden = false; body.classList.add('modal-open'); document.getElementById('ageYes').focus(); }
  document.getElementById('ageYes').addEventListener('click', () => { try{sessionStorage.setItem('aftr_age_confirmed','yes');}catch{} ageGate.hidden = true; body.classList.remove('modal-open'); });
  document.getElementById('ageNo').addEventListener('click', () => { ageGate.querySelector('p').textContent = 'AFTR. is 21+ only. Come back when you are of age.'; ageGate.querySelector('.age-actions').hidden = true; });
  menuToggle.addEventListener('click', () => {const open = menu.hidden; menu.hidden = !open; menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
  menu.querySelectorAll('a,button').forEach(el=>el.addEventListener('click',()=>{menu.hidden=true;menuToggle.setAttribute('aria-expanded','false')}));
  function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),5200)}
  const eventSelect = `<option value="Future Fridays">Future Fridays — Friday</option><option value="Chrome Ritual">Chrome Ritual — Saturday</option><option value="Sunday Frequency">Sunday Frequency — Sunday</option>`;
  const field = (label, name, type='text', placeholder='', required=true) => `<label>${label}<input name="${name}" type="${type}" placeholder="${placeholder}" ${required?'required':''} ${type==='email'?'autocomplete="email"':name==='name'?'autocomplete="name"':''} /></label>`;
  const note = `<p class="form-note">Concept demo only. Nothing is submitted to a real venue, no payment is taken and no reservation is confirmed.</p>`;
  const templates = {
    guest: `<span class="eyebrow"><span class="square"></span> YOUR NIGHT, YOUR ACCESS</span><h2 id="modalTitle">GET ON<br><em>THE LIST.</em></h2><p>Tell us who's coming. This interactive demo shows how guest list registration would work.</p><form data-demo-form="guest"><div class="form-grid">${field('FULL NAME','name','text','Your full name')}${field('EMAIL ADDRESS','email','email','you@example.com')}<label>YOUR NIGHT<select name="event" required>${eventSelect}</select></label><label>GUESTS<select name="guests"><option value="1">1 person</option><option value="2">2 people</option><option value="3">3 people</option><option value="4">4 people</option></select></label></div><button type="submit" class="btn btn-solid">JOIN GUEST LIST</button>${note}</form>`,
    vip: `<span class="eyebrow"><span class="square"></span> ELEVATE THE EXPERIENCE</span><h2 id="modalTitle">VIP<br><em>REQUEST.</em></h2><p>Your own space. Your own night. Tell us about your group to preview the VIP inquiry process.</p><form data-demo-form="vip"><div class="form-grid">${field('FULL NAME','name','text','Your full name')}${field('EMAIL ADDRESS','email','email','you@example.com')}<label>PHONE<input name="phone" type="tel" placeholder="(702) 555-0100" /></label><label>GROUP SIZE<select name="group"><option>2–4 guests</option><option>5–8 guests</option><option>9–12 guests</option><option>13+ guests</option></select></label><label class="full">PREFERRED NIGHT<select name="event">${eventSelect}</select></label><label class="full">ANYTHING WE SHOULD KNOW?<textarea name="notes" placeholder="Special occasion, bottle preferences, requests…"></textarea></label></div><button type="submit" class="btn btn-solid">PREVIEW VIP REQUEST</button>${note}</form>`,
    tickets: `<div class="tickets-widget">
      <div class="tickets-top"><span class="tickets-brand">AFTR. LAS VEGAS / ADMISSION</span><span class="tickets-demo">CONCEPT DEMO</span></div>
      <h2 id="modalTitle" class="tickets-title">YOUR <em>NIGHT.</em></h2>
      <p class="tickets-intro">Your music. Your people. Choose your entry.</p>
      <label class="tickets-label" for="ticketEvent">01 / CHOOSE YOUR NIGHT</label>
      <select id="ticketEvent" class="tickets-event-select" aria-label="Choose an event">${eventSelect}</select>
      <div id="ticketEventDetails" class="tickets-event-details" aria-live="polite"></div>
      <span class="tickets-label">02 / SELECT YOUR EXPERIENCE</span>
      <div class="ticket-tier-list" aria-label="Entry type">
        <button type="button" data-ticket-tier="general" class="ticket-tier is-selected" aria-pressed="true"><span class="ticket-radio" aria-hidden="true"></span><span class="ticket-tier-copy"><strong>GENERAL ADMISSION</strong><small>Standard entry · 21+</small></span><span class="ticket-tier-price">$35</span></button>
        <button type="button" data-ticket-tier="priority" class="ticket-tier" aria-pressed="false"><span class="ticket-radio" aria-hidden="true"></span><span class="ticket-tier-copy"><strong>PRIORITY ENTRY</strong><small>Dedicated entry line · 21+</small></span><span class="ticket-tier-price">$65</span></button>
        <button type="button" data-ticket-tier="vip" class="ticket-tier" aria-pressed="false"><span class="ticket-radio" aria-hidden="true"></span><span class="ticket-tier-copy"><strong>VIP ACCESS</strong><small>Elevated entry experience · 21+</small></span><span class="ticket-tier-price">$120</span></button>
      </div>
      <div class="ticket-summary"><div class="ticket-count"><span class="tickets-label">03 / GUESTS</span><div class="ticket-stepper"><button type="button" data-ticket-qty="minus" aria-label="Remove one guest">−</button><output id="ticketQty" aria-live="polite">2</output><button type="button" data-ticket-qty="plus" aria-label="Add one guest">+</button></div></div><div class="ticket-total"><span>ESTIMATED TOTAL</span><strong id="ticketTotal" aria-live="polite">$70</strong><small>USD · Sample pricing</small></div></div>
      <button type="button" class="btn btn-solid ticket-preview" data-preview-tickets>PREVIEW MY TICKETS</button>
      <p class="ticket-disclaimer">Illustrative prices and experiences only. This is a fictional venue; no live inventory, charges or ticket orders.</p>
    </div>`,
    offers: `<span class="eyebrow"><span class="square"></span> MORE WAYS TO AFTR</span><h2 id="modalTitle">SPECIAL<br><em>ACCESS.</em></h2><p>Example perks available to discover in our fictional club concept.</p><div class="option-list"><button data-offer="Guest List"><span><strong>GUEST LIST ACCESS</strong><small>Get your name on the list for your preferred night.</small></span><span class="select-mark">VIEW</span></button><button data-offer="VIP Tables"><span><strong>VIP TABLE EXPERIENCE</strong><small>Ask about premium seating and bottle service.</small></span><span class="select-mark">VIEW</span></button><button data-offer="Tickets"><span><strong>EVENT EXPERIENCES</strong><small>Discover the weekly parties and entry options.</small></span><span class="select-mark">VIEW</span></button></div>${note}`
  };
  const ticketDetails = {
    'Future Fridays': {day:'FRIDAY',genre:'HOUSE / EDM',time:'10 PM – LATE'},
    'Chrome Ritual': {day:'SATURDAY',genre:'HIP-HOP / REMIXES',time:'10 PM – LATE'},
    'Sunday Frequency': {day:'SUNDAY',genre:'LATIN HOUSE / REGGAETÓN',time:'9 PM – LATE'}
  };
  const ticketPrices = {general:35,priority:65,vip:120};
  const ticketLabels = {general:'General Admission',priority:'Priority Entry',vip:'VIP Access'};
  let ticketState = {event:'Future Fridays',tier:'general',qty:2};
  function updateTickets(){
    if(modalWrap.hidden||!modalContent.querySelector('.tickets-widget')) return;
    const details=ticketDetails[ticketState.event];
    modalContent.querySelector('#ticketEvent').value=ticketState.event;
    modalContent.querySelector('#ticketEventDetails').textContent=details.day+' / '+details.genre+' / '+details.time;
    modalContent.querySelectorAll('[data-ticket-tier]').forEach(button=>{
      const selected=button.dataset.ticketTier===ticketState.tier;
      button.classList.toggle('is-selected',selected);
      button.setAttribute('aria-pressed',String(selected));
    });
    modalContent.querySelector('#ticketQty').textContent=String(ticketState.qty);
    modalContent.querySelector('#ticketTotal').textContent=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(ticketState.qty*ticketPrices[ticketState.tier]);
    modalContent.querySelector('[data-ticket-qty="minus"]').disabled=ticketState.qty===1;
    modalContent.querySelector('[data-ticket-qty="plus"]').disabled=ticketState.qty===8;
  }
  function openModal(type,event){
    lastFocus=document.activeElement;
    modalContent.innerHTML=templates[type]||templates.guest;
    modalWrap.hidden=false;
    body.classList.add('modal-open');
    if((type==='guest'||type==='vip')&&event){
      const selector=modalContent.querySelector('select[name=event]');
      if(selector)selector.value=event;
    }
    const panel=modalWrap.querySelector('.modal-panel');
    panel.classList.toggle('ticket-modal-panel',type==='tickets');
    if(type==='tickets'){
      ticketState={event:ticketDetails[event]?event:'Future Fridays',tier:'general',qty:2};
      updateTickets();
    }
    document.getElementById('modalClose').focus();
  }
  function closeModal(){modalWrap.hidden=true;body.classList.remove('modal-open');modalContent.innerHTML='';lastFocus?.focus?.();}
  document.addEventListener('click',event=>{
    const opener=event.target.closest('[data-modal]');
    if(opener){openModal(opener.dataset.modal,opener.dataset.event);return;}
    if(event.target.closest('[data-close]')||event.target.closest('#modalClose')){closeModal();return;}
    const tier=event.target.closest('[data-ticket-tier]');
    if(tier&&Object.hasOwn(ticketPrices,tier.dataset.ticketTier)){
      ticketState.tier=tier.dataset.ticketTier;
      updateTickets();return;
    }
    const step=event.target.closest('[data-ticket-qty]');
    if(step){ticketState.qty=Math.max(1,Math.min(8,ticketState.qty+(step.dataset.ticketQty==='plus'?1:-1)));updateTickets();return;}
    if(event.target.closest('[data-preview-tickets]')){
      const eventName=ticketState.event.toUpperCase(), tierName=ticketLabels[ticketState.tier].toUpperCase();
      const total='$'+String(ticketState.qty*ticketPrices[ticketState.tier]);
      modalContent.innerHTML='<div class="ticket-confirmation"><span class="tickets-brand">AFTR. LAS VEGAS / CONCEPT</span><h2 id="modalTitle">NIGHT<em> SELECTED.</em></h2><div class="ticket-confirmation-receipt"><span>EVENT</span><strong>'+eventName+'</strong><span>ENTRY</span><strong>'+tierName+'</strong><span>GUESTS</span><strong>'+ticketState.qty+'</strong><span>SAMPLE TOTAL</span><strong>'+total+'</strong></div><p>Preview only. No tickets were reserved or purchased, and no payment was made.</p><button type="button" class="btn btn-solid ticket-preview" data-edit-tickets>CHANGE SELECTION</button><button type="button" class="ticket-done" data-close="1">BACK TO AFTR.</button></div>';
      document.getElementById('modalClose').focus();return;
    }
    if(event.target.closest('[data-edit-tickets]')){
      modalContent.innerHTML=templates.tickets;
      updateTickets();return;
    }
    const offer=event.target.closest('[data-offer]');
    if(offer)openModal(offer.dataset.offer==='VIP Tables'?'vip':offer.dataset.offer==='Tickets'?'tickets':'guest');
  });
  document.addEventListener('change',event=>{
    if(event.target?.id==='ticketEvent'&&Object.hasOwn(ticketDetails,event.target.value)){
      ticketState.event=event.target.value;
      updateTickets();
    }
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modalWrap.hidden){closeModal();}if(e.key==='Tab'&&!modalWrap.hidden){const els=[...modalWrap.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])')].filter(el=>el.getClientRects().length);if(els.length){const first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault();}}}});
  document.addEventListener('submit',e=>{const form=e.target.closest('[data-demo-form]');if(!form)return;e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const firstName=String(data.get('name')||'Guest').trim().split(/\s+/)[0];const type=form.dataset.demoForm;modalContent.innerHTML=`<div class="confirmation"><span class="eyebrow"><span class="square"></span> CONCEPT PREVIEW</span><h2 id="modalTitle">LOOKING<br><em>GOOD.</em></h2><strong>THANKS, ${firstName.toUpperCase()}.</strong><p>${type==='vip'?'Your VIP inquiry has been previewed.':'Your guest list entry has been previewed.'} This demo does not send your information or create a real booking.</p><button type="button" class="btn btn-solid" id="doneBtn">BACK TO AFTR.</button></div>`;document.getElementById('doneBtn').addEventListener('click',closeModal);document.getElementById('doneBtn').focus();});
  // Show generated shots locally; use photo fallbacks on source-only hosted copies.
  document.querySelectorAll('img[data-fallback]').forEach(img=>img.addEventListener('error',()=>{if(!img.dataset.tried){img.dataset.tried='1';img.src=img.dataset.fallback;}}));
  // Screenshot fidelity and motion, with reduced-motion support.
  if('IntersectionObserver'in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){const observer=new IntersectionObserver(items=>items.forEach(i=>{if(i.isIntersecting){i.target.classList.add('visible');observer.unobserve(i.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
})();