(()=>{
const params=new URLSearchParams(location.search),ownerPreview=params.get('owner_preview')==='1',sample=!params.has('key')&&!ownerPreview;
const es=params.get('lang')==='es',t=(en,esText)=>es?esText:en,$=id=>document.getElementById(id);
const safeURL=raw=>{try{const u=new URL(String(raw||''));return /^https?:$/.test(u.protocol)&&!u.username&&!u.password?u.href:''}catch{return ''}};
function text(id,en,spanish){$(id).textContent=t(en,spanish)}
function render(model={}){
 const brand=model.branding||{},business=model.business_name||t('Your Cleaning Business','Tu negocio de limpieza');
 $('baseBusiness').textContent=business;$('baseFooterBusiness').textContent=business;
 if(brand.description)$('baseDescription').textContent=brand.description;
 if(brand.hero_image&&safeURL(brand.hero_image)){$('baseHeroImage').src=safeURL(brand.hero_image);$('baseHeroImage').alt=business;$('basePhotoLabel').hidden=true}
 else if(!sample){$('baseHeroImage').hidden=true;$('basePhotoLabel').hidden=true;document.querySelector('.hero').style.gridTemplateColumns='1fr'}
 if(safeURL(brand.logo_image)){const img=document.createElement('img');img.src=safeURL(brand.logo_image);img.alt=business+' logo';const label=document.createElement('strong');label.textContent=business;$('baseBusiness').style.cssText='display:flex;align-items:center;gap:10px;flex-wrap:wrap';$('baseBusiness').replaceChildren(img,label)}
 if(/^#[0-9a-f]{6}$/i.test(brand.primary_color||''))document.documentElement.style.setProperty('--base-soft',brand.primary_color);
 if(/^#[0-9a-f]{6}$/i.test(brand.accent_color||''))document.documentElement.style.setProperty('--base-accent',brand.accent_color);
 if(!sample){$('baseHeroImage').onerror=()=>{$('baseHeroImage').hidden=true;document.querySelector('.hero').style.gridTemplateColumns='1fr'}}
 const grid=$('baseServiceGrid');grid.replaceChildren();
 const services=model.services||[{name:t('Home cleaning','Limpieza del hogar')},{name:t('Deep cleaning','Limpieza profunda')},{name:t('Move-in / move-out','Mudanzas')},{name:t('Office cleaning','Limpieza de oficinas')},{name:t('Recurring cleaning','Limpieza recurrente')},{name:t('Custom requests','Solicitudes especiales')}];
 for(const svc of services){const a=document.createElement('a');a.className='base-service-card';a.href='#booking';const h=document.createElement('h3');h.textContent=svc.name;const p=document.createElement('p');p.textContent=svc.mode==='flat'?new Intl.NumberFormat(es?'es-US':'en-US',{style:'currency',currency:model.currency||'USD'}).format(svc.price):t('View service & request pricing','Ver servicio y solicitar precio');a.append(h,p);a.onclick=()=>{if(typeof setCategory==='function')setCategory(svc.category==='commercial'?'commercial':'residential');if(typeof showMain==='function')showMain()};grid.append(a)}
 const reviews=Array.isArray(brand.reviews)?brand.reviews.filter(r=>r.name&&r.text).slice(0,3):[];
 $('baseReviews').hidden=!reviews.length&&!sample&&!ownerPreview;
 const list=$('baseReviewGrid');list.replaceChildren();
 if(reviews.length)for(const r of reviews){const card=document.createElement('article');card.className='base-review';const quote=document.createElement('blockquote');quote.textContent=r.text;const name=document.createElement('strong');name.textContent=r.name;card.append(quote,name);// Reviews display only verified name and text; no outbound source links.list.append(card)}
 else if(sample||ownerPreview)for(let n=1;n<=3;n++){const card=document.createElement('article');card.className='base-review empty';const h=document.createElement('strong');h.textContent=t('Client review ','Review de cliente ')+n;const p=document.createElement('p');p.textContent=t('Reserved for a real review received through the intake.','Espacio reservado para un review real recibido en el intake.');card.append(h,p);list.append(card)}
}
function unavailable(){for(const el of document.querySelector('main.wrap').children)if(el.id!=='booking')el.hidden=true;document.querySelector('.top').textContent=t('BOOKING PAGE UNAVAILABLE','PÁGINA DE RESERVAS NO DISPONIBLE');}
window.TLEBookingBase={render,unavailable};
text('baseServiceTitle','Our cleaning services','Nuestros servicios de limpieza');text('baseServiceCopy','Choose the cleaning your space needs. View available services and request your appointment below.','Elige la limpieza que necesita tu espacio. Consulta los servicios y solicita tu cita abajo.');text('baseDescription','A cleaner home. A little more time for you. Choose your service and request a cleaning in a few simple steps.','Un hogar más limpio. Un poco más de tiempo para ti. Elige tu servicio y solicita una limpieza en unos pasos.');text('baseWhyTitle','Cleaning that fits your life','Limpieza que se adapta a tu vida');text('baseWhyCopy','A clear, simple experience from your first request.','Una experiencia clara y sencilla desde tu primera solicitud.');text('baseHowTitle','How it works','Cómo funciona');text('baseReviewTitle','What our clients say','Lo que dicen nuestros clientes');text('baseReviewCopy','Real words from the people we serve.','Palabras reales de nuestros clientes.');text('baseClosingTitle','Ready for a fresh start?','¿Listo para un espacio más limpio?');text('baseClosingCopy','Find your service and request a time that works for you.','Elige tu servicio y solicita un horario que te convenga.');
for(const el of document.querySelectorAll('[data-base-en]'))el.textContent=t(el.dataset.baseEn,el.dataset.baseEs);
if(sample){document.querySelector('.top').textContent=t('BASE BOOKING PAGE · SAMPLE DESIGN · NO REAL BOOKINGS','BASE BOOKING PAGE · DISEÑO DE EJEMPLO · SIN RESERVAS REALES');document.querySelector('.heroText h1').textContent=t('Professional cleaning for a fresher home.','Limpieza profesional para un hogar más fresco.');$('leadName').textContent=t('YOUR CLEANING BUSINESS','TU NEGOCIO DE LIMPIEZA');$('basePhotoLabel').textContent=t('Sample photo · replace with your business photo','Foto de ejemplo · reemplazar con una foto de tu negocio');render();}
else $('basePhotoLabel').hidden=true;
})();
