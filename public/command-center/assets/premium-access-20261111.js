/* Presentation only. The existing Command Center auth and RLS gates remain authoritative. */
(function(){
 'use strict';
 const auth=document.getElementById('auth'),form=document.getElementById('authForm');
 if(!auth||!form)return;
 auth.classList.add('tle-access-shell');
 const content=auth.querySelector('.auth-content');
 const title=auth.querySelector('.auth-simple-title');
 const submit=document.getElementById('signin');
 const signup=document.getElementById('signup');
 const forgot=document.getElementById('forgotPassword');
 const status=document.getElementById('authMessage');
 const email=form.elements.namedItem('email');
 const password=form.elements.namedItem('password');
 if(!content||!title||!submit||!signup||!forgot||!status||!email||!password)return;

 const visual=document.createElement('div');
 visual.innerHTML='<div class="tle-access-lock" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1"/></svg></div><p class="tle-access-kicker">YOUR PRIVATE WORKSPACE</p><div class="tle-access-modes" role="group" aria-label="Sign in or create an account"><button type="button" data-access-mode="signin" aria-pressed="true">Sign in</button><button type="button" data-access-mode="signup" aria-pressed="false">Create account</button></div><p class="tle-access-desc">Everything your business needs, in one organized space.</p><p class="tle-access-expired-note" hidden></p><section class="tle-access-email-stage" hidden aria-live="polite"><div class="tle-access-email-art" aria-hidden="true"><span class="tle-access-envelope"><svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="m3 7 9 7 9-7"/></svg></span></div><h2>Check your email.</h2><p>Follow the instructions sent to your account email.</p><strong></strong><button type="button" data-email-resend>Resend email</button><button type="button" data-email-back>Back to sign in</button></section>';
 const modeNodes=visual.querySelector('.tle-access-modes');
 const desc=visual.querySelector('.tle-access-desc');
 const expired=visual.querySelector('.tle-access-expired-note');
 const stage=visual.querySelector('.tle-access-email-stage');
 const stageTitle=stage.querySelector('h2');
 const stageText=stage.querySelector('p');
 const stageEmail=stage.querySelector('strong');
 const resend=stage.querySelector('[data-email-resend]');
 const back=stage.querySelector('[data-email-back]');
 content.insertBefore(visual,content.querySelector('.auth-simple-title'));
 title.insertAdjacentElement('afterend',desc);
 const signinTab=modeNodes.querySelector('[data-access-mode="signin"]');
 const signupTab=modeNodes.querySelector('[data-access-mode="signup"]');
 let currentMode='signin',lastKind='',readyAt=0,timer=null;
 function language(){try{return localStorage.getItem('tle_crm_language')==='es'?'es':'en'}catch{return'en'}}
 function copy(en,es){return language()==='es'?es:en}
 function isSignupAllowed(){return !signup.classList.contains('hidden')}
 function setMode(mode){
   if(mode==='signup'&&!isSignupAllowed())return;
   currentMode=mode;auth.dataset.authMode=mode;
   signinTab.setAttribute('aria-pressed',String(mode==='signin'));
   signupTab.setAttribute('aria-pressed',String(mode==='signup'));
   const isSignup=mode==='signup';
   title.textContent=isSignup?copy('Make it yours.','Crea tu cuenta.'):copy('Welcome back.','Qué gusto verte.');
   desc.textContent=isSignup?
      copy('Use the email associated with your business purchase. Access is verified before opening a workspace.',
       'Usa el correo de tu compra. Verificamos tu acceso antes de abrir un espacio.'):
      copy('Your clients, quotes and bookings in one place.','Tus clientes, cotizaciones y reservas en un solo lugar.');
   submit.textContent=isSignup?copy('Create my account','Crear mi cuenta'):copy('Continue to my Command Center','Entrar a mi Command Center');
   password.autocomplete=isSignup?'new-password':'current-password';
   password.minLength=isSignup?8:6;
   forgot.hidden=isSignup;
   form.style.animation='none';void form.offsetWidth;form.style.animation='';
 }
 signinTab.addEventListener('click',()=>setMode('signin'));
 signupTab.addEventListener('click',()=>setMode('signup'));

 function refreshExpired(){
   let saved='';try{saved=sessionStorage.getItem('tle_crm_expired_email')||''}catch{}
   if(saved&&!email.value){email.value=saved;auth.classList.add('tle-access-expired')}
   else if(!saved)auth.classList.remove('tle-access-expired');
   expired.hidden=!saved;
   if(saved){
    expired.textContent=copy(
      'Your session expired. Sign in again to continue securely; your customer data remains private.',
      'Tu sesión venció. Entra de nuevo para continuar de forma segura; los datos de tus clientes siguen privados.'
    );
    signupTab.hidden=true;
   }else signupTab.hidden=!isSignupAllowed();
 }
 function refreshCountdown(){
   const left=Math.max(0,Math.ceil((readyAt-Date.now())/1000));
   resend.disabled=left>0;
   resend.textContent=left?copy('Resend in ','Reenviar en ')+left+'s':copy('Resend email','Reenviar correo');
 }
 function checkEmail(kind){
  lastKind=kind;auth.dataset.emailStage='true';stage.hidden=false;
  stageTitle.textContent=copy('Check your email.','Revisa tu correo.');
  stageText.textContent=kind==='signup'?
    copy('If your account is eligible, follow the confirmation email to activate it.',
      'Si tu cuenta cumple los requisitos, sigue el correo de confirmación para activarla.'):
    copy('If an account exists, follow the secure password recovery instructions.',
      'Si existe una cuenta, sigue las instrucciones de recuperación segura.');
  stageEmail.textContent=email.value.trim();
  readyAt=Date.now()+60000;refreshCountdown();
  if(timer)clearInterval(timer);timer=setInterval(refreshCountdown,1000);
  back.focus({preventScroll:true});
 }
 function clearEmail(){
   auth.removeAttribute('data-email-stage');stage.hidden=true;lastKind='';
   if(timer){clearInterval(timer);timer=null;}
   setMode('signin');
 }
 back.addEventListener('click',clearEmail);
 resend.addEventListener('click',()=>{
   if(Date.now()<readyAt||!lastKind)return;
   readyAt=Date.now()+60000;refreshCountdown();
   if(lastKind==='reset')forgot.click();
   else if(lastKind==='signup')signup.click();
 });
 const observer=new MutationObserver(()=>{
   if(auth.classList.contains('hidden'))return;
   const t=status.textContent||'';
   if(auth.dataset.emailStage!=='true'){
     if(t.includes('If an account exists, a password reset email will arrive shortly.'))checkEmail('reset');
     if(t.includes('Account request received. Check your inbox'))checkEmail('signup');
   }
   refreshExpired();
 });
 observer.observe(status,{subtree:true,childList:true,characterData:true});
 const classObserver=new MutationObserver(()=>{if(!signupTab.hidden&&!isSignupAllowed())signupTab.hidden=true;});
 classObserver.observe(signup,{attributes:true,attributeFilter:['class']});
 window.addEventListener('pageshow',refreshExpired);
 window.addEventListener('storage',refreshExpired);
 refreshExpired();setMode('signin');
})();
