/* 2026-11-07 — Non-submitting progressive feedback for concept demos.
   Preserves every existing submit/preview handler and does not transmit data. */
(() => {
  'use strict';
  const eligible = new Set(['booking', 'inquiryForm', 'contact-form']);
  const copy = (es) => es ? {
    label:'Tu solicitud, paso a paso', of:'de', ready:'datos listos',
    needed:'Completa este campo', email:'Escribe un correo válido',
    date:'Fecha elegida'
  } : {
    label:'Your inquiry, step by step', of:'of', ready:'details ready',
    needed:'Please complete this field', email:'Enter a valid email',
    date:'Date selected'
  };
  const spanish = () => document.documentElement.lang.toLowerCase().startsWith('es');
  const localToday = () => {
    const d = new Date();
    return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  };
  function enhance(form) {
    if (!eligible.has(form.id) || form.dataset.tleFormUx === 'ready') return;
    // Other demos already have their own multi-step progress. Do not duplicate it.
    form.dataset.tleFormUx = 'ready';
    form.classList.add('tle-demo-form-ui');
    const fields = [...form.querySelectorAll('input[required],select[required],textarea[required]')]
      .filter(el => !['hidden','checkbox','radio'].includes(el.type) && !el.disabled);
    if (!fields.length) return;
    const box = document.createElement('div');
    box.className = 'tle-form-progress';
    box.innerHTML = '<div class="tle-form-progress__labels"><span class="tle-progress-title"></span><strong class="tle-progress-count"></strong></div><span class="tle-form-progress__track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Inquiry completion"><span class="tle-form-progress__fill"></span></span>';
    form.insertBefore(box, form.firstChild);
    const title = box.querySelector('.tle-progress-title');
    const count = box.querySelector('.tle-progress-count');
    const meter = box.querySelector('[role="progressbar"]');
    const fill = box.querySelector('.tle-form-progress__fill');
    const errors = new WeakMap();
    const dateNotes = new WeakMap();
    const ready = el => String(el.value || '').trim().length>0 && el.checkValidity();
    const selectedDate = value => {
      const [y,m,d] = (value||'').split('-').map(Number);
      if (!y || !m || !d) return '';
      const formatted = new Date(y,m-1,d);
      return new Intl.DateTimeFormat(spanish()?'es-US':'en-US',
        {month:'short',day:'numeric',year:'numeric'}).format(formatted);
    };
    for (const el of fields) {
      if (el.type === 'date' && !el.min) el.min = localToday();
      if (el.type === 'date' && el.closest('label')) {
        const note = document.createElement('small');
        note.className='tle-date-chosen';
        note.hidden=true;
        el.closest('label').appendChild(note);
        dateNotes.set(el,note);
      }
      const label = el.closest('label') || el.parentElement;
      if (label) {
        const feedback=document.createElement('small');
        feedback.className='tle-field-feedback';
        feedback.setAttribute('role','status');
        feedback.hidden=true;
        label.appendChild(feedback);
        errors.set(el,feedback);
      }
    }
    function validateField(el, showError=false) {
      const label=el.closest('label') || el.parentElement;
      if (label) label.classList.toggle('tle-field-ready',ready(el));
      const error=errors.get(el);
      if (error) {
        const invalid = !el.checkValidity() && showError;
        const wording=copy(spanish());
        error.textContent=el.validity.typeMismatch ? wording.email : wording.needed;
        error.hidden=!invalid;
        if (invalid) el.setAttribute('aria-invalid','true');
        else el.removeAttribute('aria-invalid');
      }
      const dateNote=dateNotes.get(el);
      if (dateNote) {
        const formatted=selectedDate(el.value);
        dateNote.hidden=!formatted;
        dateNote.textContent=formatted ? copy(spanish()).date + ': ' + formatted : '';
      }
    }
    function render() {
      const done=fields.filter(ready).length;
      const words=copy(spanish());
      title.textContent=words.label;
      count.textContent=done+' '+words.of+' '+fields.length+' '+words.ready;
      const pct=Math.round(done/fields.length*100);
      meter.setAttribute('aria-valuenow',String(pct));
      meter.setAttribute('aria-label',words.label);
      fill.style.width=pct+'%';
      fields.forEach(el=>validateField(el,el.dataset.tleTouched==='1'));
    }
    fields.forEach(el=>{
      el.addEventListener('blur',()=>{el.dataset.tleTouched='1';render();});
      el.addEventListener('change',render);
      el.addEventListener('input',render);
    });
    form.addEventListener('reset',()=>requestAnimationFrame(()=>{
      fields.forEach(el=>{delete el.dataset.tleTouched;el.removeAttribute('aria-invalid');});
      render();
    }));
    // Existing demo submit handlers still control previews and success states.
    form.addEventListener('submit',()=>{
      fields.forEach(el=>{if(!el.checkValidity()) el.dataset.tleTouched='1';});
      render();
    },true);
    render();
  }
  function scan(root=document) {
    if (root.nodeType===1 && root.matches?.('form')) enhance(root);
    root.querySelectorAll?.('form').forEach(enhance);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scan(),{once:true});
  else scan();
  // A few demos render their contact forms inside an app after load.
  let scheduled=false;
  new MutationObserver(records=>{
    if (!records.some(rec=>[...rec.addedNodes].some(n=>n.nodeType===1))) return;
    if(scheduled)return;
    scheduled=true;
    queueMicrotask(()=>{scheduled=false;scan();});
  }).observe(document.documentElement,{childList:true,subtree:true});
})();
