/* TLE Command Center — progressive access UI only.
   Authentication, tenant entitlement and password recovery remain in the existing app. */
(function(){
 function start(){
  const auth=document.getElementById('auth');
  if(!auth){initFallback();return;}
  const container=auth.querySelector('.auth-content'),form=document.getElementById('authForm');
  const signup=document.getElementById('signup'),submit=document.getElementById('signin');
  const forgot=document.getElementById('forgotPassword'),message=document.getElementById('authMessage');
  const heading=container?.querySelector('.auth-simple-title');
  if(!container||!form||!signup||!submit||!forgot||!message||!heading)return;
  if(document.getElementById('crm-auth-tabs'))return;
  const english=()=>{try{return localStorage.getItem('tle_crm_language')!=='es'}catch{return true}};
  const translate=(en,es)=>english()?en:es;
  const icon='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1"/></svg>';
  const floats=document.createElement('div');floats.className='crm-auth-floats';floats.setAttribute('aria-hidden','true');
  floats.innerHTML='<span><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg></span><span><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m6 16 5-6 3 3 3-4 3 5"/></svg></span><span><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M7 2v4m10-4v4M3 10h18"/></svg></span>';
  auth.prepend(floats);
  const lock=document.createElement('div');lock.className='crm-auth-lock';lock.setAttribute('aria-hidden','true');lock.innerHTML=icon;
  container.insertBefore(lock,container.firstChild);
  const restricted=new URLSearchParams(location.search).get('app')==='cb-depot'||
   new URLSearchParams(location.search).get('from')==='private-access';
  const tabs=document.createElement('div');tabs.id='crm-auth-tabs';tabs.className='crm-auth-tabs';
  tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Account access');
  const signinTab=document.createElement('button');signinTab.type='button';signinTab.setAttribute('aria-pressed','true');
  const signupTab=document.createElement('button');signupTab.type='button';signupTab.setAttribute('aria-pressed','false');
  tabs.append(signinTab);if(!restricted)tabs.append(signupTab);
  heading.before(tabs);
  const description=document.createElement('p');description.className='crm-auth-description';
  heading.after(description);
  const expired=document.createElement('p');expired.className='crm-auth-expired';expired.hidden=true;
  description.after(expired);
  const stage=document.createElement('section');stage.className='crm-email-stage';stage.hidden=true;
  stage.setAttribute('role','status');stage.setAttribute('aria-live','polite');
  stage.innerHTML='<div class="crm-email-art" aria-hidden="true"><span class="crm-email-envelope"><svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="m3 7 9 7 9-7"/></svg></span></div><h2></h2><p></p><strong></strong><button type="button" class="crm-email-resend"></button><button type="button" class="crm-email-back"></button>';
  form.after(stage);
  let mode='signin',pending='',mailKind='',readyAt=0,timer=null;
  function renderMode(){
   signinTab.textContent=translate('Sign in','Iniciar sesión');
   signupTab.textContent=translate('Create account','Crear cuenta');
   signinTab.setAttribute('aria-pressed',String(mode==='signin'));
   signupTab.setAttribute('aria-pressed',String(mode==='signup'));
   heading.textContent=mode==='signin'?translate('Welcome back.','Qué bueno verte.'):
    translate('Make space for your business.','Tu negocio, en un solo lugar.');
   description.textContent=mode==='signin'?
    translate('Your clients, bookings and work stay together in your private workspace.','Tus clientes, reservas y trabajos, en tu espacio privado.'):
    translate('Use the email linked to your business delivery. Access is verified before workspace data opens.','Usa el correo de entrega de tu negocio. Verificaremos tu acceso antes de abrir los datos.');
   submit.textContent=mode==='signin'?translate('Continue to my Command Center','Continuar a mi Command Center'):
    translate('Request my account','Solicitar mi cuenta');
   forgot.hidden=mode==='signup';
   const pass=form.elements.namedItem('password');
   if(pass)pass.minLength=mode==='signup'?8:6;
  }
  function showExpired(){
   let address='';try{address=sessionStorage.getItem('tle_crm_expired_email')||''}catch{}
   if(!address||auth.classList.contains('hidden'))return;
   const field=form.elements.namedItem('email');
   if(field&&!field.value)field.value=address;
   expired.hidden=false;
   expired.textContent=translate('Your session expired. Sign in again to continue where you left off.','Tu sesión venció. Inicia sesión nuevamente para continuar donde estabas.');
   heading.textContent=translate('Your session expired.','Tu sesión venció.');
  }
  function closeMail(){
   auth.removeAttribute('data-email-stage');stage.hidden=true;mailKind='';
   if(timer){clearInterval(timer);timer=null;}
  }
  function tick(){
   const wait=Math.max(0,Math.ceil((readyAt-Date.now())/1000));
   const resend=stage.querySelector('.crm-email-resend');
   resend.disabled=wait>0;resend.textContent=wait?
    translate('Resend in ','Reenviar en ')+wait+'s':translate('Resend email','Reenviar correo');
  }
  function showMail(kind){
   mailKind=kind;stage.hidden=false;auth.dataset.emailStage='true';
   const email=form.elements.namedItem('email')?.value||'';
   stage.querySelector('strong').textContent=email;
   stage.querySelector('h2').textContent=translate('Check your email.','Revisa tu correo.');
   stage.querySelector('p').textContent=kind==='signup'?
    translate('If your email is eligible, follow the confirmation instructions to activate your account.','Si tu correo puede registrarse, sigue las instrucciones para activar tu cuenta.'):
    translate('If your account exists, follow the secure password recovery link we sent.','Si tu cuenta existe, sigue el enlace seguro para recuperar la contraseña.');
   stage.querySelector('.crm-email-resend').hidden=false;
   stage.querySelector('.crm-email-back').textContent=translate('Back to sign in','Volver a iniciar sesión');
   readyAt=Date.now()+60000;tick();if(timer)clearInterval(timer);
   timer=setInterval(tick,1000);
   stage.querySelector('.crm-email-back').focus({preventScroll:true});
  }
  signinTab.addEventListener('click',()=>{mode='signin';closeMail();renderMode();showExpired()});
  signupTab.addEventListener('click',()=>{if(restricted)return;mode='signup';closeMail();renderMode();expired.hidden=true});
  form.addEventListener('submit',event=>{
   if(mode!=='signup'||restricted)return;
   if(!form.checkValidity())return;
   event.preventDefault();event.stopImmediatePropagation();pending='signup';
   signup.click(); // Existing Supabase signUp handler; no extra permission granted.
  },true);
  forgot.addEventListener('click',()=>{pending='reset'});
  signup.addEventListener('click',()=>{pending='signup'});
  const observer=new MutationObserver(()=>{
   const value=(message.textContent||'').toLowerCase();
   if(pending==='signup'&&/account request received|solicitud de cuenta recibida/.test(value)){
    showMail('signup');pending='';return;
   }
   if(pending==='reset'&&/password reset email|if an account exists|correo.*restablecer/.test(value)){
    showMail('reset');pending='';
   }
  });
  observer.observe(message,{childList:true,characterData:true,subtree:true});
  stage.querySelector('.crm-email-back').addEventListener('click',()=>{
   closeMail();mode='signin';renderMode();form.elements.namedItem('email')?.focus({preventScroll:true});
  });
  stage.querySelector('.crm-email-resend').addEventListener('click',()=>{
   if(!mailKind||Date.now()<readyAt)return;
   const kind=mailKind;
   readyAt=Date.now()+60000;tick();
   if(kind==='reset'){
     pending='reset';
     forgot.click(); // Existing password recovery handler and Supabase rate limit.
   }else if(kind==='signup'){
     const email=form.elements.namedItem('email')?.value?.trim()||'';
     if(email)window.dispatchEvent(new CustomEvent('tle-crm-resend-signup',{detail:{email}}));
   }
  });
  const role=new MutationObserver(()=>{
   if(document.body.classList.contains('crm-owner-view')||document.body.classList.contains('crm-buyer-view')){
    try{sessionStorage.removeItem('tle_crm_expired_email')}catch{}
   }else if(!auth.classList.contains('hidden'))showExpired();
  });
  role.observe(document.body,{attributes:true,attributeFilter:['class']});
  renderMode();showExpired();
  window.addEventListener('pageshow',showExpired);
 }
 function initFallback(){
  const form=document.getElementById('signin'),status=document.getElementById('status');
  const reset=document.getElementById('reset'),email=document.getElementById('email');
  if(!form||!status||!reset||!email)return;
  const content=document.querySelector('body.crm-auth-fallback main');
  if(!content)return;
  const title=content.querySelector('h1');
  const expiredKey='tle_crm_expired_email';
  let saved='';try{saved=sessionStorage.getItem(expiredKey)||''}catch{}
  if(saved){email.value=saved;title.textContent='Tu sesión venció.';const subtitle=content.querySelector('p');
   if(subtitle)subtitle.textContent='Entra con tu contraseña para continuar en tu Command Center privado.';}
  const box=document.createElement('div');box.className='crm-email-stage';box.hidden=true;box.setAttribute('role','status');
  box.innerHTML='<div class="crm-email-art" aria-hidden="true"><span class="crm-email-envelope"><svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="m3 7 9 7 9-7"/></svg></span></div><h2>Revisa tu correo.</h2><p>Si existe una cuenta, sigue las instrucciones para recuperar tu contraseña.</p><strong></strong><button type="button" class="crm-email-resend">Reenviar correo</button><button type="button" class="crm-email-back">Volver a iniciar sesión</button>';
  status.after(box);
  let deadline=0,timer;
  const repaint=()=>{const left=Math.max(0,Math.ceil((deadline-Date.now())/1000)),btn=box.querySelector('.crm-email-resend');btn.disabled=left>0;btn.textContent=left?'Reenviar en '+left+'s':'Reenviar correo'};
  const obs=new MutationObserver(()=>{
   if(/Si existe una cuenta con ese correo, recibir[aá]s instrucciones/.test(status.textContent||'')){
    box.querySelector('strong').textContent=email.value.trim();
    form.hidden=true;reset.hidden=true;box.hidden=false;deadline=Date.now()+60000;
    repaint();if(timer)clearInterval(timer);timer=setInterval(repaint,1000);
   }
  });
  obs.observe(status,{childList:true,characterData:true,subtree:true});
  box.querySelector('.crm-email-back').onclick=()=>{
   box.hidden=true;form.hidden=false;reset.hidden=false;if(timer)clearInterval(timer);
  };
  box.querySelector('.crm-email-resend').onclick=()=>{
   if(Date.now()<deadline)return;
   deadline=Date.now()+60000;repaint();reset.click();
  };
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();
