
/* The Launch Era resource library.
 * Original photo prompts, curated freebie teasers, and isolated double opt-in.
 * No user email is sent by this script; subscription is handled by an edge function.
 */
(function(){
 "use strict";
 const es=document.documentElement.lang==="es";
 const t=es?{
 eyebrow:"BIBLIOTECA DE RECURSOS",title:"Un espacio para <em>crear más.</em>",
 intro:"Aquí encuentras prompts de fotografía, ejemplos para practicar y recursos que estarán disponibles más adelante.",
 search:"Buscar recursos",filters:["Todo","Freebies","Prompts de fotos","Próximamente"],available:"DISPONIBLE",soon:"PRÓXIMAMENTE",
 view:"Abrir recurso",copy:"Copiar prompt",copied:"¡Copiado!",select:"Selecciona y copia el prompt",
 preview:"Ver los prompts",notify:"Avísame",empty:"No encontramos recursos con esa búsqueda.",
 photoEyebrow:"FOTOGRAFÍA CON IA / PARA COPIAR",photoTitle:"Crea fotos que se sientan <em>como tu marca.</em>",
 photoIntro:"Prompts listos para adaptar. Elige el que necesitas y sigue las instrucciones debajo de cada uno. No necesitas saber diseñar.",
 futureTitle:"Lo que viene después",futureDesc:"Los próximos packs están preparados o en producción. No mostramos descargas hasta que estén publicados.",
 futureButton:"Quiero recibir el aviso",
 subEyebrow:"FREEBIES EN TU INBOX",subTitle:"Entérate cuando salga un nuevo freebie.",
 subIntro:"Un correo solo cuando publique una nueva guía, un pack de prompts o un recurso gratuito. Sin mensajes promocionales ajenos al tema.",
 email:"Tu correo electrónico",consent:"Quiero recibir avisos de nuevos recursos gratuitos de The Launch Era. Podré darme de baja cuando quiera.",
 submit:"Quiero recibir los freebies",hint:"Te enviamos un correo para confirmar la suscripción. Solo quedas en la lista después de confirmarlo.",
 privacy:"Política de privacidad",pending:"Revisa tu correo y confirma la suscripción para recibir los próximos freebies.",
 error:"No se pudo procesar la solicitud. Inténtalo de nuevo.",invalid:"Escribe un correo válido y acepta recibir avisos de freebies.",
 confirmTitle:"Confirma tu suscripción",confirmBody:"Confirma que deseas recibir correos cuando publiquemos nuevos freebies.",confirmButton:"Confirmar suscripción",confirmed:"Suscripción confirmada. Ya recibirás avisos de nuevos freebies.",
 unsubTitle:"Cancelar avisos de freebies",unsubBody:"Pulsa el botón para dejar de recibir avisos.",unsubButton:"Darme de baja",unsubscribed:"Ya no recibirás avisos de freebies.",
 expired:"El enlace no es válido o ha caducado. Solicita otro desde el formulario."
 }:{
 eyebrow:"FREE CREATIVE RESOURCES",title:"A little library for <em>big ideas.</em>",
 intro:"Find photo prompts, examples you can try and previews of upcoming resources—without searching through repeated guides.",
 search:"Search resources",filters:["All","Freebies","Photo prompts","Coming soon"],available:"AVAILABLE",soon:"COMING SOON",
 view:"Open resource",copy:"Copy prompt",copied:"Copied!",select:"Select and copy the prompt",
 preview:"See the prompts",notify:"Notify me",empty:"No resources match your search.",
 photoEyebrow:"AI PHOTOGRAPHY / COPY READY",photoTitle:"Create images that feel <em>like your brand.</em>",
 photoIntro:"Ready-to-adapt photo prompts. Choose a result and follow the instructions below each example. No design experience is required.",
 futureTitle:"Next in the library",futureDesc:"Future packs are prepared or in production. Download buttons appear only when a resource is published.",
 futureButton:"Get release alerts",
 subEyebrow:"GOOD THINGS IN YOUR INBOX",subTitle:"Know when a new freebie drops.",
 subIntro:"One email only when a free guide, photo prompt pack or creative resource is published. No unrelated promotional campaigns.",
 email:"Email address",consent:"I want email alerts for new free resources from The Launch Era. I can unsubscribe at any time.",
 submit:"Notify me about freebies",hint:"We send an email confirmation link. You're on the list only after confirming.",
 privacy:"Privacy policy",pending:"Check your inbox and confirm your subscription to receive freebie alerts.",
 error:"Your request could not be processed. Please try again.",invalid:"Enter a valid email and agree to receive freebie alerts.",
 confirmTitle:"Confirm your subscription",confirmBody:"Confirm that you want to receive new freebie alerts.",confirmButton:"Confirm subscription",confirmed:"Subscription confirmed. You'll receive alerts about new freebies.",
 unsubTitle:"Stop freebie alerts",unsubBody:"Click below to stop receiving emails.",unsubButton:"Unsubscribe",unsubscribed:"You're unsubscribed from future freebie alerts.",
 expired:"The link is invalid or has expired. Request a new one from the form."
 };
 const items=es?[
 {type:"photo",status:"live",art:"photo",eyebrow:"FOTO REAL",name:"Fotografía editorial de producto",desc:"Un producto, su empaque real y luz de estudio sin inventar logos.",href:"#prompts-fotos"},
 {type:"photo",status:"live",art:"photo",eyebrow:"RETRATO",name:"Retrato de fundadora",desc:"Mantén tu cara, pelo, proporciones y estilo al crear retratos.",href:"#prompts-fotos"},
 {type:"soon",status:"soon",art:"web",eyebrow:"WEB CON IA",name:"Tu web con un solo prompt",desc:"Un prompt maestro para construir la primera web de tu negocio.",href:"#suscripcion"},
 {type:"soon",status:"soon",art:"photo",eyebrow:"LAVENDER EDIT",name:"The Lavender Edit",desc:"Fotografías publicitarias de producto con prompts originales.",href:"#suscripcion"},
 {type:"soon",status:"soon",art:"photo",eyebrow:"SALT LINE",name:"SALT LINE",desc:"Pack de fotografía macro y belleza editorial coherente.",href:"#suscripcion"},
 {type:"soon",status:"soon",art:"motion",eyebrow:"MOTION",name:"Biblioteca de Motion Graphics",desc:"Efectos en movimiento y prompts para usarlos en videos.",href:"#suscripcion"},
 ]:[
 {type:"photo",status:"live",art:"photo",eyebrow:"REAL PRODUCT",name:"Editorial product photography",desc:"Keep the real product packaging, studio light and original brand details.",href:"#prompts-fotos"},
 {type:"photo",status:"live",art:"photo",eyebrow:"PORTRAIT",name:"Founder portrait starter",desc:"Keep your face, hair, features and own personal style.",href:"#prompts-fotos"},
 {type:"soon",status:"soon",art:"web",eyebrow:"AI WEBSITE",name:"Your website in one prompt",desc:"A reusable master prompt for a first small-business website.",href:"#suscripcion"},
 {type:"soon",status:"soon",art:"photo",eyebrow:"LAVENDER EDIT",name:"The Lavender Edit",desc:"Original prompts for product advertising photography.",href:"#suscripcion"},
 {type:"soon",status:"soon",art:"photo",eyebrow:"SALT LINE",name:"SALT LINE",desc:"Consistent macro beauty and editorial photography pack.",href:"#suscripcion"},
 {type:"soon",status:"soon",art:"motion",eyebrow:"MOTION",name:"Motion Graphics Library",desc:"Animated effects and reusable video prompt directions.",href:"#suscripcion"},
 ];
 const photo=es?[
 {type:"PRODUCTO",title:"Una foto de producto premium",prompt:"Usa la foto real que adjunto como referencia exacta de mi producto. Crea una fotografía editorial publicitaria vertical 4:5. Respeta la forma, el color, la tapa, el material y el logo real. Coloca una sola unidad sobre superficie marfil con luz natural lateral suave, sombras creíbles y un toque azul claro en el fondo. Deja espacio libre para añadir un título después. No inventes envases, etiquetas, ingredientes ni beneficios. Sin texto ni marcas de agua."},
 {type:"RETRATO",title:"Un retrato que se parezca a ti",prompt:"Usa mi retrato autorizado como referencia exacta de identidad. Crea una foto editorial natural para mi web. Conserva rostro, proporciones, tono de piel, ojos, largo y color del cabello. Miro a cámara con expresión segura y relajada. Ropa casual moderna; no pongas las manos en la cara. Luz suave de ventana y fondo azul pálido. Fotografía vertical 4:5 de hombros y torso. Sin cambiar facciones, sin piel plástica, sin texto ni marca de agua."},
 {type:"HERO DE WEB",title:"Una foto con espacio para el título",prompt:"Usa mi fotografía de referencia de [PERSONA O PRODUCTO REAL] para crear un hero de website. Conserva la identidad original de la persona o producto. Sitúa el protagonista en el tercio derecho, con iluminación indirecta, fondo marfil y azul claro ligeramente texturizado, sombras naturales y espacio libre a la izquierda para el texto. Composición horizontal 16:9 y recorte central seguro para móvil. Sin etiquetas falsas, objetos inventados ni letras dentro de la imagen."}
 ]:[
 {type:"PRODUCT",title:"The premium product hero",prompt:"Use my attached real product photo as the exact reference. Make a premium editorial product photograph, vertical 4:5. Preserve the original shape, color, closure, materials and logo. Place one product on a warm ivory surface with soft side daylight, believable shadows and a pale-blue background accent. Leave negative space for later copy. Do not invent packaging, labels, ingredients or claims. No embedded text or watermark."},
 {type:"PORTRAIT",title:"A portrait that still looks like you",prompt:"Use my authorized portrait as the exact identity reference. Create a natural editorial founder portrait for a website. Keep the same facial features, proportions, skin tone, eyes and hair length and color. Look directly at camera with a calm confident expression. Modern casual clothing; no hands touching the face. Soft window lighting and a pale-blue backdrop, vertical 4:5, shoulders and upper torso visible. No facial reshaping, plastic skin, text or watermark."},
 {type:"WEBSITE HERO",title:"Room for your headline",prompt:"Use my reference photograph of [REAL PERSON OR PRODUCT] for a premium mobile-first website hero. Preserve the original person or product faithfully. Place the main subject in the right third, with indirect natural light, a subtly textured ivory and pale-blue background, realistic shadows and generous space on the left for a headline. Horizontal 16:9 with a safe center crop for phones. Do not add invented objects, fake labels or typography."}
 ];
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const library=document.getElementById("guias");if(!library)return;
 const cards=items.map((item,i)=>{
  const a=escape(item.href),external=item.href.startsWith("https:"),status=item.status==="soon"?t.soon:t.available;
  const action=item.status==="soon"?t.notify:item.type==="photo"?t.preview:t.view;
  return '<article class="tle-resource-card" data-type="'+item.type+'" data-search="'+escape((item.name+" "+item.desc+" "+item.eyebrow).toLowerCase())+'">'+
   '<div class="tle-resource-cover tle-resource-cover--'+item.art+'"><strong>'+escape(item.eyebrow)+'</strong></div>'+
   '<div class="tle-resource-info"><div class="tle-resource-meta"><span>'+escape(item.type==="soon"?t.filters[3]:item.type==="photo"?t.filters[2]:t.filters[1])+'</span><b class="'+(item.status==="soon"?"soon":"")+'">'+status+'</b></div>'+
   '<h3>'+escape(item.name)+'</h3><p>'+escape(item.desc)+'</p><a href="'+a+'"'+(external?' target="_blank" rel="noopener noreferrer"':'')+'>'+escape(action)+'</a></div></article>';
 }).join("");
 // Only show categories that still have items; the removed freebie no longer creates an empty tab.
 const filters=[["all",0],["photo",2],["soon",3]].map(([name,labelIndex])=>'<button type="button" data-tle-filter="'+name+'" aria-pressed="'+(name==="all"?'true':'false')+'">'+escape(t.filters[labelIndex])+'</button>').join("");
 const helpItems=es?[
  ["Prepara una foto real de tu producto donde se vean claramente el logo y el empaque.","Copia el prompt en tu herramienta de IA y adjunta esa foto. Cambia la iluminación o los colores de fondo según tu marca.","Revisa que el logo, el texto, la forma y los materiales sean fieles antes de publicar la imagen."],
  ["Elige un retrato nítido de la persona que aparecerá y asegúrate de tener su autorización.","Adjunta la foto y copia el prompt. Ajusta la ropa, el fondo o la luz sin pedir que cambien sus facciones.","Compara ojos, rostro, cabello y proporciones con la fotografía original antes de usar el resultado."],
  ["Adjunta la fotografía real de tu producto o de la persona protagonista.","Reemplaza [PERSONA O PRODUCTO REAL] por una descripción específica; pide espacio libre para el título de tu web.","Genera una imagen horizontal y comprueba también el recorte en celular. Agrega el texto directamente en tu sitio, no dentro de la foto."]
 ]:[
  ["Use a sharp, real product photo that clearly shows its logo and packaging.","Attach the photo, paste the prompt into your AI tool, and adapt the light or background to your brand.","Check the logo, label, colors and physical details against your original photo before publishing."],
  ["Choose a clear authorized portrait of the person you want to show.","Attach it, paste the prompt and change the clothing or lighting without changing the person's facial features.","Compare the face, hair, eyes and proportions against the real portrait before you publish."],
  ["Attach an actual reference photo of the product or person you want as the hero subject.","Replace [REAL PERSON OR PRODUCT] with an accurate description and request space for your website headline.","Generate a wide image, then check the mobile crop. Add the actual headline as live website text, not as letters inside the image."]
 ];
 const photoCards=photo.map((x,i)=>{
  const li=helpItems[i].map(t=>'<li>'+escape(t)+'</li>').join("");
  return '<article class="tle-prompt-card"><span>'+escape(x.type)+'</span><h3>'+escape(x.title)+'</h3><pre id="tle-photo-prompt-'+i+'">'+escape(x.prompt)+'</pre>'+
    '<div class="vault-photo-help"><strong>'+(es?"Cómo usar este prompt":"How to use this prompt")+'</strong><ol>'+li+'</ol></div>'+
    '<button type="button" data-tle-copy="tle-photo-prompt-'+i+'">'+escape(t.copy)+'</button></article>';
 }).join("");
 const caseStudy={"es":{"eyebrow":"ASÍ SE VE EN UN PROYECTO REAL","title":"Del prompt a una <em>web lista para explorar.</em>","intro":"Estas fotografías pertenecen al demo de Sneekiefs. Los prompts son ejemplos educativos para crear imágenes con una dirección parecida, no una copia de los prompts originales de producción.","photoLabel":"FOTO DEL DEMO","promptLabel":"PROMPT DE EJEMPLO","copy":"Copiar prompt","resultEyebrow":"RESULTADO · LANDING DEMO","resultTitle":"Así quedó la web de Sneekiefs.","resultDesc":"Mira cómo las fotografías, la identidad azul y naranja, las secciones y las interacciones se unen en una experiencia completa. Este es un demo de concepto: no procesa compras reales.","cta":"Explorar el landing completo","preview":"Vista previa del landing real","steps":[{"title":"Fotografía del producto","desc":"Una imagen principal para presentar el sneaker con claridad, textura y luz editorial.","image":"01-studio-shoe.webp","alt":"Fotografía original del sneaker Sneekiefs en estudio, utilizada en su demo.","caption":"Foto original de la campaña Sneekiefs · producto en estudio","prompt":"Usa la fotografía real adjunta de mis sneakers como referencia exacta. Crea una fotografía editorial de producto, con un solo par como protagonista, iluminación de estudio suave, textura realista y sombras naturales. Mantén la forma, los materiales, las costuras, los colores y cualquier logo que realmente aparezca en el producto. Combina un fondo limpio color marfil con detalles en azul intenso y naranja cálido, sin distraer del producto. Deja espacio para colocar textos posteriormente en el diseño de la web. No inventes marcas, etiquetas ni características."},{"title":"Fotografía para la campaña","desc":"Una segunda imagen añade contexto, estilo de vida y una historia visual para la web.","image":"06-model-campaign.webp","alt":"Fotografía editorial original con modelo de la campaña Sneekiefs usada en el demo.","caption":"Foto original de la campaña Sneekiefs · editorial con modelo","prompt":"Usa las fotografías adjuntas de los sneakers como referencia de producto y conserva exactamente su diseño, colores y logos. Crea una fotografía editorial de moda urbana con una persona adulta usando esos sneakers en un entorno de ciudad contemporáneo. Estilo de campaña auténtico y fotográfico, luz natural, movimiento sutil y composición cuidada. La ropa debe complementar la identidad azul y naranja del proyecto sin tapar los zapatos. Mantén proporciones humanas realistas y la forma original del calzado. No agregues textos, logotipos ficticios ni marcas de agua."}]},"en":{"eyebrow":"SEE IT IN A REAL PROJECT","title":"From a prompt to a <em>website you can explore.</em>","intro":"These are actual images from the Sneekiefs demo. The prompts are educational examples for creating a similar visual direction, not verified copies of the original production prompts.","photoLabel":"DEMO PHOTO","promptLabel":"EXAMPLE PROMPT","copy":"Copy prompt","resultEyebrow":"RESULT · LIVE DEMO LANDING","resultTitle":"The finished Sneekiefs website.","resultDesc":"See how product photography, a blue-and-orange identity, page sections and interactions come together. This is a concept demo; no real purchases are processed.","cta":"Explore the complete landing","preview":"Preview of the actual landing","steps":[{"title":"Studio product photograph","desc":"A clean product-led image that shows the sneakers, their details and editorial lighting.","image":"01-studio-shoe.webp","alt":"Original Sneekiefs sneaker studio product photo used in the demo.","caption":"Original Sneekiefs campaign photo · studio product","prompt":"Use the attached real sneaker photograph as the exact product reference. Create a premium editorial studio photograph with a single pair as the hero. Use soft professional lighting, believable texture and natural shadows. Preserve the actual shape, materials, stitching, colors and only logos genuinely present on the shoes. Pair an uncluttered warm ivory setting with subtle vivid blue and warm orange accents. Leave room for live website text to be added later. Do not invent branding, labels or product features."},{"title":"Lifestyle campaign photograph","desc":"A second image brings real-world context and a recognizable creative mood to the page.","image":"06-model-campaign.webp","alt":"Original Sneekiefs fashion campaign photograph featuring a model, used in the demo.","caption":"Original Sneekiefs campaign photo · lifestyle editorial","prompt":"Use the attached authentic sneaker photographs as precise product references. Create an editorial urban streetwear campaign photograph featuring an adult model wearing these exact shoes in a contemporary city setting. Keep the sneaker design, colors and genuine branding unchanged. Use natural light, restrained movement and confident styling that complements the blue-and-orange visual identity without hiding the shoes. Maintain realistic human anatomy and photographic details. Do not add fake logos, baked-in captions or watermarks."}]}}[es?"es":"en"];
 const caseRows=caseStudy.steps.map((item,i)=>{
   const promptId="tle-sneekiefs-prompt-"+i;
   return '<article class="vault-case-pair">'+
     '<div class="vault-case-pair-copy">'+
       '<div class="vault-case-label">'+escape(caseStudy.promptLabel)+'</div>'+
       '<h3>'+escape(item.title)+'</h3><p>'+escape(item.desc)+'</p>'+
       '<div class="vault-case-prompt"><pre id="'+promptId+'">'+escape(item.prompt)+'</pre>'+
         '<button type="button" data-tle-copy="'+promptId+'">'+escape(caseStudy.copy)+'</button></div>'+
     '</div>'+
     '<figure class="vault-case-photo"><img src="/demos/sneekiefs/assets/'+encodeURIComponent(item.image)+'" loading="lazy" decoding="async" width="800" height="950" alt="'+escape(item.alt)+'">'+
       '<figcaption><span>'+escape(caseStudy.photoLabel)+'</span>'+escape(item.caption)+'</figcaption></figure>'+
   '</article>';
 }).join("");
 const example='<section id="ejemplo-sneekiefs" class="vault-case-study" aria-labelledby="vault-case-title"><div class="wrap">'+
   '<div class="vault-case-heading"><span class="vault-case-label">'+escape(caseStudy.eyebrow)+'</span>'+
     '<h2 id="vault-case-title">'+caseStudy.title+'</h2><p>'+escape(caseStudy.intro)+'</p></div>'+
   '<div class="vault-case-steps">'+caseRows+'</div>'+
   '<div class="vault-case-result">'+
      '<div class="vault-case-result-copy"><span class="vault-case-label">'+escape(caseStudy.resultEyebrow)+'</span>'+
       '<h3>'+escape(caseStudy.resultTitle)+'</h3><p>'+escape(caseStudy.resultDesc)+'</p>'+
       '<a class="vault-case-visit" href="/demos/sneekiefs/" target="_blank" rel="noopener noreferrer">'+escape(caseStudy.cta)+'</a></div>'+
      '<div class="vault-case-browser"><div class="vault-case-browser-bar" aria-hidden="true"><span>thelaunchera.com/demos/sneekiefs/</span></div>'+
       '<iframe title="'+escape(caseStudy.preview)+'" loading="lazy" src="/demos/sneekiefs/" tabindex="-1" aria-hidden="true"></iframe></div>'+
    '</div></div></section>';
 const form='<form id="tle-resource-form" novalidate><label for="tle-resource-email">'+escape(t.email)+'</label><input id="tle-resource-email" type="email" inputmode="email" autocomplete="email" required maxlength="254" placeholder="you@example.com">'+
   '<div class="tle-honeypot" aria-hidden="true"><label for="tle-company-web">Company website</label><input id="tle-company-web" type="text" tabindex="-1" autocomplete="off"></div>'+
   '<label class="tle-resource-consent"><input id="tle-resource-consent" type="checkbox" required><span>'+escape(t.consent)+'</span></label><button type="submit" id="tle-resource-submit">'+escape(t.submit)+'</button>'+
   '<p class="tle-sub-note">'+escape(t.hint)+' <a href="/privacy.html">'+escape(t.privacy)+'</a>.</p></form>';
 const markup='<div class="tle-resource-space">'+
  '<section id="recursos" class="resource-grid-bg" aria-labelledby="tle-resources-heading"><div class="wrap">'+
  '<div class="resource-eyebrow">'+escape(t.eyebrow)+'</div><div class="tle-resource-heading"><h2 id="tle-resources-heading">'+t.title+'</h2><p>'+escape(t.intro)+'</p></div>'+
  '<div class="tle-resource-tools"><input type="search" id="tle-resource-search" placeholder="'+escape(t.search)+'" aria-label="'+escape(t.search)+'" autocomplete="off"><div class="tle-resource-filters" role="group" aria-label="'+escape(t.search)+'">'+filters+'</div></div>'+
  '<div class="tle-resource-cards" id="tle-resource-cards">'+cards+'</div><p id="tle-resource-empty" hidden>'+escape(t.empty)+'</p></div></section>'+
  '<section id="prompts-fotos" class="resource-grid-bg" aria-labelledby="tle-photo-heading"><div class="wrap"><div class="tle-photo-heading"><div><div class="resource-eyebrow">'+escape(t.photoEyebrow)+'</div><h2 id="tle-photo-heading">'+t.photoTitle+'</h2></div><p>'+escape(t.photoIntro)+'</p></div><div class="tle-photo-prompts">'+photoCards+'</div></div></section>'+
  example+
   '<section id="proximamente" class="resource-grid-bg" aria-labelledby="tle-future-heading"><div class="wrap"><div class="tle-coming-band"><div><div class="resource-eyebrow">'+escape(t.soon)+'</div><h2 id="tle-future-heading">'+escape(t.futureTitle)+'</h2><p>'+escape(t.futureDesc)+'</p></div><a href="#suscripcion">'+escape(t.futureButton)+'</a></div></div></section>'+
  '<section id="suscripcion" class="resource-grid-bg" aria-labelledby="tle-sub-heading"><div class="wrap tle-sub-layout"><div class="tle-sub-copy"><div class="resource-eyebrow">'+escape(t.subEyebrow)+'</div><h2 id="tle-sub-heading">'+escape(t.subTitle)+'</h2><p>'+escape(t.subIntro)+'</p></div><div class="tle-sub-form-card">'+form+
  '<div id="tle-resource-token-panel" hidden><h3 id="tle-token-heading"></h3><p id="tle-token-description"></p><button type="button" id="tle-resource-token-btn"></button></div>'+
  '<p id="tle-resource-feedback" role="status" aria-live="polite"></p></div></div></section></div>';
 library.insertAdjacentHTML("afterend",markup);
 // Curated library filtering (local, read-only).
 let active="all";
 const cardEls=Array.from(document.querySelectorAll(".tle-resource-card"));
 const input=document.getElementById("tle-resource-search"),empty=document.getElementById("tle-resource-empty");
 const filterBtns=Array.from(document.querySelectorAll("[data-tle-filter]"));
 function render(){const q=input.value.trim().toLowerCase();let n=0;for(const card of cardEls){const show=(active==="all"||card.dataset.type===active)&&(!q||card.dataset.search.includes(q));card.hidden=!show;if(show)n++;}empty.hidden=n>0;}
 input.addEventListener("input",render);filterBtns.forEach(btn=>btn.addEventListener("click",()=>{active=btn.dataset.tleFilter;filterBtns.forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));render();}));render();
 // Copy original photo prompts; fallback selects text on older mobile browsers.
 document.querySelectorAll("[data-tle-copy]").forEach(button=>button.addEventListener("click",async()=>{
  const pre=document.getElementById(button.dataset.tleCopy);if(!pre)return;
  try{if(!navigator.clipboard||!isSecureContext)throw Error("Clipboard not available");await navigator.clipboard.writeText(pre.textContent);button.textContent=t.copied;}
  catch{const sel=getSelection(),range=document.createRange();range.selectNodeContents(pre);sel.removeAllRanges();sel.addRange(range);button.textContent=t.select;}
 }));
 const endpoint="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-guides-subscribe";
 const subscribeForm=document.getElementById("tle-resource-form"),feedback=document.getElementById("tle-resource-feedback"),submit=document.getElementById("tle-resource-submit");
 const tokenPanel=document.getElementById("tle-resource-token-panel"),tokenTitle=document.getElementById("tle-token-heading"),tokenDesc=document.getElementById("tle-token-description"),tokenBtn=document.getElementById("tle-resource-token-btn");
 let startedAt=Date.now();
 async function post(body){
  const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store"});
  const result=await response.json().catch(()=>({}));
  if(!response.ok||result.ok!==true)throw Error(result.code||"FAILED");
  return result;
 }
 subscribeForm.addEventListener("submit",async ev=>{
  ev.preventDefault();const field=document.getElementById("tle-resource-email"),consent=document.getElementById("tle-resource-consent").checked;
  if(!field.checkValidity()||!consent){feedback.textContent=t.invalid;return;}
  feedback.textContent="";submit.disabled=true;
  try{await post({action:"subscribe",email:field.value.trim(),language:es?"es":"en",consent:true,company_web:document.getElementById("tle-company-web").value,started_at:startedAt});feedback.textContent=t.pending;subscribeForm.reset();}
  catch{feedback.textContent=t.error;}
  finally{startedAt=Date.now();submit.disabled=false;}
 });
 const params=new URL(location.href).searchParams,confirm=params.get("confirm_freebie"),unsubscribe=params.get("unsubscribe_freebie"),token=confirm||unsubscribe;
 if(token){
  subscribeForm.hidden=true;
  if(!/^[a-f0-9]{64}$/.test(token)){feedback.textContent=t.expired;return;}
  const isConfirm=!!confirm;
  tokenPanel.hidden=false;tokenTitle.textContent=isConfirm?t.confirmTitle:t.unsubTitle;tokenDesc.textContent=isConfirm?t.confirmBody:t.unsubBody;tokenBtn.textContent=isConfirm?t.confirmButton:t.unsubButton;
  tokenBtn.addEventListener("click",async()=>{
   tokenBtn.disabled=true;feedback.textContent="";
   try{await post({action:isConfirm?"confirm":"unsubscribe",token});feedback.textContent=isConfirm?t.confirmed:t.unsubscribed;tokenPanel.hidden=true;const u=new URL(location.href);u.searchParams.delete("confirm_freebie");u.searchParams.delete("unsubscribe_freebie");history.replaceState(null,"",u);}
   catch{feedback.textContent=t.expired;}
   finally{tokenBtn.disabled=false;}
  });
  document.getElementById("suscripcion").scrollIntoView({block:"start"});
 }
})();
