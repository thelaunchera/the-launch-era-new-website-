/* Public Dailin Vault inquiry. Uses existing secured TLE contact backend;
 * no Make webhooks, keys, private accounts or customer data are embedded here. */
(function(){
 "use strict";
 const form=document.getElementById("vault-inquiry-form");
 if(!form)return;
 const es=document.documentElement.lang==="es";
 const startedAt=Date.now();
 let busy=false;
 const status=document.getElementById("vault-inquiry-status");
 const button=form.querySelector('button[type="submit"]');
 const defaultLabel=button.textContent;
 const say=(text,error=false)=>{
   status.textContent=text;
   status.classList.toggle("is-error",error);
   status.classList.toggle("is-success",!error&&!!text);
 };
 form.addEventListener("submit",async event=>{
   event.preventDefault();
   if(busy)return;
   if(!form.reportValidity()){
     say(es?"Revisa los campos marcados antes de enviarlo.":"Please complete the required fields.",true);
     return;
   }
   const values=new FormData(form);
   const name=String(values.get("name")||"").trim();
   const email=String(values.get("email")||"").trim();
   const service=String(values.get("service")||"").trim();
   const message=String(values.get("message")||"").trim();
   const business=String(values.get("business")||"").trim();
   if(!name||!email||!service||!message||values.get("consent")!=="on"){
     say(es?"Completa tu nombre, correo, el tipo de ayuda y el mensaje.":"Please complete your name, email, topic and message.",true);
     return;
   }
   const payload={
     name,email,business_name:business,
     help_needed:[service],
     message,
     preferred_contact:"email",
     source:es?"vault_inquiry_es":"vault_inquiry",
     language:es?"es":"en",
     website:String(values.get("website")||"").trim(),
     started_at:startedAt
   };
   busy=true;button.disabled=true;
   button.textContent=es?"Enviando solicitud…":"Sending inquiry…";
   say(es?"Enviando tu solicitud…":"Submitting your inquiry…");
   const controller=new AbortController();
   const timeout=setTimeout(()=>controller.abort(),22000);
   try{
     const response=await fetch("https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-contact",{
       method:"POST",mode:"cors",headers:{"Content-Type":"application/json"},
       body:JSON.stringify(payload),signal:controller.signal
     });
     const result=await response.json().catch(()=>({}));
     if(!response.ok||!result.ok)throw new Error(result.error||(es?"No pudimos procesar la solicitud.":"Unable to process your inquiry."));
     form.classList.add("is-sent");
     form.innerHTML='<div class="vault-inquiry-success" role="status"><span aria-hidden="true">✓</span><h3>'+
       (es?"¡Ya tenemos tu solicitud!":"We received your inquiry!")+'</h3><p>'+
       (es?"La registramos correctamente. Vamos a revisarla y te responderemos por correo. Esta confirmación no significa que ya haya una consulta agendada.":"Your inquiry has been recorded. We’ll review it and reply by email. No meeting has been booked yet.")+
       '</p><p class="vault-inquiry-small">'+
       (result.email_sent?(es?"También solicitamos el envío del correo de confirmación.":"A confirmation email has been queued for sending."):(es?"Si no recibes el correo de confirmación, tu solicitud igualmente quedó registrada.":"Even if no confirmation email arrives, your inquiry is saved."))+
       '</p></div>';
   }catch(error){
     const fallback=es?"Hubo un problema al enviar la solicitud. Vuelve a intentarlo.":"There was a problem submitting your inquiry. Please try again.";
     say(error.name==="AbortError"?(es?"La conexión tardó demasiado. Verifica tu correo antes de enviarlo otra vez.":"The connection timed out. Check your email before retrying."):String(error.message||fallback),true);
     busy=false;button.disabled=false;button.textContent=defaultLabel;
   }finally{clearTimeout(timeout);}
 });
})();