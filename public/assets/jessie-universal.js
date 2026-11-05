/* The Launch Era — Jessie: two website packages only. No payment collection. */
(function () {
 'use strict';
 if(document.querySelector('[data-tle-jessie-universal]')) return;
 const es=document.documentElement.lang==='es';
 const t=es?{
  title:'Jessie · Tu guía de websites',open:'Pregúntale a Jessie',close:'Cerrar asistente',hello:'¡Hola! Soy Jessie. Te explico nuestros dos paquetes de website y automatizaciones para cualquier negocio.',placeholder:'Escribe tu pregunta…',send:'Enviar',
  basic:'El paquete de $15 incluye un website profesional, un formulario de contacto, cotización o solicitud de cita y avisos al correo que tú elijas.',
  advanced:'El paquete de $25 incluye lo anterior, más la configuración inicial de un asistente IA en la web, CRM automatizado y seguimiento de leads con el consentimiento adecuado.',
  prices:'Solo tenemos dos paquetes comerciales: Website para tu negocio por $15, y Website + Asistente IA + CRM automatizado por $25. Son precios por la configuración inicial acordada.',
  fees:'Hosting, dominio, servicios de IA y otras plataformas pueden tener costos adicionales. Te los explicamos antes de comenzar; no ofrecemos IA ilimitada.',
  other:'Podemos crear websites y automatizaciones para diferentes industrias. Cuéntanos qué necesita tu negocio y te ayudamos a definir un alcance realista.',
  custom:'Sí, podemos evaluar otras automatizaciones. Las integraciones avanzadas o adicionales requieren su propio alcance y precio acordado.',
  app:'La app personalizada es una opción aparte, discreta y no incluida en los dos paquetes principales.',
  booking:'Una solicitud no confirma una cita. Solo se confirma cuando el sistema autorizado verifica y registra disponibilidad.',
  q1:'¿Qué incluye $15?',q2:'¿Qué incluye $25?',q3:'¿Hay mensualidad?',q4:'¿Funciona para mi negocio?',more:'Ver paquetes',contact:'Contactar',legal:'No cobramos ni solicitamos tarjetas por el chat.'
 }:{
  title:'Jessie · Your website guide',open:'Ask Jessie',close:'Close assistant',hello:'Hi! I’m Jessie. Let me help you choose between our two website and automation packages for businesses in any industry.',placeholder:'Type your question…',send:'Send',
  basic:'The $15 package includes a professional website, a contact, quote or booking-request form, and notifications sent to the email you choose.',
  advanced:'The $25 package adds the agreed initial setup of an on-page AI assistant, automated CRM and consent-based lead follow-up, on top of the basic website.',
  prices:'We have only two current packages: Website for Your Business at $15, and Website + AI Assistant + Automated CRM at $25. Prices cover the agreed initial configuration.',
  fees:'Hosting, domain, AI providers and other services may have additional fees, disclosed before work begins. Unlimited AI use is not included.',
  other:'We work with businesses across industries. Share what your business needs and we can explain a realistic scope.',
  custom:'We can discuss additional automations, but complex or extra integrations require separately agreed scope and pricing.',
  app:'A custom business app is an optional separate service, not included in the two packages.',
  booking:'An inquiry does not confirm an appointment. Only a verified, recorded booking can confirm availability.',
  q1:'What does $15 include?',q2:'What does $25 include?',q3:'Are there monthly costs?',q4:'Can this work for my business?',more:'Explore packages',contact:'Contact us',legal:'No payments or card details are requested in this chat.'
 };
 const style=document.createElement('style');style.textContent=`
 .tle-jessie-v2{position:fixed;z-index:9998;bottom:20px;right:18px;font-family:Arial,sans-serif;color:#191919}
 .tle-jessie-v2 button,.tle-jessie-v2 input{font:inherit}
 .tle-jessie-open{border:1px solid #272727;background:#191919;color:#fff;border-radius:40px;box-shadow:0 9px 30px #0002;display:flex;align-items:center;gap:11px;padding:8px 18px 8px 8px;min-height:50px;cursor:pointer}
 .tle-jessie-open img{width:33px;height:33px;object-fit:cover;border-radius:50%;background:#dfeaf0}
 .tle-jessie-open b{font-size:12px;font-weight:700}
 .tle-jessie-panel{background:#FAF8F3;border:1px solid #d1ccc5;border-radius:20px;box-shadow:0 20px 80px #0002;width:min(350px,calc(100vw - 26px));height:min(555px,calc(100dvh - 115px));display:flex;flex-direction:column;overflow:hidden;margin-bottom:9px}
 .tle-jessie-panel[hidden]{display:none!important}
 .tle-jessie-panel-header{background:#dfeaf0;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px}
 .tle-jessie-panel-header b{font:700 14px/1.4 Arial,sans-serif}
 .tle-jessie-panel-header small{font-size:10px;color:#525252;display:block;margin-top:3px}
 .tle-jessie-panel-header button{border:0;background:none;font-size:21px;cursor:pointer;min-height:37px;min-width:37px}
 .tle-jessie-messages{padding:15px;overflow:auto;flex:1;display:flex;flex-direction:column;gap:10px}
 .tle-jessie-bubble{padding:12px 13px;border-radius:14px;background:#fff;border:1px solid #e2ded6;font-size:13px;line-height:1.55;max-width:93%;white-space:pre-wrap}
 .tle-jessie-bubble.user{background:#191919;color:#fff;align-self:flex-end;border-color:#191919}
 .tle-jessie-questions{padding:5px 12px 12px;display:flex;flex-wrap:wrap;gap:6px}
 .tle-jessie-questions button{border:1px solid #bab6ae;border-radius:50px;background:white;padding:9px 10px;font-size:11px;cursor:pointer}
 .tle-jessie-compose{display:flex;border-top:1px solid #dad4c9;gap:8px;padding:11px}
 .tle-jessie-compose input{flex:1;min-width:0;border:1px solid #bcb5ab;border-radius:99px;padding:10px 12px;background:#fff;color:#191919;font-size:12px}
 .tle-jessie-compose button{border:0;background:#F2D85B;color:#191919;border-radius:99px;padding:8px 13px;font-weight:700;font-size:12px;cursor:pointer}
 .tle-jessie-edges{display:flex;gap:14px;padding:0 16px 6px;align-items:center}
 .tle-jessie-edges a{color:#191919;font-size:11px;text-decoration:underline;text-underline-offset:3px}
 .tle-jessie-disclaimer{font-size:10px;color:#6a665f;padding:4px 15px 11px;margin:0}
 .tle-jessie-v2 :focus-visible{outline:3px solid #376b94;outline-offset:3px}
 @media(max-width:520px){.tle-jessie-v2{right:10px;bottom:calc(10px + env(safe-area-inset-bottom))}.tle-jessie-open{min-height:45px}.tle-jessie-panel{height:min(490px,calc(100dvh - 88px));max-width:calc(100vw - 20px)}}
 `;
 const root=document.createElement('section');root.dataset.tleJessieUniversal='1';root.className='tle-jessie-v2';root.setAttribute('aria-label',t.title);
 const open=document.createElement('button');open.className='tle-jessie-open';open.type='button';open.setAttribute('aria-expanded','false');
 const avatar=document.createElement('img');avatar.src='/assets/jessy-avatar.webp';avatar.alt='';const label=document.createElement('b');label.textContent=t.open;open.append(avatar,label);
 const panel=document.createElement('div');panel.className='tle-jessie-panel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');panel.setAttribute('aria-label',t.title);
 const top=document.createElement('div');top.className='tle-jessie-panel-header';const headline=document.createElement('div');const title=document.createElement('b');title.textContent=t.title;const small=document.createElement('small');small.textContent='The Launch Era';headline.append(title,small);
 const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label',t.close);top.append(headline,close);
 const messages=document.createElement('div');messages.className='tle-jessie-messages';messages.setAttribute('aria-live','polite');
 const questions=document.createElement('div');questions.className='tle-jessie-questions';
 const form=document.createElement('form');form.className='tle-jessie-compose';const input=document.createElement('input');input.name='question';input.type='text';input.placeholder=t.placeholder;input.required=true;input.maxLength=400;input.setAttribute('aria-label',t.placeholder);const send=document.createElement('button');send.type='submit';send.textContent=t.send;form.append(input,send);
 const links=document.createElement('div');links.className='tle-jessie-edges';const landing=es?'/es/website-for-your-business/':'/website-for-your-business';for(const [name,url] of [[t.more,landing+'#paquetes'],[t.contact,'/help']]){const a=document.createElement('a');a.href=url;a.textContent=name;links.append(a)}
 const note=document.createElement('p');note.className='tle-jessie-disclaimer';note.textContent=t.legal;
 panel.append(top,messages,questions,form,links,note);root.append(style,panel,open);document.body.append(root);
 function msg(text,user){const b=document.createElement('div');b.className='tle-jessie-bubble'+(user?' user':'');b.textContent=text;messages.append(b);messages.scrollTop=messages.scrollHeight}
 function reply(s){const q=s.toLowerCase();
  if(/\b15\b|basic|básico|primer paquete/.test(q))return t.basic;
  if(/\b25\b|crm|ai|asistente|assistant|inteligencia artificial/.test(q))return t.advanced;
  if(/precio|cost|price|cu[aá]nto|much|paquete|package/.test(q))return t.prices;
  if(/mensual|subscription|fee|extra|costo|hosting|domain|dominio/.test(q))return t.fees;
  if(/app|aplicaci[oó]n/.test(q))return t.app;
  if(/reserva|booking|appointment|cita|horario/.test(q))return t.booking;
  if(/otra|custom|integraci[oó]n|personalizad|other automation/.test(q))return t.custom;
  return t.other;
 }
 function ask(question){msg(question,true);msg(reply(question),false)}
 for(const q of [t.q1,t.q2,t.q3,t.q4]){const b=document.createElement('button');b.type='button';b.textContent=q;b.addEventListener('click',()=>ask(q));questions.append(b)}
 form.addEventListener('submit',e=>{e.preventDefault();const q=input.value.trim();if(q){ask(q);input.value=''}});
 function toggle(force){const show=force===undefined?panel.hidden:force;panel.hidden=!show;open.setAttribute('aria-expanded',String(show));if(show){input.focus();messages.scrollTop=messages.scrollHeight}}
 open.addEventListener('click',()=>toggle());close.addEventListener('click',()=>toggle(false));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)toggle(false)});
 msg(t.hello,false);
})();
