/* La Vie in Pink — boutique café, accessible menu and browser-only order preview. */
(() => {
 "use strict";
 const root=document.documentElement;
 if(!root||root.dataset.tleOneMotion!=="la-vie-in-pink")return;
 const $=(sel,container=document)=>container.querySelector(sel);
 const $$=(sel,container=document)=>Array.from(container.querySelectorAll(sel));
 const photo=name=>"./photos/"+name;
 const productData=[
  {id:"rose-latte",cat:"coffee",photo:"lavie_01_rose_latte_croissant.png",cents:675,en:"Rose Vanilla Latte",es:"Latte de rosa y vainilla",den:"Espresso, velvet milk and a delicate floral finish.",des:"Espresso, leche cremosa y un toque floral."},
  {id:"iced-strawberry",cat:"coffee",photo:"lavie_04_iced_rose_cake.png",cents:725,en:"Iced Strawberry Latte",es:"Latte helado de fresa",den:"A chilled pink pick-me-up made for slow afternoons.",des:"Un café frío de fresa para tardes sin prisa."},
  {id:"honey-cappuccino",cat:"coffee",photo:"lavie_05_coffee_moment.png",cents:625,en:"Honey Cappuccino",es:"Capuchino de miel",den:"A warm classic with a gently sweet finish.",des:"Un clásico suave con un toque de miel."},
  {id:"macarons",cat:"pastry",photo:"lavie_02_brunch_patisserie.png",cents:800,en:"Petite Macaron Trio",es:"Trío de macarons",den:"Three little bites of happiness.",des:"Tres pequeños bocados de felicidad."},
  {id:"berry-tart",cat:"pastry",photo:"lavie_03_pastry_counter.png",cents:850,en:"Fresh Berry Tart",es:"Tarta de frutos rojos",den:"Buttery pastry with berries and vanilla cream.",des:"Masa de mantequilla, frutos rojos y crema de vainilla."},
  {id:"avocado-toast",cat:"brunch",photo:"lavie_07_brunch_toast.png",cents:1600,en:"Garden Avocado Toast",es:"Tostada de aguacate",den:"Toasted sourdough, fresh avocado and a bright finish.",des:"Pan de masa madre, aguacate fresco y un toque especial."},
 ];
 const t={
  en:{
   skip:"Skip to content",announcement:"SLOW MORNINGS · GOOD COFFEE · LITTLE PINK MOMENTS",tickerCoffee:"COFFEE & CONVERSATION",tickerFashion:"THE BOUTIQUE EDIT",tickerBrunch:"FRESH PASTRIES & BRUNCH",tickerMoments:"LITTLE PINK MOMENTS",navMenu:"The menu",navExperience:"Our café",navMoments:"The moments",navVisit:"Come on in",bag:"Bag",
   heroKicker:"YOUR LITTLE PINK ESCAPE",heroTitle1:"Coffee tastes",heroTitle2:"better in pink.",heroLead:"Thoughtfully made coffee, fresh-from-the-oven pastries, and the kind of place where one cup turns into your favorite afternoon.",browse:"Explore the menu",order:"Order online",heroFoot:"YOUR NEW DAILY RITUAL",heroSticker:"come as you are · stay a little longer",
   editKicker:"MADE FOR YOUR FAVORITE MOMENTS",editTitle:"The little things, done beautifully.",editLead:"A warm cup, a flaky bite, and nowhere else you need to be.",favKicker:"THE LITTLE PINK EDIT",favTitle:"The moments between.",favLead:"Beautifully ordinary days, coffee in hand.",galleryCaption1:"The first coffee of the day",galleryCaption2:"Better together",galleryCaption3:"The boutique edit",galleryCaption4:"An afternoon in pink",cardCoffee:"The coffee edit",cardPastry:"The sweet edit",cardBrunch:"The brunch edit",
   menuKicker:"SIX HANDPICKED FAVORITES",menuTitle:"The café edit.",menuLead:"A short, lovely selection of the drinks, pastries and brunch moments we love most.",filterAll:"Everything",filterCoffee:"Coffee & drinks",filterPastry:"Bakery & sweets",filterBrunch:"All-day brunch",menuNote:"Good food, good coffee, good company. Just how we like it.",
   experienceKicker:"MORE THAN YOUR USUAL COFFEE RUN",experienceTitle1:"Good coffee.",experienceTitle2:"Even better company.",experienceLead:"Come for the latte. Stay for the conversation, the second pastry, and those little moments you wish would last longer.",exploreCafe:"A look inside our world",
   featuredKicker:"WELCOME TO OUR CORNER",featuredTitle:"Stay a little longer.",featuredLead:"Soft light, warm coffee, and a table that feels like it was saved just for you.",seeDrinks:"Explore the café menu",
   momentsKicker:"A LITTLE LOOK INSIDE",momentsTitle:"Scenes from the pink side.",momentsLead:"Slow down, take a sip, and make yourself at home.",momentsCap1:"A table worth sharing",momentsCap2:"Your favorite kind of afternoon",momentsCap3:"Made for sweet moments",
   lifestyleKicker:"LIFE LOOKS LOVELY IN PINK",lifestyleTitle1:"A little more ",lifestylePink:"pink",lifestyleTitle2:" in every day.",lifestyleLead:"Made for unhurried afternoons, pretty little discoveries and the moments in between.",lifestyleCap1:"A little time for yourself.",lifestyleCap2:"Take the lovely way home.",closingKicker:"WE SAVED YOU A SEAT",closingTitle:"Let's make today a little sweeter.",closingLead:"Take it to go or make an afternoon of it. Your next coffee moment starts here.",closingButton:"Start your order",footerLine:"A little joy in every cup.",
   cartKicker:"YOUR LITTLE PINK ORDER",cartTitle:"Your bag",add:"Add to bag",emptyTitle:"Your bag is looking a little lonely.",emptyLead:"Good things are waiting on the menu.",backToMenu:"See the menu",subtotal:"Subtotal",pickup:"To go",dineIn:"Dine in",continue:"Continue",checkout:"Your details",back:"Back to your bag",name:"First name",email:"Email address",notes:"Anything we should know? (optional)",place:"Preview my order",total:"Total",sent:"Your preview is complete!",confirmed:"Here's a look at how your café order would appear.",again:"Back to the menu",previewNote:"This is a demo order preview. No payment is taken, no order is submitted and no confirmation email is sent.",receipt:"Preview reference",mode:"Service",required:"Please enter a name and valid email address.",preview:"ORDER PREVIEW",qty:"Quantity",productType:{coffee:"COFFEE & DRINKS",pastry:"BAKERY & SWEETS",brunch:"ALL-DAY BRUNCH"}
  },
  es:{
   skip:"Ir al contenido",announcement:"MAÑANAS SIN PRISA · BUEN CAFÉ · PEQUEÑOS MOMENTOS ROSAS",tickerCoffee:"CAFÉ Y CONVERSACIONES",tickerFashion:"EL EDITORIAL BOUTIQUE",tickerBrunch:"REPOSTERÍA Y BRUNCH",tickerMoments:"PEQUEÑOS MOMENTOS ROSAS",navMenu:"Menú",navExperience:"La cafetería",navMoments:"Momentos",navVisit:"Ven a disfrutar",bag:"Bolsa",
   heroKicker:"TU PEQUEÑO RINCÓN ROSA",heroTitle1:"El café sabe",heroTitle2:"mejor en rosa.",heroLead:"Café preparado con cariño, repostería recién hecha y un lugar donde una taza se convierte en tu tarde favorita.",browse:"Explorar el menú",order:"Pedir online",heroFoot:"TU NUEVO RITUAL DIARIO",heroSticker:"ven como eres · quédate un ratito más",
   editKicker:"HECHO PARA TUS MOMENTOS FAVORITOS",editTitle:"Los pequeños placeres, hechos con encanto.",editLead:"Un café calentito, algo dulce y todo el tiempo del mundo.",favKicker:"EL EDITORIAL ROSA",favTitle:"Los momentos entre todo.",favLead:"Días bonitos, un café en la mano.",galleryCaption1:"El primer café del día",galleryCaption2:"Mejor acompañadas",galleryCaption3:"El rincón boutique",galleryCaption4:"Una tarde en rosa",cardCoffee:"El rincón del café",cardPastry:"El rincón dulce",cardBrunch:"El rincón del brunch",
   menuKicker:"SEIS FAVORITOS",menuTitle:"El rincón del café.",menuLead:"Una selección especial de bebidas, postres y brunch para disfrutar sin prisa.",filterAll:"Todo",filterCoffee:"Café y bebidas",filterPastry:"Repostería y dulces",filterBrunch:"Brunch todo el día",menuNote:"Buena comida, buen café, buena compañía. Así nos gusta.",
   experienceKicker:"MUCHO MÁS QUE UNA CAFETERÍA",experienceTitle1:"Buen café.",experienceTitle2:"Mejor compañía.",experienceLead:"Ven por el latte. Quédate por la conversación, el segundo postre y esos momentos que quieres alargar.",exploreCafe:"Descubre nuestro rincón",
   featuredKicker:"BIENVENIDA A NUESTRO RINCÓN",featuredTitle:"Quédate un ratito más.",featuredLead:"Luz suave, café recién hecho y una mesa que parece esperarte.",seeDrinks:"Explorar el menú",
   momentsKicker:"UN VISTAZO A NUESTRO MUNDO",momentsTitle:"Momentos del lado rosa.",momentsLead:"Baja el ritmo, disfruta tu café y siéntete como en casa.",momentsCap1:"Una mesa para compartir",momentsCap2:"Tu tarde favorita",momentsCap3:"Momentos dulces",
   lifestyleKicker:"LA VIDA ES MÁS BONITA EN ROSA",lifestyleTitle1:"Un poquito más de ",lifestylePink:"rosa",lifestyleTitle2:" en cada día.",lifestyleLead:"Para tardes sin prisa, pequeños descubrimientos y esos momentos que te hacen sonreír.",lifestyleCap1:"Un ratito para ti.",lifestyleCap2:"El camino más bonito a casa.",closingKicker:"TE GUARDAMOS UN SITIO",closingTitle:"Hagamos que hoy sea un poquito más dulce.",closingLead:"Pide para llevar o disfruta aquí sin prisa. Tu próximo café te espera.",closingButton:"Empezar mi pedido",footerLine:"Un poquito de alegría en cada taza.",
   cartKicker:"TU PEDIDO ROSA",cartTitle:"Tu bolsa",add:"Añadir",emptyTitle:"Tu bolsa está esperando algo rico.",emptyLead:"El menú está lleno de cosas buenas.",backToMenu:"Ver el menú",subtotal:"Subtotal",pickup:"Para llevar",dineIn:"Comer aquí",continue:"Continuar",checkout:"Tus datos",back:"Volver a tu bolsa",name:"Nombre",email:"Correo electrónico",notes:"¿Algo que debamos saber? (opcional)",place:"Ver mi pedido",total:"Total",sent:"¡Tu vista previa está lista!",confirmed:"Así se vería tu pedido de cafetería.",again:"Volver al menú",previewNote:"Esta es una demostración del pedido. No se realiza un cobro ni se envía un pedido o correo de confirmación.",receipt:"Referencia de muestra",mode:"Servicio",required:"Escribe tu nombre y un correo válido.",preview:"VISTA PREVIA DEL PEDIDO",qty:"Cantidad",productType:{coffee:"CAFÉ Y BEBIDAS",pastry:"REPOSTERÍA Y DULCES",brunch:"BRUNCH TODO EL DÍA"}
  }
 };
 const state={lang:"en",filter:"all",cart:new Map(),mode:"pickup",step:"cart",customer:{name:"",email:"",notes:""},ref:""};
 const fmt=cents=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(cents/100);
 const text=(node,value)=>{if(node)node.textContent=value;};
 const dict=()=>t[state.lang];
 const nameOf=p=>p[state.lang];
 const descOf=p=>p[state.lang==="en"?"den":"des"];
 const findProduct=id=>productData.find(p=>p.id===id);
 const total=()=>Array.from(state.cart.entries()).reduce((sum,[id,count])=>sum+(findProduct(id)?.cents||0)*count,0);
 const count=()=>Array.from(state.cart.values()).reduce((sum,n)=>sum+n,0);
 function translate(){
  document.documentElement.lang=state.lang;
  $$("[data-t]").forEach(node=>{const value=dict()[node.dataset.t];if(typeof value==="string")node.textContent=value;});
  $$("[data-lang]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.lang===state.lang)));
  const bag=$("[data-open-cart]");if(bag)bag.setAttribute("aria-label",state.lang==="es"?"Abrir bolsa":"Open bag");
  renderMenu();renderCart();
 }
 function renderMenu(){
  const grid=$("#menu-grid");if(!grid)return;
  grid.replaceChildren();
  productData.filter(p=>state.filter==="all"||p.cat===state.filter).forEach(p=>{
   const article=document.createElement("article");article.className="menu-card";
   const media=document.createElement("div");media.className="menu-card-media";
   const img=document.createElement("img");img.src=photo(p.photo);img.alt=nameOf(p);img.loading="lazy";img.decoding="async";img.width=1101;img.height=1376;media.append(img);
   const content=document.createElement("div");content.className="menu-card-content";
   const category=document.createElement("p");category.className="menu-card-topline";category.textContent=dict().productType[p.cat];
   const title=document.createElement("h3");title.textContent=nameOf(p);
   const description=document.createElement("p");description.textContent=descOf(p);
   const bottom=document.createElement("div");bottom.className="menu-card-bottom";
   const prices=document.createElement("div");prices.className="price-wrap";
   const price=document.createElement("strong");price.textContent=fmt(p.cents);prices.append(price);
   if(p.was){const del=document.createElement("del");del.textContent=fmt(p.was);prices.append(del);}
   const add=document.createElement("button");add.type="button";add.className="add-btn";add.dataset.add=p.id;add.textContent="+";add.setAttribute("aria-label",dict().add+" "+nameOf(p));
   bottom.append(prices,add);content.append(category,title,description,bottom);article.append(media,content);grid.append(article);
  });
  $$("[data-filter]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.filter===state.filter)));
 }
 function appendAction(container,label,action,classes){
  const button=document.createElement("button");button.type="button";button.textContent=label;button.className=classes||"cart-button";button.dataset.action=action;container.append(button);return button;
 }
 function summary(container){
  const box=document.createElement("div");box.className="checkout-summary";
  for(const [id,quantity] of state.cart){
   const p=findProduct(id);if(!p)continue;
   const line=document.createElement("p");const label=document.createElement("span");label.textContent=quantity+" × "+nameOf(p);const price=document.createElement("strong");price.textContent=fmt(p.cents*quantity);line.append(label,price);box.append(line);
  }
  const line=document.createElement("p");line.style.borderTop="1px solid #e0c3cb";line.style.paddingTop="12px";line.style.marginTop="13px";
  const label=document.createElement("strong");label.textContent=dict().total;const price=document.createElement("strong");price.textContent=fmt(total());line.append(label,price);box.append(line);container.append(box);
 }
 function note(container){const p=document.createElement("p");p.className="cart-note";p.textContent=dict().previewNote;container.append(p);}
 function renderCart(){
  const counter=$("#bag-count"),body=$("#cart-body");text(counter,String(count()));if(!body)return;
  body.replaceChildren();
  if(state.step==="confirmed"){const wrap=document.createElement("div");wrap.className="confirmation";
    const mark=document.createElement("span");mark.className="confirmation-mark";mark.setAttribute("aria-hidden","true");mark.textContent="✓";
    const title=document.createElement("h3");title.textContent=dict().sent;
    const lead=document.createElement("p");lead.textContent=dict().confirmed;
    const ref=document.createElement("p");ref.textContent=dict().receipt+": "+state.ref;ref.style.fontWeight="700";
    const mode=document.createElement("p");mode.textContent=dict().mode+": "+(state.mode==="pickup"?dict().pickup:dict().dineIn);
    wrap.append(mark,title,lead,ref,mode);summary(wrap);note(wrap);appendAction(wrap,dict().again,"reset");body.append(wrap);return;
  }
  if(state.step==="checkout"){
   appendAction(body,"‹ "+dict().back,"back","cart-back");
   const title=document.createElement("h3");title.className="checkout-title";title.textContent=dict().checkout;body.append(title);
   summary(body);
   const form=document.createElement("form");form.className="checkout-form";form.id="preview-checkout";
   for(const field of ["name","email","notes"]){
     const label=document.createElement("label");label.textContent=dict()[field];
     const input=field==="notes"?document.createElement("textarea"):document.createElement("input");
     input.name=field;input.id="checkout-"+field;if(field==="email")input.type="email";if(field!=="notes")input.required=true;
     input.autocomplete=field==="name"?"given-name":field==="email"?"email":"off";
     input.value=state.customer[field]||"";input.maxLength=field==="notes"?250:120;
     label.append(input);form.append(label);
   }
   const submit=document.createElement("button");submit.type="submit";submit.className="cart-button";submit.textContent=dict().place;form.append(submit);body.append(form);note(body);return;
  }
  if(state.cart.size===0){
   const empty=document.createElement("div");empty.className="cart-empty";
   const title=document.createElement("h3");title.textContent=dict().emptyTitle;
   const lead=document.createElement("p");lead.textContent=dict().emptyLead;
   empty.append(title,lead);appendAction(empty,dict().backToMenu,"browse");body.append(empty);return;
  }
  for(const [id,quantity] of state.cart){
   const p=findProduct(id);if(!p)continue;
   const row=document.createElement("div");row.className="cart-row";
   const img=document.createElement("img");img.src=photo(p.photo);img.alt="";img.loading="lazy";img.width=82;img.height=94;
   const info=document.createElement("div");const title=document.createElement("h3");title.textContent=nameOf(p);
   const price=document.createElement("p");price.textContent=fmt(p.cents*quantity);
   const qty=document.createElement("div");qty.className="qty";
   const minus=document.createElement("button");minus.type="button";minus.dataset.less=id;minus.setAttribute("aria-label","Remove one "+nameOf(p));minus.textContent="−";
   const n=document.createElement("span");n.textContent=quantity;n.setAttribute("aria-label",dict().qty+" "+quantity);
   const plus=document.createElement("button");plus.type="button";plus.dataset.more=id;plus.setAttribute("aria-label","Add one "+nameOf(p));plus.textContent="+";
   qty.append(minus,n,plus);info.append(title,price,qty);row.append(img,info);body.append(row);
  }
  const sub=document.createElement("p");sub.className="cart-total";const label=document.createElement("span");label.textContent=dict().subtotal;const price=document.createElement("strong");price.textContent=fmt(total());sub.append(label,price);body.append(sub);
  const mode=document.createElement("div");mode.className="order-mode";
  for(const value of ["pickup","dineIn"]){const b=document.createElement("button");b.type="button";b.dataset.mode=value;b.setAttribute("aria-pressed",String(state.mode===value));b.textContent=dict()[value];mode.append(b);}body.append(mode);
  appendAction(body,dict().continue,"checkout");note(body);
 }
 let returnFocus=null;
 function openCart(){
  const layer=$("#cart-layer");if(!layer)return;
  returnFocus=document.activeElement;state.step=state.step==="confirmed"?"cart":state.step;
  renderCart();layer.hidden=false;document.body.classList.add("no-scroll");$(".close-cart")?.focus();
 }
 function closeCart(){
  const layer=$("#cart-layer");if(!layer)return;
  layer.hidden=true;document.body.classList.remove("no-scroll");returnFocus?.focus?.();
 }
 function add(id){if(!findProduct(id))return;state.cart.set(id,Math.min(99,(state.cart.get(id)||0)+1));state.step="cart";openCart();}
 function change(id,delta){const next=(state.cart.get(id)||0)+delta;if(next<=0)state.cart.delete(id);else state.cart.set(id,Math.min(99,next));renderCart();}
 function reset(){state.cart.clear();state.step="cart";state.customer={name:"",email:"",notes:""};renderCart();closeCart();$("#menu")?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}
 function onAction(action){if(action==="browse"){closeCart();$("#menu")?.scrollIntoView({behavior:"smooth"});}if(action==="checkout"&&state.cart.size){state.step="checkout";renderCart();$("#cart-body")?.scrollTo(0,0);}if(action==="back"){state.step="cart";renderCart();}if(action==="reset")reset();}
 document.addEventListener("click",event=>{
  const node=event.target.closest?.("button");if(!node)return;
  if(node.dataset.lang){state.lang=node.dataset.lang;translate();return;}
  if(node.dataset.filter){state.filter=node.dataset.filter;renderMenu();return;}
  if(node.dataset.add){add(node.dataset.add);const bag=$(".bag-trigger");if(bag&&bag.animate&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){bag.animate([{transform:"scale(1)"},{transform:"scale(1.1)"},{transform:"scale(1)"}],{duration:420,easing:"ease-out"});}return;}
  if(node.hasAttribute("data-open-cart")){openCart();return;}
  if(node.hasAttribute("data-close-cart")){closeCart();return;}
  if(node.dataset.more){change(node.dataset.more,1);return;}
  if(node.dataset.less){change(node.dataset.less,-1);return;}
  if(node.dataset.mode){state.mode=node.dataset.mode;renderCart();return;}
  if(node.dataset.action){onAction(node.dataset.action);return;}
 });
 document.addEventListener("submit",event=>{
  if(event.target.id!=="preview-checkout")return;
  event.preventDefault();
  const form=event.target;
  if(!form.reportValidity()||state.cart.size===0)return;
  const formData=new FormData(form);
  state.customer={name:String(formData.get("name")||"").trim().slice(0,120),email:String(formData.get("email")||"").trim().slice(0,120),notes:String(formData.get("notes")||"").trim().slice(0,250)};
  if(!state.customer.name||!state.customer.email){alert(dict().required);return;}
  state.ref="PREVIEW-"+String(Date.now()).slice(-6);
  state.step="confirmed";renderCart();$("#cart-body")?.scrollTo(0,0);
 });
 document.addEventListener("keydown",event=>{
  const layer=$("#cart-layer");if(layer?.hidden!==false)return;
  if(event.key==="Escape"){event.preventDefault();closeCart();return;}
  if(event.key==="Tab"){const focusable=$$("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href]",layer).filter(n=>n.getClientRects().length>0);if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
 });
function enterMobileHero(){
 if(new URLSearchParams(location.search).get("cart")==="open")openCart();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{translate();enterMobileHero();},{once:true});
else{translate();enterMobileHero();}
})();