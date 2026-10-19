/* Optional live-business assistant. Demo and owner preview never mount or submit here. */
(()=>{'use strict';
const params=new URLSearchParams(location.search),key=params.get('key')||'';
if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)||params.has('owner_preview')||window.self!==window.top)return;
const endpoint='https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-customer-assistant';
const es=params.get('lang')==='es',language=es?'es':'en',t=(en,spanish)=>es?spanish:en;
const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
let current={},history=[],reference='',fingerprint='',busy=false,submitted=false,config=null;
async function api(action,extra={}){
 const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,booking_key:key,language,...extra}),signal:AbortSignal.timeout(28000)});
 const result=await response.json();
 if(!response.ok||result.ok!==true)throw Error(result.error||t('Please try again.','Intenta nuevamente.'));
 return result;
}
async function start(){
 try{config=await api('config')}catch{return} // A disabled module creates no floating control.
 if(!Array.isArray(config.services)||!config.services.length)return;
 const css=make('link');css.rel='stylesheet';css.href='/assets/tle-customer-assistant.css?v=20261019-v1';document.head.append(css);
 const launch=make('button','tca-launch',t('Chat with the assistant','Hablar con el asistente'));launch.type='button';launch.setAttribute('aria-haspopup','dialog');launch.setAttribute('aria-expanded','false');
 const panel=make('section','tca-panel');panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label',t('Booking assistant','Asistente de reservas'));
 const head=make('header','tca-head');const identity=make('div');identity.append(make('strong','',config.business),make('small','',t('Here to help with your request','Te ayudamos con tu solicitud')));
 const close=make('button','tca-close','×');close.type='button';close.setAttribute('aria-label',t('Close assistant','Cerrar asistente'));head.append(identity,close);
 const log=make('div','tca-log');log.setAttribute('role','log');log.setAttribute('aria-live','polite');
 const notice=make('p','tca-notice',t('Your messages are processed by AI. Only the details you review and submit are sent to this business.','Tus mensajes se procesan con IA. El negocio recibe los datos que revises y envíes.'));
 const status=make('p','tca-status');status.setAttribute('role','status');
 const chat=make('form','tca-chat');const input=make('textarea');input.rows=1;input.maxLength=500;input.required=true;input.placeholder=t('How can we help?','¿Cómo podemos ayudarte?');input.setAttribute('aria-label',input.placeholder);
 const send=make('button','',t('Send','Enviar'));send.type='submit';chat.append(input,send);
 const reviewButton=make('button','tca-review-button',t('Review my request','Revisar mi solicitud'));reviewButton.type='button';
 const review=make('form','tca-review');review.hidden=true;
 review.append(make('h3','',t('Review your request','Revisa tu solicitud')),make('p','tca-notice',t('This is a request. The business confirms the time and price. No payment is collected.','Esto es una solicitud. El negocio confirma el horario y el precio. No se cobra ningún pago.')));
 const fields=new Map();
 function field(name,label,type='text',required=true){
  const labelNode=make('label','',label),control=make(name==='service_id'?'select':'input');control.name=name;control.required=required;
  if(control.tagName==='INPUT'){control.type=type;control.maxLength=name==='address'?350:200;control.autocomplete=({customer_name:'name',customer_email:'email',customer_phone:'tel',address:'street-address',city:'address-level2',state:'address-level1',zip:'postal-code'})[name]||'off'}
  if(name==='service_id'){const blank=make('option','',t('Choose a service','Selecciona un servicio'));blank.value='';control.append(blank);for(const s of config.services){const opt=make('option','',s.name);opt.value=s.id;control.append(opt)}}
  if(name==='date')control.min=new Date(Date.now()-86400000).toISOString().slice(0,10);
  labelNode.append(control);fields.set(name,control);review.append(labelNode);return control;
 }
 field('service_id',t('Service','Servicio'));
 field('property_type',t('Home or business space (Other is welcome)','Tipo de casa o negocio (puedes indicar Otro)'));
 field('customer_name',t('Full name','Nombre completo'));
 field('customer_email','Email','email');field('customer_phone',t('Phone','Teléfono'),'tel');
 field('address',t('Street address, including unit','Dirección, incluyendo apartamento'));
 field('city',t('City','Ciudad'));field('state',t('State','Estado'));field('zip',t('ZIP code','Código postal')).pattern='[0-9]{5}(-[0-9]{4})?';
 field('date',t('Preferred date','Fecha preferida'),'date');field('time',t('Preferred time','Horario preferido'),'time');
 field('notes',t('Anything else? (optional)','¿Algo más? (opcional)'),'text',false);
 const confirmLabel=make('label','tca-consent');const confirmed=make('input');confirmed.type='checkbox';confirmed.required=true;confirmed.name='confirmed';
 confirmLabel.append(confirmed,document.createTextNode(t('I reviewed these details and want to send this request and my recent conversation to this business.','Revisé los datos y quiero enviar esta solicitud y mi conversación reciente al negocio.')));review.append(confirmLabel);
 const submit=make('button','tca-submit',t('Send my request','Enviar mi solicitud'));submit.type='submit';const back=make('button','tca-back',t('Back to chat','Volver al chat'));back.type='button';review.append(submit,back);
 const body=make('div','tca-body');body.append(log,notice,review,status);
 const footer=make('div','tca-foot');footer.append(chat,reviewButton);
 panel.append(head,body,footer);document.body.append(panel,launch);
 function add(role,text){const msg=make('p','tca-message tca-'+role,text);log.append(msg);log.scrollTop=log.scrollHeight;return msg}
 add('assistant',t('Hi! What service do you need help with?','¡Hola! ¿Qué servicio necesitas?'));
 function viewport(){if(innerWidth<=600)panel.style.height=(window.visualViewport?.height||innerHeight)+'px';else panel.style.removeProperty('height')}
 window.visualViewport?.addEventListener('resize',viewport);window.addEventListener('resize',viewport);
 function open(value){panel.hidden=!value;launch.setAttribute('aria-expanded',String(value));if(value){viewport();close.focus()}else launch.focus()}
 function lock(value){busy=value;send.disabled=value||submitted;input.disabled=value||submitted;reviewButton.disabled=value||submitted;submit.disabled=value||submitted;back.disabled=value;close.disabled=value}
 launch.onclick=()=>open(panel.hidden);close.onclick=()=>open(false);
 panel.addEventListener('keydown',e=>{if(e.key==='Escape'&&!busy){e.preventDefault();open(false)}});
 reviewButton.onclick=()=>{for(const [name,control]of fields)control.value=current[name]||'';confirmed.checked=false;review.hidden=false;log.hidden=true;notice.hidden=true;footer.hidden=true;fields.get('service_id').focus();status.textContent=''};
 back.onclick=()=>{for(const [name,control]of fields)current[name]=control.value;review.hidden=true;log.hidden=false;notice.hidden=false;footer.hidden=false;input.focus();status.textContent=''};
 input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();chat.requestSubmit()}});
 chat.onsubmit=async e=>{
  e.preventDefault();if(busy||submitted)return;const message=input.value.trim();if(!message)return;
  lock(true);const question=add('user',message);input.value='';status.textContent=t('Thinking…','Un momento…');
  try{const result=await api('message',{message,draft:current,history});current=result.draft||current;add('assistant',result.reply);history.push({role:'user',content:message},{role:'assistant',content:result.reply});history=history.slice(-12);status.textContent=''}
  catch(error){question.remove();input.value=message;status.textContent=error.message+' '+t('You can use the booking form on this page.','Puedes usar el formulario de reservas de esta página.')}
  finally{lock(false);input.focus()}
 };
 review.onsubmit=async e=>{
  e.preventDefault();if(busy||submitted||!review.reportValidity())return;
  for(const [name,control]of fields)current[name]=control.value.trim();
  const next=JSON.stringify({draft:current,history});
  // The reference survives ambiguous network failures. Edits create a new, deliberate request.
  if(next!==fingerprint){reference='req_'+crypto.randomUUID();fingerprint=next}
  lock(true);for(const control of fields.values())control.disabled=true;confirmed.disabled=true;status.textContent=t('Sending your request…','Enviando tu solicitud…');
  try{
   const result=await api('submit',{draft:current,history,confirmed:confirmed.checked,external_ref:reference});
   submitted=true;review.hidden=true;footer.hidden=true;log.hidden=false;log.replaceChildren();
   add('assistant',t('Your request was received. Your appointment is not confirmed yet.','Recibimos tu solicitud. Tu cita todavía no está confirmada.'));
   status.textContent=result.customer_email_accepted?t('The receipt email was accepted for sending. The business will review your request.','El comprobante se aceptó para envío. El negocio revisará tu solicitud.'):t('Your request was saved, but we could not verify the receipt email. Please contact the business for an update.','Se guardó tu solicitud, pero no pudimos verificar el correo. Contacta al negocio para recibir novedades.');
   const referenceText=make('p','tca-notice',t('Request reference: ','Referencia: ')+result.request_id);log.append(referenceText);
  }catch(error){status.textContent=error.message+' '+t('Your details are still here. Retry without changing them to avoid another request.','Tus datos siguen aquí. Reintenta sin cambiarlos para evitar otra solicitud.');for(const control of fields.values())control.disabled=false;confirmed.disabled=false}
  finally{lock(false);if(submitted)close.focus()}
 };
}
void start();
})();
