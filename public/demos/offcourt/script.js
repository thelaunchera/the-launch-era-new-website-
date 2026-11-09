(()=>{
"use strict";
const translations={
en:{
announcement:"INDEPENDENT SNEAKER CULTURE · CONCEPT STORE",navShop:"SHOP",navJournal:"THE EDIT",navAbout:"OUR WORLD",bag:"BAG",heroOverline:"DROP 001 / THE EVERYDAY ROTATION",heroDesc:"For the city, the late train, the next big thing. Sneakers made for a life in motion.",heroCta:"EXPLORE THE DROP",heroBottom:"GOOD SHOES. BETTER STORIES.",collectionEyebrow:"THE CURATED ROTATION / 001",collectionTitle:"Find your<br><em>next pair.</em>",collectionIntro:"The kind you reach for every day. Bold shapes, clean lines and pairs worth a second look.",filterAll:"ALL PAIRS",filterLifestyle:"LIFESTYLE",filterRunning:"RUNNING",filterCourt:"COURT",sort:"SORT",sortFeatured:"FEATURED",sortLow:"PRICE: LOW TO HIGH",sortHigh:"PRICE: HIGH TO LOW",noResults:"No pairs in this category.",demoPrices:"Concept collection and illustrative prices. Nothing on this site is for sale.",campaignOverline:"THE OFFCOURT EDIT",campaignDesc:"No dress code. No sidelines. Just your own pace and a pair that goes with everything.",campaignCta:"SHOP THE ROTATION",storyEyebrow:"OUR POINT OF VIEW",storyDesc:"OFFCOURT is a concept sneaker destination with one simple belief: the pairs you wear most should be the pairs you love most.",feature1:"CURATED PICKS",feature2:"EVERYDAY ENERGY",feature3:"STREET-READY STYLE",finalEyebrow:"YOUR ROTATION STARTS HERE",finalCta:"FIND YOUR PAIR",footerTagline:"Everyday shoes. Unordinary energy.",footerBrowse:"BROWSE",footerInfo:"INFORMATION",privacy:"Privacy",terms:"Terms",cookies:"Cookies",conceptDemo:"CONCEPT DEMO · NO REAL ORDERS",bagOverline:"YOUR ROTATION",yourBag:"YOUR BAG",subtotal:"SUBTOTAL",bagDisclaimer:"Demo only. No orders, payments or personal details are collected.",reviewBag:"PREVIEW ORDER",continue:"CONTINUE BROWSING",new:"THE ROTATION",view:"VIEW",add:"ADD TO BAG",size:"SELECT YOUR SIZE / US",chooseSize:"Please select a shoe size first.",added:"Added to your bag",empty:"Your bag is empty.",emptyDesc:"Your next favorite pair is one click away.",remove:"REMOVE",samplePrice:"SAMPLE PRICE",previewTitle:"LOOKS GOOD.",previewDesc:"This is only an order preview. Nothing has been purchased, reserved or submitted.",previewLine:"YOUR SELECTION",previewTotal:"DEMO TOTAL",previewDone:"RETURN TO BAG",menuOpen:"Open menu",menuClose:"Close menu",switchLang:"Switch to Spanish",closeBag:"Close shopping bag",closeDetails:"Close product details",sizes:"Available sizes",photoNote:"Editorial image reference only.",notAvailable:"No products available"},
es:{
announcement:"CULTURA SNEAKER INDEPENDIENTE · TIENDA CONCEPTUAL",navShop:"TIENDA",navJournal:"EDITORIAL",navAbout:"NOSOTROS",bag:"BOLSA",heroOverline:"LANZAMIENTO 001 / PARA TODOS LOS DÍAS",heroDesc:"Para la ciudad, el próximo tren y todo lo que viene. Sneakers para una vida en movimiento.",heroCta:"VER LA COLECCIÓN",heroBottom:"BUENOS TENIS. MEJORES HISTORIAS.",collectionEyebrow:"SELECCIÓN EDITORIAL / 001",collectionTitle:"Encuentra tu<br><em>próximo par.</em>",collectionIntro:"Los que quieres usar todos los días. Formas atrevidas, líneas limpias y estilos que merecen otra mirada.",filterAll:"TODOS",filterLifestyle:"CASUAL",filterRunning:"RUNNING",filterCourt:"COURT",sort:"ORDENAR",sortFeatured:"DESTACADOS",sortLow:"PRECIO: MENOR A MAYOR",sortHigh:"PRECIO: MAYOR A MENOR",noResults:"No hay modelos en esta categoría.",demoPrices:"Colección conceptual con precios ilustrativos. Esta página no vende productos.",campaignOverline:"LA EDICIÓN OFFCOURT",campaignDesc:"Sin reglas de estilo. Sin quedarse al margen. Solo tu propio ritmo y un par que combina con todo.",campaignCta:"VER LOS MODELOS",storyEyebrow:"NUESTRA VISIÓN",storyDesc:"OFFCOURT es un concepto de tienda sneaker con una idea sencilla: los zapatos que más usas deberían ser tus favoritos.",feature1:"SELECCIÓN CUIDADA",feature2:"ENERGÍA DIARIA",feature3:"ESTILO URBANO",finalEyebrow:"TU ESTILO EMPIEZA AQUÍ",finalCta:"ENCUENTRA TU PAR",footerTagline:"Sneakers de diario. Energía extraordinaria.",footerBrowse:"EXPLORA",footerInfo:"INFORMACIÓN",privacy:"Privacidad",terms:"Términos",cookies:"Cookies",conceptDemo:"DEMO CONCEPTUAL · SIN PEDIDOS REALES",bagOverline:"TU SELECCIÓN",yourBag:"TU BOLSA",subtotal:"SUBTOTAL",bagDisclaimer:"Solo demostración. No se recogen pedidos, pagos ni datos personales.",reviewBag:"SIMULAR PEDIDO",continue:"SEGUIR EXPLORANDO",new:"LA COLECCIÓN",view:"VER",add:"AÑADIR A LA BOLSA",size:"ELIGE TU TALLA / US",chooseSize:"Selecciona una talla primero.",added:"Añadido a tu bolsa",empty:"Tu bolsa está vacía.",emptyDesc:"Tu próximo par favorito está a un clic.",remove:"ELIMINAR",samplePrice:"PRECIO ILUSTRATIVO",previewTitle:"TE QUEDA BIEN.",previewDesc:"Esta es solo una simulación. No se ha comprado, reservado ni enviado nada.",previewLine:"TU SELECCIÓN",previewTotal:"TOTAL DE PRUEBA",previewDone:"VOLVER A LA BOLSA",menuOpen:"Abrir menú",menuClose:"Cerrar menú",switchLang:"Switch to English",closeBag:"Cerrar bolsa",closeDetails:"Cerrar detalles del producto",sizes:"Tallas disponibles",photoNote:"Imagen de referencia editorial.",notAvailable:"No hay productos"}
};
const items=[
{id:"rush-red",name:"Rush Red",category:"running",price:148,image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=84",detail:{en:"A bright, high-energy running silhouette with a confident streetwear edge.",es:"Un diseño running vibrante, enérgico y con personalidad urbana."}},
{id:"concrete-low",name:"Concrete Low",category:"lifestyle",price:125,image:"https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=84",detail:{en:"Clean lines and everyday versatility, made for wherever you go.",es:"Líneas limpias y versatilidad diaria para llevarlos a donde quieras."}},
{id:"orbit-runner",name:"Orbit Runner",category:"running",price:162,image:"https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=1000&q=84",detail:{en:"An expressive athletic profile for all-day movement.",es:"Una silueta deportiva con carácter para moverte todo el día."}},
{id:"everyday-01",name:"Everyday 01",category:"lifestyle",price:118,image:"https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1000&q=84",detail:{en:"An easy, laid-back staple to wear on repeat.",es:"Un básico relajado que querrás ponerte una y otra vez."}},
{id:"court-classic",name:"Court Classic",category:"court",price:139,image:"https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=84",detail:{en:"Retro-inspired proportions with a fresh attitude.",es:"Proporciones de inspiración retro con actitud renovada."}},
{id:"velocity-02",name:"Velocity 02",category:"court",price:155,image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=84",detail:{en:"A bold everyday pair with confident contrast and structure.",es:"Un par llamativo para el día a día, con contraste y estructura."}}
];
const sizes=[7,8,9,10,11,12];
const cart=[];
const chosen=new Map();
const state={lang:"en",filter:"all",sort:"featured",active:null,quickId:null,returnFocus:null,toastTimer:null,preview:false};
const $=s=>document.querySelector(s);
const fmt=v=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(v);
const t=k=>(translations[state.lang][k]||translations.en[k]||k);
const esc=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const categoryLabel=c=>c==="lifestyle"?t("filterLifestyle"):c==="running"?t("filterRunning"):t("filterCourt");
function translate(){
  document.documentElement.lang=state.lang;
  document.querySelectorAll("[data-i18n]").forEach(node=>{const val=t(node.dataset.i18n);if(node.dataset.i18n==="collectionTitle")node.innerHTML=val;else node.textContent=val;});
  $("#langToggle").textContent=state.lang==="en"?"ES":"EN";
  $("#langToggle").setAttribute("aria-label",t("switchLang"));
  $("#menuToggle").setAttribute("aria-label",$("#mobileNav").hidden?t("menuOpen"):t("menuClose"));
  $("#bagClose").setAttribute("aria-label",t("closeBag"));
  $("#quickClose").setAttribute("aria-label",t("closeDetails"));
  $("#sortSelect").setAttribute("aria-label",t("sort"));
  document.querySelector(".filter-row").setAttribute("aria-label",t("navShop"));
  document.title=state.lang==="es"?"OFFCOURT. | Tu próximo par":"OFFCOURT. | The Everyday Rotation";
  renderCollection();renderBag();if(state.active==="quick"&&state.quickId)renderQuick(state.quickId);
}
function renderCollection(){
  const filtered=items.filter(p=>state.filter==="all"||p.category===state.filter);
  if(state.sort==="low")filtered.sort((a,b)=>a.price-b.price);
  if(state.sort==="high")filtered.sort((a,b)=>b.price-a.price);
  $("#emptyResults").hidden=filtered.length>0;
  $("#productGrid").innerHTML=filtered.map((p,i)=>{
    const selection=chosen.get(p.id);
    return '<article class="product-card" data-product="'+p.id+'">'+
      '<div class="product-photo"><img loading="lazy" decoding="async" src="'+p.image+'" alt="'+esc(p.name)+' sneaker editorial reference photograph" width="600" height="650"><span class="product-number">'+String(i+1).padStart(2,"0")+' / 06</span>'+
      '<button class="product-quick" type="button" data-quick="'+p.id+'" aria-label="'+t("view")+' '+esc(p.name)+'">'+t("view")+'</button></div>'+
      '<div class="product-meta"><div><span class="product-kicker">'+categoryLabel(p.category).toUpperCase()+'</span><h3>'+esc(p.name)+'</h3><p>'+t("new")+'</p></div><strong>'+fmt(p.price)+'</strong></div>'+
      '<div class="card-sizes" role="group" aria-label="'+t("size")+' '+esc(p.name)+'">'+sizes.map(s=>'<button type="button" class="size'+(selection===s?" selected":"")+'" data-size="'+s+'" data-pid="'+p.id+'" aria-pressed="'+(selection===s?'true':'false')+'">'+s+'</button>').join("")+'</div>'+
      '<button type="button" class="card-add" data-add="'+p.id+'">'+t("add")+'</button></article>';
  }).join("");
}
function notify(msg){const el=$("#toast");el.textContent=msg;el.classList.add("visible");clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>el.classList.remove("visible"),2800);}
function closeMobile(){const nav=$("#mobileNav");nav.hidden=true;$("#menuToggle").setAttribute("aria-expanded","false");$("#menuToggle").setAttribute("aria-label",t("menuOpen"));}
function openDialog(type){
  if(state.active)closeDialog(false);
  state.returnFocus=document.activeElement;
  state.active=type;
  $("#overlay").hidden=false;
  const el=type==="bag"?$("#bagDialog"):$("#quickDialog");
  el.hidden=false;document.body.classList.add("locked");el.focus();
}
function closeDialog(restore=true){
  $("#overlay").hidden=true;$("#bagDialog").hidden=true;$("#quickDialog").hidden=true;document.body.classList.remove("locked");
  state.active=null;state.quickId=null;state.preview=false;
  if(restore&&state.returnFocus&&document.contains(state.returnFocus))state.returnFocus.focus();
}
function addToBag(id,size){
  if(!size){notify(t("chooseSize"));const btn=document.querySelector('[data-pid="'+id+'"]');btn?.focus();return false;}
  const p=items.find(x=>x.id===id);if(!p)return false;
  const line=cart.find(x=>x.id===id&&x.size===size);
  if(line)line.qty++;else cart.push({id,size,qty:1});
  updateBagCount();renderBag();notify(t("added")+": "+p.name+" / US "+size);
  return true;
}
function updateBagCount(){$("#bagCount").textContent=cart.reduce((a,b)=>a+b.qty,0);}
function renderBag(){
  const el=$("#bagItems");
  const total=cart.reduce((sum,l)=>sum+(items.find(p=>p.id===l.id)?.price||0)*l.qty,0);
  $("#bagSubtotal").textContent=fmt(total);
  $("#previewOrder").disabled=cart.length===0;
  $("#previewOrder").textContent=t("reviewBag");
  if(state.preview){renderPreview();return;}
  if(!cart.length){el.innerHTML='<div class="bag-empty"><h3>'+t("empty")+'</h3><p>'+t("emptyDesc")+'</p></div>';return;}
  el.innerHTML=cart.map((line,index)=>{
    const p=items.find(x=>x.id===line.id);
    return '<article class="bag-item"><img src="'+p.image+'" alt="'+esc(p.name)+'" width="95" height="112"><div class="bag-info"><h3>'+esc(p.name)+'</h3><p>US '+line.size+' / '+categoryLabel(p.category).toUpperCase()+'</p><strong>'+fmt(p.price*line.qty)+'</strong><div class="bag-actions"><div class="stepper"><button type="button" data-step="-1" data-index="'+index+'" aria-label="Decrease quantity">−</button><span>'+line.qty+'</span><button type="button" data-step="1" data-index="'+index+'" aria-label="Increase quantity">+</button></div><button type="button" class="remove" data-remove="'+index+'">'+t("remove")+'</button></div></div></article>';
  }).join("");
}
function renderPreview(){
  const total=cart.reduce((sum,l)=>sum+(items.find(p=>p.id===l.id)?.price||0)*l.qty,0);
  $("#bagItems").innerHTML='<div class="bag-confirmation"><span class="eyebrow">'+t("previewLine")+'</span><h3>'+t("previewTitle")+'</h3><p>'+t("previewDesc")+'</p><div class="order-lines">'+cart.map(l=>{const p=items.find(i=>i.id===l.id);return '<div class="order-line"><span>'+esc(p.name)+' / US '+l.size+' × '+l.qty+'</span><strong>'+fmt(p.price*l.qty)+'</strong></div>';}).join("")+'<div class="order-line"><strong>'+t("previewTotal")+'</strong><strong>'+fmt(total)+'</strong></div></div><button type="button" class="btn btn-dark full" id="backToBag">'+t("previewDone")+'</button></div>';
  $("#previewOrder").disabled=true;
}
function renderQuick(id){
  const p=items.find(x=>x.id===id);if(!p)return;
  state.quickId=id;
  const selection=chosen.get(id);
  $("#quickContents").innerHTML='<img class="quick-image" src="'+p.image+'" alt="'+esc(p.name)+' sneaker studio image" width="550" height="620"><div class="quick-info"><span class="eyebrow">'+categoryLabel(p.category).toUpperCase()+' / 001</span><h2 id="quickName">'+esc(p.name)+'</h2><span class="quick-price">'+fmt(p.price)+'</span><p class="product-description">'+esc(p.detail[state.lang])+'</p><div class="size-label">'+t("size")+'</div><div class="quick-sizes" role="group" aria-label="'+t("sizes")+'">'+sizes.map(s=>'<button type="button" class="size'+(selection===s?' selected':'')+'" data-quick-size="'+s+'" aria-pressed="'+(selection===s?'true':'false')+'">'+s+'</button>').join("")+'</div><button type="button" class="btn btn-dark full" data-quick-add="'+p.id+'">'+t("add")+'</button><p class="demo-product-note">'+t("photoNote")+'</p></div>';
}
function syncSizes(id){
  document.querySelectorAll('[data-pid="'+id+'"]').forEach(b=>{const yes=Number(b.dataset.size)===chosen.get(id);b.classList.toggle("selected",yes);b.setAttribute("aria-pressed",String(yes));});
  document.querySelectorAll("[data-quick-size]").forEach(b=>{const yes=Number(b.dataset.quickSize)===chosen.get(id);b.classList.toggle("selected",yes);b.setAttribute("aria-pressed",String(yes));});
}
document.addEventListener("click",ev=>{
 const target=ev.target instanceof Element?ev.target:null;if(!target)return;
 const filter=target.closest("[data-filter]");if(filter){state.filter=filter.dataset.filter;document.querySelectorAll("[data-filter]").forEach(b=>{const yes=b.dataset.filter===state.filter;b.classList.toggle("active",yes);b.setAttribute("aria-pressed",String(yes));});renderCollection();return;}
 const size=target.closest("[data-size]");if(size){chosen.set(size.dataset.pid,Number(size.dataset.size));syncSizes(size.dataset.pid);return;}
 const add=target.closest("[data-add]");if(add){addToBag(add.dataset.add,chosen.get(add.dataset.add));return;}
 const quick=target.closest("[data-quick]");if(quick){openDialog("quick");renderQuick(quick.dataset.quick);return;}
 const qs=target.closest("[data-quick-size]");if(qs){chosen.set(state.quickId,Number(qs.dataset.quickSize));syncSizes(state.quickId);return;}
 const qa=target.closest("[data-quick-add]");if(qa){if(addToBag(qa.dataset.quickAdd,chosen.get(qa.dataset.quickAdd))){closeDialog(false);openDialog("bag");state.returnFocus=$("#bagOpen");}return;}
 const step=target.closest("[data-step]");if(step){const line=cart[Number(step.dataset.index)];if(line){line.qty=Math.max(0,Math.min(20,line.qty+Number(step.dataset.step)));if(line.qty===0)cart.splice(Number(step.dataset.index),1);updateBagCount();renderBag();}return;}
 const rem=target.closest("[data-remove]");if(rem){cart.splice(Number(rem.dataset.remove),1);updateBagCount();renderBag();return;}
 if(target.closest("#backToBag")){state.preview=false;renderBag();return;}
});
$("#langToggle").addEventListener("click",()=>{state.lang=state.lang==="en"?"es":"en";translate();});
$("#sortSelect").addEventListener("change",e=>{state.sort=e.target.value;renderCollection();});
$("#menuToggle").addEventListener("click",()=>{const nav=$("#mobileNav");nav.hidden=!nav.hidden;$("#menuToggle").setAttribute("aria-expanded",String(!nav.hidden));$("#menuToggle").setAttribute("aria-label",nav.hidden?t("menuOpen"):t("menuClose"));});
$("#mobileNav").querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMobile));
$("#bagOpen").addEventListener("click",()=>{openDialog("bag");renderBag();});
$("#bagClose").addEventListener("click",()=>closeDialog());
$("#quickClose").addEventListener("click",()=>closeDialog());
$("#overlay").addEventListener("click",()=>closeDialog());
$("#continueShopping").addEventListener("click",()=>closeDialog());
$("#previewOrder").addEventListener("click",()=>{if(!cart.length)return;state.preview=true;renderPreview();$("#bagItems").scrollTop=0;});
document.addEventListener("keydown",ev=>{
 if(ev.key==="Escape"){if(state.active)closeDialog();else if(!$("#mobileNav").hidden)closeMobile();}
 if(ev.key!=="Tab"||!state.active)return;
 const node=state.active==="bag"?$("#bagDialog"):$("#quickDialog");
 const controls=[...node.querySelectorAll("a,button,input,select,[tabindex]")].filter(x=>!x.disabled&&x.getClientRects().length&&x.tabIndex!==-1);
 if(!controls.length)return;const first=controls[0],last=controls[controls.length-1];
 if(ev.shiftKey&&(document.activeElement===first||document.activeElement===node)){ev.preventDefault();last.focus();}
 else if(!ev.shiftKey&&(document.activeElement===last||document.activeElement===node)){ev.preventDefault();first.focus();}
});
$("#year").textContent=String(new Date().getFullYear());
translate();updateBagCount();
})();