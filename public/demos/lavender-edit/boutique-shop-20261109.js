/* Lavanda Boutique — browser-only shopping demonstration.
   Uses the canonical existing TLE sample-price catalog; no payments,
   backend, checkout API, order submission, personal data or persistence. */
(()=>{"use strict";
if(document.documentElement.dataset.tleOneMotion!=="lavender-edit")return;
const catalog=()=>window.TLE_DEMO_PRICE_CATALOGS?.["lavender-edit"]?.items||[];
const cart=new Map();
const currency=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"});
const tr={
en:{shop:"Shop",bag:"Bag",add:"Add to bag",collection:"The boutique edit.",kicker:"Selected favorites · Demo prices",note:"Example collection and prices. You can try the bag and checkout; no order or payment will be sent.",head:"Your bag",eyebrow:"Lavanda Boutique · interactive demo",empty:"Your bag is waiting for something lovely.",remove:"Remove",qty:"Quantity",subtotal:"Demo subtotal",noCharge:"Demo only. No payment, card, address or personal details are required. Nothing will be charged or ordered.",checkout:"Review demo order",continue:"Continue shopping",review:"Review your demo purchase",reviewNote:"This is a demonstration. Completing it will not create an order or charge you.",complete:"Complete demo purchase",back:"Back to bag",success:"Your demo purchase is complete!",successNote:"You have experienced the shopping flow. No payment was made, no purchase was placed and no information was sent.",again:"Keep exploring",close:"Close shopping bag",added:"Added to demo bag",plus:"Increase quantity",minus:"Decrease quantity",items:"items"},
es:{shop:"Comprar",bag:"Bolsa",add:"Añadir a la bolsa",collection:"La colección boutique.",kicker:"Favoritos seleccionados · Precios de ejemplo",note:"Colección y precios de ejemplo. Puedes probar la bolsa y el checkout; no se enviará ningún pedido ni pago.",head:"Tu bolsa",eyebrow:"Lavanda Boutique · demo interactiva",empty:"Tu bolsa espera algo especial.",remove:"Eliminar",qty:"Cantidad",subtotal:"Subtotal de demostración",noCharge:"Solo demostración. No necesitas tarjeta, dirección ni datos personales. No se cobrará ni enviará ningún pedido.",checkout:"Revisar pedido de prueba",continue:"Seguir comprando",review:"Revisa tu compra simulada",reviewNote:"Es una demostración. Completarla no genera pedidos ni cargos.",complete:"Completar compra simulada",back:"Volver a la bolsa",success:"¡Tu compra simulada está completa!",successNote:"Has probado el proceso de compra. No se realizó ningún pago, no se creó un pedido ni se envió información.",again:"Seguir explorando",close:"Cerrar la bolsa",added:"Añadido a la bolsa de prueba",plus:"Aumentar cantidad",minus:"Disminuir cantidad",items:"artículos"}
};
const lang=()=>document.documentElement.lang==="es"?"es":"en";
const t=k=>tr[lang()][k]||k;
const money=cents=>currency.format(cents/100);
const count=()=>[...cart.values()].reduce((s,q)=>s+q,0);
const total=()=>catalog().reduce((sum,p,i)=>sum+p.priceCents*(cart.get(i)||0),0);
let drawer,backdrop,bodyEl,bottomEl,trigger,live,phase="bag",lastFocus,completedTotal=0,completedItems=[];
const button=(label,kind,disabled=false)=>{const el=document.createElement("button");el.type="button";el.textContent=label;el.className=kind==="primary"?"lb-cart-primary":"lb-cart-secondary";el.dataset.lbAction=kind==="primary"?(phase==="bag"?"review":phase==="review"?"complete":"close"):(phase==="review"?"back":"close");el.disabled=disabled;return el;};
function updateBadge(){
 const n=count();const node=trigger?.querySelector("[data-lb-cart-count]");if(node)node.textContent=String(n);
 if(trigger)trigger.setAttribute("aria-label",t("bag")+" — "+n+" "+t("items"));
 const word=trigger?.querySelector("[data-lb-cart-word]");if(word)word.textContent=t("bag");
}
function buildRow(product,i,quantity,readonly){
 const row=document.createElement("article");row.className="lb-cart-row";
 const img=document.createElement("img");img.loading="lazy";img.alt="";img.src=product.image||"./photos/05_Lavender_Gifting.png";row.append(img);
 const info=document.createElement("div");
 const name=document.createElement("h3");name.className="lb-cart-name";name.textContent=product.name;info.append(name);
 const price=document.createElement("span");price.className="lb-cart-money";price.textContent=money(product.priceCents*quantity);info.append(price);
 const controls=document.createElement("div");controls.className="lb-cart-controls";
 if(!readonly){
  const less=document.createElement("button");less.type="button";less.textContent="−";less.dataset.lbAction="minus";less.dataset.lbItem=String(i);less.setAttribute("aria-label",t("minus")+" "+product.name);controls.append(less);
 }
 const amt=document.createElement("span");amt.className="lb-cart-qty";amt.textContent=(readonly?t("qty")+": ":"")+String(quantity);controls.append(amt);
 if(!readonly){
  const plus=document.createElement("button");plus.type="button";plus.textContent="+";plus.dataset.lbAction="plus";plus.dataset.lbItem=String(i);plus.setAttribute("aria-label",t("plus")+" "+product.name);controls.append(plus);
  const remove=document.createElement("button");remove.type="button";remove.className="lb-remove";remove.dataset.lbAction="remove";remove.dataset.lbItem=String(i);remove.textContent=t("remove");controls.append(remove);
 }
 info.append(controls);row.append(info);return row;
}
function render(){
 if(!drawer)return;
 drawer.querySelector("[data-lb-title]").textContent=phase==="bag"?t("head"):phase==="review"?t("review"):t("success");
 drawer.querySelector("[data-lb-eyebrow]").textContent=t("eyebrow");
 drawer.querySelector("[data-lb-close]").setAttribute("aria-label",t("close"));
 bodyEl.replaceChildren();bottomEl.replaceChildren();
 if(phase==="success"){
  const box=document.createElement("div");box.className="lb-cart-confirm";box.dataset.demoReceipt="lavender-edit";
  const check=document.createElement("div");check.className="lb-cart-checkmark";check.textContent="✓";check.setAttribute("aria-hidden","true");box.append(check);
  const heading=document.createElement("h3");heading.textContent=t("success");box.append(heading);
  const message=document.createElement("p");message.textContent=t("successNote");box.append(message);
  const items=document.createElement("ul");items.className="tle-receipt-lines";
  for(const [index,qty] of completedItems){
   const product=catalog()[index];
   if(!product)continue;
   const row=document.createElement("li");row.dataset.receiptLine="";
   const label=document.createElement("span");label.textContent=qty+" × "+product.name;
   const price=document.createElement("strong");price.textContent=money(product.priceCents*qty);
   row.append(label,price);items.append(row);
  }
  box.append(items);bodyEl.append(box);window.TLEDemoConfirmation?.play(box);
  const amount=document.createElement("p");amount.className="lb-cart-total";amount.textContent=t("subtotal")+": "+money(completedTotal);bottomEl.append(amount,button(t("again"),"primary"));return;
 }
 if(count()===0){const empty=document.createElement("p");empty.className="lb-cart-empty";empty.textContent=t("empty");bodyEl.append(empty);}
 else{
  for(const [i,qty] of cart){const product=catalog()[i];if(product)bodyEl.append(buildRow(product,i,qty,phase==="review"));}
 }
 const line=document.createElement("div");line.className="lb-cart-total";
 const a=document.createElement("span");a.textContent=t("subtotal");const b=document.createElement("strong");b.textContent=money(total());line.append(a,b);bottomEl.append(line);
 const note=document.createElement("p");note.className="lb-cart-disclaimer";note.textContent=phase==="review"?t("reviewNote"):t("noCharge");bottomEl.append(note);
 if(phase==="bag"){bottomEl.append(button(t("checkout"),"primary",count()===0),button(t("continue"),"secondary"));}
 else bottomEl.append(button(t("complete"),"primary",count()===0),button(t("back"),"secondary"));
}
function show(){
 if(!drawer)return;
 lastFocus=document.activeElement;
 phase="bag";backdrop.hidden=false;drawer.hidden=false;document.body.classList.add("lb-bag-open");
 trigger?.setAttribute("aria-expanded","true");render();drawer.querySelector("[data-lb-close]")?.focus();
}
function hide(){
 if(!drawer)return;
 backdrop.hidden=true;drawer.hidden=true;document.body.classList.remove("lb-bag-open");
 trigger?.setAttribute("aria-expanded","false");(lastFocus?.isConnected?lastFocus:trigger)?.focus();
}
function translationUpdate(){
 updateBadge();const shop=document.querySelector("[data-lb-shop-link]");if(shop)shop.textContent=t("shop");
 const section=document.getElementById("tle-demo-sample-prices");
 if(section?.classList.contains("lb-price-section")){
  const heading=section.querySelector("h2");if(heading)heading.textContent=t("collection");
  const kicker=section.querySelector(".tle-price-kicker");if(kicker)kicker.textContent=t("kicker");
  const note=section.querySelector(".tle-price-note");if(note)note.textContent=t("note");
  section.querySelectorAll("[data-lb-add]").forEach(btn=>btn.textContent=t("add"));
 }
 if(!drawer.hidden)render();
}
function enhance(){
 const section=document.getElementById("tle-demo-sample-prices");
 const products=catalog();
 if(!section||!products.length)return false;
 const cards=[...section.querySelectorAll(".tle-price-card")];if(cards.length!==products.length)return false;
 section.classList.add("lb-price-section");
 section.setAttribute("aria-label",lang()==="es"?"Colección de compras de demostración":"Demo shopping collection");
 cards.forEach((card,i)=>{
  if(card.querySelector("[data-lb-add]"))return;
  const btn=document.createElement("button");btn.type="button";btn.className="lb-add";btn.dataset.lbAdd=String(i);btn.textContent=t("add");card.querySelector(".tle-price-card-body")?.append(btn);
 });
 translationUpdate();return true;
}
function setup(){
 trigger=document.querySelector(".lb-cart-trigger");if(!trigger)return;
 backdrop=document.createElement("div");backdrop.className="lb-cart-backdrop";backdrop.hidden=true;
 drawer=document.createElement("aside");drawer.id="lb-cart-drawer";drawer.className="lb-cart-drawer";drawer.hidden=true;drawer.setAttribute("role","dialog");drawer.setAttribute("aria-modal","true");drawer.setAttribute("aria-labelledby","lb-cart-title");
 drawer.innerHTML='<div class="lb-cart-head"><div><div class="lb-cart-eyebrow" data-lb-eyebrow></div><h2 id="lb-cart-title" data-lb-title></h2></div><button class="lb-cart-close" type="button" data-lb-close aria-label="Close">×</button></div><div class="lb-cart-body" data-lb-body></div><div class="lb-cart-bottom" data-lb-bottom></div>';
 bodyEl=drawer.querySelector("[data-lb-body]");bottomEl=drawer.querySelector("[data-lb-bottom]");
 live=document.createElement("div");live.className="lb-cart-announcement";live.setAttribute("aria-live","polite");
 document.body.append(backdrop,drawer,live);
 backdrop.addEventListener("click",hide);drawer.querySelector("[data-lb-close]").addEventListener("click",hide);
 trigger.addEventListener("click",show);
 document.addEventListener("click",e=>{
  const add=e.target.closest("[data-lb-add]");if(add){
   const i=Number(add.dataset.lbAdd);if(!catalog()[i])return;
   cart.set(i,Math.min(99,(cart.get(i)||0)+1));
   live.textContent=t("added")+": "+catalog()[i].name;
   const motion=window.TLECartMotion?.flyDot(add,trigger,{
     badge:trigger.querySelector("[data-lb-cart-count]"),color:"#B89EB6",onLand:updateBadge
   });
   if(!motion)updateBadge();
   // The bag stays closed until the shopper touches the bag trigger.
   return;
  }
  const ctl=e.target.closest("[data-lb-action]");if(!ctl||drawer.hidden)return;
  const act=ctl.dataset.lbAction;const i=Number(ctl.dataset.lbItem);const current=cart.get(i)||0;
  if(act==="plus"&&catalog()[i])cart.set(i,Math.min(99,current+1));
  if(act==="minus"){if(current<=1)cart.delete(i);else cart.set(i,current-1);}
  if(act==="remove")cart.delete(i);
  if(act==="review"&&count()>0)phase="review";
  if(act==="back")phase="bag";
  if(act==="complete"&&count()>0){completedTotal=total();completedItems=[...cart];cart.clear();phase="success";}
  if(act==="close"){hide();return;}
  updateBadge();render();
 });
 drawer.addEventListener("keydown",e=>{
  if(e.key==="Escape"){e.preventDefault();hide();return;}
  if(e.key!=="Tab")return;
  const focusable=[...drawer.querySelectorAll('button:not([disabled]),a[href]')].filter(el=>el.getClientRects().length>0);
  if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 });
 ["en","es"].forEach(l=>document.getElementById(l)?.addEventListener("click",()=>{
  const section=document.getElementById("tle-demo-sample-prices");
  if(section?.classList.contains("lb-price-section"))section.setAttribute("aria-label",lang()==="es"?"Colección de compras de demostración":"Demo shopping collection");
  translationUpdate();
 }));
 updateBadge();translationUpdate();
// Bridge the session-only wishlist into the original sample bag without opening its drawer.
window.TLEWishlistCart={brand:"lavender-edit",add(id){
 const i=Number(id);if(!Number.isInteger(i)||i<0||!catalog()[i])return false;
 cart.set(i,Math.min(99,(cart.get(i)||0)+1));phase="bag";updateBadge();
 if(!drawer.hidden)render();
 live.textContent=t("added")+": "+catalog()[i].name;
 return true;
}};
 if(!enhance()){
  const observer=new MutationObserver(()=>{if(enhance())observer.disconnect()});
  observer.observe(document.querySelector("main")||document.body,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),15000);
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
})();
