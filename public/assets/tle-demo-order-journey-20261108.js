/* The Launch Era · Browser-only guided order journeys for concept demos.
   No payment gateway, backend order, inventory, delivery availability or email is invoked.
   Product prices come from the same public price-parity catalog when available. */
(function(){
'use strict';
var current=document.currentScript;
var slug=(current&&current.getAttribute('data-tle-order-slug'))||'';
var allowed=['golden-grid','havana-19','la-vie-in-pink','casa-brownie','crumb','yummm','wok-social','seasonal-brew','jaramillo-boutique'];
if(allowed.indexOf(slug)<0||!document.body||document.getElementById('tle-demo-order-dialog'))return;
var base=(window.TLE_DEMO_PRICE_CATALOGS||{})[slug];
var themes={'golden-grid':'#b88625','havana-19':'#813a32','la-vie-in-pink':'#813942','casa-brownie':'#83513e','crumb':'#25546a','yummm':'#b7303b','wok-social':'#bd312d','seasonal-brew':'#95663b','jaramillo-boutique':'#744047'};
var tone=(base&&base.tone)||themes[slug]||'#191919';
var brand={'golden-grid':'GOLDEN GRID','havana-19':'HAVANA 19','la-vie-in-pink':'LA VIE IN PINK','casa-brownie':'CASA BROWNIE','crumb':'CRUMB','yummm':'YUMMM','wok-social':'WOK SOCIAL','seasonal-brew':'SEASONAL BREW','jaramillo-boutique':'JARAMILLO BOUTIQUE'}[slug];
var isSpanish=function(){return document.documentElement.lang.toLowerCase().indexOf('es')===0||document.documentElement.getAttribute('data-language')==='es'};
var tr=function(en,es){return isSpanish()?es:en};
var safe=function(value){return String(value===undefined?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var fmt=function(cents){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100)};
var normalize=function(value){return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'')};
var catalog=(base&&base.kind==='menu'?base.items:[]).map(function(x){return {name:String(x.name),priceCents:Number(x.priceCents),image:String(x.image||'')}});
if(slug==='yummm'){
 catalog=Array.from(document.querySelectorAll('.product-card[data-product][data-price-cents]')).map(function(node){return {name:node.dataset.product,priceCents:Number(node.dataset.priceCents),image:'./images/'+node.dataset.image}});
}
if(slug==='crumb'){
 catalog=Array.from(document.querySelectorAll('.flavor-row')).map(function(node){
  var label=node.querySelector('strong'),price=node.querySelector('[data-builder-price]'),img=node.querySelector('img');
  return label&&price?{name:label.textContent.trim(),priceCents:Math.round(Number((price.textContent.match(/\d+(?:\.\d+)?/)||[])[0])*100),image:img?img.getAttribute('src'):''}:null;
 }).filter(Boolean);
}
if(slug==='jaramillo-boutique'){
 var unitText=document.getElementById('productUnitPrice')?.textContent||'';
 var unitMatch=unitText.match(/\d+(?:\.\d+)?/),unitCents=unitMatch?Math.round(Number(unitMatch[0])*100):0;
 catalog=Array.from(document.querySelectorAll('.collection-card')).map(function(card){return {name:card.dataset.labelEn||'',esName:card.dataset.labelEs||'',priceCents:unitCents,image:card.querySelector('img')?.getAttribute('src')||''}});
}
catalog=catalog.filter(function(x){return x.name&&Number.isInteger(x.priceCents)&&x.priceCents>0&&x.image!==undefined});
if(!catalog.length)return;
var find=function(name){var n=normalize(name);return catalog.find(function(x){return normalize(x.name)===n||(x.esName&&normalize(x.esName)===n)})||catalog.find(function(x){return normalize(x.name).indexOf(n)>=0||n.indexOf(normalize(x.name))>=0})||(slug==='casa-brownie'&&n.indexOf('nuez')>=0?catalog.find(function(x){return normalize(x.name).indexOf('nuez')>=0}):null)};
var dineInAvailable=['havana-19','wok-social','seasonal-brew','yummm','crumb'].includes(slug);
var serviceMode='',cart=new Map(),step=dineInAvailable?'service':'menu',details=null,receipt=null,lastFocus=null;
var count=function(){var n=0;cart.forEach(function(q){n+=q});return n};
var subtotal=function(){var c=0;cart.forEach(function(q,i){c+=catalog[i].priceCents*q});return c};
var rows=function(){return Array.from(cart.entries()).map(function(x){return {item:catalog[x[0]],index:x[0],qty:x[1]}})};
var css=document.createElement('style');
css.id='tle-demo-order-css';
css.textContent=[
'.tle-order-float{--toc-accent:'+tone+';position:fixed;right:max(14px,env(safe-area-inset-right));bottom:max(20px,env(safe-area-inset-bottom));z-index:20000;min-height:54px;display:flex;align-items:center;gap:9px;border:1px solid #ffffff75;background:var(--toc-accent);color:#fff;border-radius:40px;padding:12px 18px;font:700 13px/1.2 system-ui,sans-serif;box-shadow:0 12px 32px #16161648;cursor:pointer;max-width:calc(100vw - 28px);letter-spacing:0;text-transform:none}',
'.tle-order-float b{background:#fff;color:#191919;border-radius:30px;padding:5px 8px;font-size:12px;min-width:22px;text-align:center}',
'.tle-order-float[hidden]{display:none!important}',
'.tle-order-modal{--toc-accent:'+tone+';position:fixed;inset:0;margin:auto;padding:0;width:min(600px,calc(100vw - 22px));max-width:600px;max-height:min(88dvh,840px);border:0;border-radius:22px;background:#faf8f3;color:#191919;box-shadow:0 20px 80px #19191960;font:400 14px/1.5 system-ui,-apple-system,Arial,sans-serif;overflow:auto;overscroll-behavior:contain}',
'.tle-order-modal::backdrop{background:#141414ad;backdrop-filter:blur(3px)}',
'.tle-order-modal *{box-sizing:border-box}.tle-order-modal button,.tle-order-modal input,.tle-order-modal select,.tle-order-modal textarea{font:inherit}',
'.tle-order-modal button{cursor:pointer}.tle-order-head{position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:15px;background:#faf8f3;border-bottom:1px solid #ded8cf;padding:18px 22px 14px}',
'.tle-order-head strong{display:block;letter-spacing:.13em;font-size:11px}.tle-order-head small{color:#655f59;font-size:11px}',
'.tle-order-head button{border:1px solid #d8d2c8;background:#fff;color:#191919;border-radius:50%;height:38px;width:38px;font-size:25px;line-height:1}',
'.tle-order-body{padding:22px;min-height:220px}.tle-order-steps{font-size:10px;color:#786d63;letter-spacing:.15em;text-transform:uppercase;font-weight:800;margin:0 0 12px}',
'.tle-order-body h2{font:500 clamp(27px,5vw,39px)/1.07 Georgia,serif;color:#191919;margin:0 0 14px;letter-spacing:-.025em}',
'.tle-order-lede{color:#58524d;margin:0 0 18px;font-size:13px;line-height:1.6}',
'.tle-order-products{display:grid;gap:9px}.tle-order-product{display:grid;grid-template-columns:78px minmax(0,1fr) auto;align-items:center;gap:12px;padding:9px;border:1px solid #e6ded3;background:white;border-radius:15px}',
'.tle-order-product img{width:78px;height:75px;object-fit:cover;border-radius:10px;background:#ede9e4}',
'.tle-order-product .tle-order-product-placeholder{width:78px;height:75px;background:#ede9e4;border-radius:10px}',
'.tle-order-product strong{display:block;font-size:13px;line-height:1.25}.tle-order-product span{font-size:12px;color:#6c6259}',
'.tle-order-mini{border:1px solid var(--toc-accent);color:var(--toc-accent);background:white;border-radius:50%;width:34px;height:34px;font-weight:800!important;font-size:21px!important}',
'.tle-order-primary{display:block;width:100%;border:0;border-radius:12px;background:var(--toc-accent);color:#fff;padding:14px 16px;font-weight:800!important;min-height:48px;text-align:center}',
'.tle-order-secondary{border:1px solid #d7cfc4;border-radius:12px;background:#fff;color:#191919;padding:12px 14px;min-height:46px;font-weight:700!important}',
'.tle-order-footer{position:sticky;bottom:0;background:#faf8f3;border-top:1px solid #ded8cf;padding:15px 22px 18px;display:grid;gap:9px}',
'.tle-order-two{display:flex;gap:9px}.tle-order-two>*{flex:1}.tle-order-total{display:flex;justify-content:space-between;font-size:14px;font-weight:700;padding:0 0 6px}',
'.tle-order-line{display:flex;align-items:center;gap:10px;padding:14px 0;border-bottom:1px solid #ddd5ca}.tle-order-line strong{flex:1;min-width:0;font-size:13px}.tle-order-line small{color:#756b62}',
'.tle-order-stepper{display:flex;align-items:center;border:1px solid #ddd3c5;border-radius:10px;background:white}.tle-order-stepper button{border:0;background:transparent;color:#191919;padding:6px 10px;font-weight:800!important}.tle-order-stepper span{min-width:19px;text-align:center;font-size:13px}',
'.tle-order-fields{display:grid;gap:13px}.tle-order-fields label{display:grid;gap:6px;font-size:12px;font-weight:700;color:#49423e}',
'.tle-order-fields input,.tle-order-fields select,.tle-order-fields textarea{width:100%;border:1px solid #cfc5b8;border-radius:10px;min-height:45px;background:white;color:#191919;padding:10px 12px;font-size:16px}',
'.tle-order-fields textarea{min-height:70px;resize:vertical}',
'.tle-order-tip{font-size:11px;line-height:1.55;color:#675c52;background:#f0e9e0;border-radius:10px;padding:10px 12px;margin-top:12px}',
'.tle-order-review{background:white;border:1px solid #e2dacd;border-radius:13px;padding:16px}.tle-order-review p{margin:7px 0;overflow-wrap:anywhere}',
'.tle-order-done{text-align:center;padding:20px 3px}.tle-order-done-mark{font-size:39px;color:var(--toc-accent);margin-bottom:15px}',
'.tle-order-demo-tag{font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--toc-accent)}',
'.tle-price-card [data-tle-order-add],.tle-order-inline-add{margin-top:10px;border:1px solid var(--toc-accent,#191919);border-radius:10px;background:transparent;color:var(--toc-accent,#191919);padding:8px 11px;font-weight:700;font-size:12px;cursor:pointer}',
'@media(max-width:550px){.tle-order-float{bottom:max(14px,env(safe-area-inset-bottom));right:10px;padding:12px 14px;font-size:12px}.tle-order-modal{width:100vw;max-width:100vw;max-height:92dvh;margin:auto 0 0;border-radius:20px 20px 0 0}.tle-order-body{padding:18px}.tle-order-head,.tle-order-footer{padding-inline:18px}.tle-order-product{grid-template-columns:63px minmax(0,1fr) 33px;gap:9px}.tle-order-product img,.tle-order-product-placeholder{width:63px!important;height:65px!important}.tle-order-product strong{font-size:12px}.tle-order-line{flex-wrap:wrap}.tle-order-line strong{flex-basis:35%}}',
'@media(prefers-reduced-motion:no-preference){.tle-order-modal[open]{animation:tleDemoCheckoutIn .22s ease-out}@keyframes tleDemoCheckoutIn{from{opacity:.4;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}}',
'.tle-order-modal:not([open]){display:none}.tle-order-modal[open]{display:flex;flex-direction:column;overflow:hidden}.tle-order-modal .tle-order-head,.tle-order-modal .tle-order-footer{flex:0 0 auto;position:relative}.tle-order-modal .tle-order-body{min-width:0;min-height:0;flex:1 1 auto;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain}',
'.tle-order-head>div{min-width:0}.tle-order-head small{overflow-wrap:anywhere}.tle-order-head button{min-width:44px;min-height:44px;flex-shrink:0}.tle-order-footer{min-width:0}.tle-order-two>*{min-width:0}.tle-order-review{min-width:0;overflow:hidden}',
'.tle-order-line{display:grid;grid-template-columns:minmax(0,1fr) auto max-content;align-items:center;gap:12px;min-width:0}.tle-order-line strong{min-width:0;flex:auto;font-size:13px;overflow-wrap:anywhere}.tle-order-line>b{font-size:13px;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}.tle-order-stepper{min-width:0;white-space:nowrap}.tle-order-stepper button{min-width:38px;min-height:44px}.tle-order-stepper span{min-width:20px}',
'.tle-order-service-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:18px 0}.tle-order-service-choice{display:grid;gap:10px;text-align:left;padding:20px 15px;border:1px solid #dbd1c4;border-radius:16px;background:white;color:#191919;min-width:0}.tle-order-service-choice:focus-visible{outline:3px solid var(--toc-accent);outline-offset:2px}.tle-order-service-choice strong{font-size:19px;line-height:1.2}.tle-order-service-choice span,.tle-order-service-note{font-size:12px;color:#665c54;line-height:1.55}.tle-order-service-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 12px;margin:0 0 15px;background:#eee7dc;border-radius:10px;font-size:12px}.tle-order-service-summary button{background:transparent;color:var(--toc-accent);border:0;text-decoration:underline;font-weight:700}',
'@media(max-width:550px){.tle-order-modal[open]{inset:auto 0 0 0;margin:0;width:100vw;max-width:100vw;max-height:calc(94dvh - env(safe-area-inset-top));border-radius:20px 20px 0 0}.tle-order-footer{padding-bottom:calc(14px + env(safe-area-inset-bottom))}.tle-order-line{display:grid;grid-template-columns:minmax(0,1fr) max-content;column-gap:10px;row-gap:8px}.tle-order-line strong{grid-column:1;grid-row:1;flex:auto;min-width:0}.tle-order-line>b{grid-column:2;grid-row:1}.tle-order-line .tle-order-stepper{grid-column:1/-1;grid-row:2;justify-self:end}.tle-order-service-grid{grid-template-columns:1fr}.tle-order-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.tle-order-two>*{min-width:0;width:100%}}'
].join('');
document.head.appendChild(css);
var float=document.createElement('button');
float.type='button';float.className='tle-order-float';float.setAttribute('aria-label',tr('Open demo online order','Abrir pedido online de demostración'));
var dialog=document.createElement('dialog');dialog.className='tle-order-modal';dialog.id='tle-demo-order-dialog';dialog.setAttribute('aria-label',tr('Online order demo','Pedido online de demostración'));
document.body.append(float,dialog);
var close=function(){if(dialog.open)dialog.close()};
function paintFloat(){float.innerHTML=safe(tr('Order online · DEMO','Pedir online · DEMO'))+' <b>'+count()+'</b>'}
function change(name,delta){
 var item=find(name);if(!item)return false;
 var index=catalog.indexOf(item),next=Math.max(0,Math.min(24,(cart.get(index)||0)+delta));
 if(next===0)cart.delete(index);else cart.set(index,next);
 paintFloat();return true;
}
function htmlRows(){
 return rows().map(function(x){return '<div class="tle-order-line"><strong>'+safe(x.item.name)+'<br><small>'+fmt(x.item.priceCents)+' '+tr('each','c/u')+'</small></strong><div class="tle-order-stepper"><button type="button" data-action="remove" data-name="'+safe(x.item.name)+'" aria-label="'+safe(tr('Remove one','Quitar uno'))+'">−</button><span>'+x.qty+'</span><button type="button" data-action="increase" data-name="'+safe(x.item.name)+'" aria-label="'+safe(tr('Add one','Añadir uno'))+'">+</button></div><b>'+fmt(x.qty*x.item.priceCents)+'</b></div>'}).join('')
}
function summary(){return '<div class="tle-order-total"><span>'+tr('Subtotal (USD)','Subtotal (USD)')+'</span><strong>'+fmt(subtotal())+'</strong></div>'}
function modeSummary(){
 return !dineInAvailable||!serviceMode?'':'<div class="tle-order-service-summary"><span>'+(serviceMode==='dinein'?tr('Dine in · table order','Comer aquí · pedido en mesa'):tr('Takeout · pickup','Para llevar · recoger'))+'</span><button type="button" data-action="service">'+tr('Change','Cambiar')+'</button></div>';
}
function fulfillmentFields(){
 if(dineInAvailable&&serviceMode==='dinein')return '<input type="hidden" name="fulfillment" value="dinein"><label>'+tr('Number of guests','Número de personas')+'<select name="guests" required><option value="1">1</option><option value="2" selected>2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option></select></label>';
 if(dineInAvailable&&serviceMode==='takeout')return '<input type="hidden" name="fulfillment" value="pickup"><p class="tle-order-service-note">'+tr('For pickup · no preparation time or availability is confirmed.','Para recoger · no se confirma tiempo de preparación ni disponibilidad.')+'</p>';
 return '<label>'+tr('How would you like it?','¿Cómo lo prefieres?')+'<select name="fulfillment"><option value="pickup" '+(details&&details.fulfillment==='pickup'?'selected':'')+'>'+tr('Pickup · sample','Recogida · ejemplo')+'</option><option value="delivery" '+(details&&details.fulfillment==='delivery'?'selected':'')+'>'+tr('Delivery · sample','Entrega · ejemplo')+'</option></select></label><label data-address-label hidden>'+tr('Delivery address (demo)','Dirección de entrega (demo)')+'<input name="address" autocomplete="off" maxlength="180" placeholder="'+tr('Sample address','Dirección de ejemplo')+'" value="'+safe(details&&details.address||'')+'"></label>';
}
function render(){
 var h='<div class="tle-order-head"><div><strong>'+safe(brand)+'</strong><small>'+tr('Interactive ordering experience · demo only','Experiencia de pedido interactiva · solo demo')+'</small></div><button type="button" data-action="close" aria-label="'+tr('Close','Cerrar')+'">×</button></div>';
 var body='',foot='',progress='';
 if(step==='service'){
  progress=tr('YOUR EXPERIENCE','TU EXPERIENCIA');
  body='<h2>'+tr('Dine in or take it to go?','¿Comer aquí o para llevar?')+'</h2><p class="tle-order-lede">'+tr('Two different ways to enjoy the menu. Choose the experience you want to preview.','Dos formas de disfrutar el menú. Elige cuál quieres explorar.')+'</p><div class="tle-order-service-grid"><button type="button" class="tle-order-service-choice" data-action="dinein"><strong>'+tr('Dine in','Comer aquí')+'</strong><span>'+tr('Explore an order for your table. This does not reserve a table.','Explora un pedido para tu mesa. Esto no reserva una mesa.')+'</span></button><button type="button" class="tle-order-service-choice" data-action="takeout"><strong>'+tr('Takeout','Para llevar')+'</strong><span>'+tr('Build an order for pickup and review your bag.','Prepara un pedido para recoger y revisa tu carrito.')+'</span></button></div>';
  foot='<p class="tle-order-service-note">'+tr('Preview only. No actual order, charge, reservation or email will be created.','Solo una vista previa. No se genera pedido, cobro, reserva ni correo real.')+'</p>';
 }else if(step==='menu'){
  progress='01 / 04';body='<h2>'+tr('What sounds good?','¿Qué te apetece?')+'</h2><p class="tle-order-lede">'+tr('Pick your favorites and build a sample order.','Elige tus favoritos y prepara un pedido de demostración.')+'</p>'+modeSummary()+'<div class="tle-order-products">'+catalog.map(function(x){return '<div class="tle-order-product">'+(x.image?'<img alt="" loading="lazy" src="'+safe(x.image)+'">':'<span class="tle-order-product-placeholder"></span>')+'<div><strong>'+safe(x.name)+'</strong><span>'+fmt(x.priceCents)+'</span></div><button type="button" class="tle-order-mini" data-action="add" data-name="'+safe(x.name)+'" aria-label="'+safe(tr('Add to cart: ','Añadir al carrito: ')+x.name)+'">+</button></div>'}).join('')+'</div>';
  foot=summary()+'<button type="button" class="tle-order-primary" data-action="cart">'+tr('View cart','Ver carrito')+' ('+count()+')</button>';
 }else if(step==='cart'){
  progress='02 / 04';body='<h2>'+tr('Your bag, your way.','Tu carrito, a tu gusto.')+'</h2><p class="tle-order-lede">'+tr('Adjust quantities before continuing.','Ajusta las cantidades antes de continuar.')+'</p>'+modeSummary()+(count()?htmlRows():'<p>'+tr('Your bag is empty.','Tu carrito está vacío.')+'</p>');
  foot=summary()+'<div class="tle-order-two"><button type="button" class="tle-order-secondary" data-action="menu">'+tr('Add items','Añadir productos')+'</button><button type="button" class="tle-order-primary" data-action="details" '+(!count()?'disabled':'')+'>'+tr('Continue','Continuar')+'</button></div>';
 }else if(step==='details'){
  progress='03 / 04';body='<h2>'+tr('A few little details.','Solo unos datos.')+'</h2><p class="tle-order-lede">'+tr('Preview the final step. Your information stays in this browser.','Explora el último paso. Los datos permanecen en este navegador.')+'</p>'+modeSummary()+'<form id="tle-order-details" class="tle-order-fields"><label>'+tr('Name','Nombre')+'<input name="customer" required maxlength="80" autocomplete="off" placeholder="'+tr('Your name','Tu nombre')+'" value="'+safe(details&&details.customer||'')+'"></label><label>'+tr('Email','Correo electrónico')+'<input name="email" type="email" required autocomplete="off" maxlength="160" placeholder="name@example.com" value="'+safe(details&&details.email||'')+'"></label>'+fulfillmentFields()+'<label>'+tr('Order note (optional)','Nota para el pedido (opcional)')+'<textarea name="notes" maxlength="250" placeholder="'+tr('Any preferences?','¿Alguna preferencia?')+'">'+safe(details&&details.notes||'')+'</textarea></label></form><p class="tle-order-tip">'+tr('This is a sample checkout. No availability is checked, no payment is taken and no details are submitted.','Esta compra es de ejemplo. No se verifica disponibilidad, no se cobra ni se envían tus datos.')+'</p>';
  foot=summary()+'<div class="tle-order-two"><button type="button" class="tle-order-secondary" data-action="cart">'+tr('Back to bag','Volver al carrito')+'</button><button type="button" class="tle-order-primary" data-action="review">'+tr('Review order','Revisar pedido')+'</button></div>';
 }else if(step==='review'){
  progress='04 / 04';body='<h2>'+tr('Everything look right?','¿Todo correcto?')+'</h2><div class="tle-order-review"><span class="tle-order-demo-tag">'+tr('Sample order','Pedido de ejemplo')+'</span>'+modeSummary()+htmlRows()+'<p><strong>'+tr('Name: ','Nombre: ')+'</strong>'+safe(details.customer)+'</p><p><strong>'+tr('Method: ','Modalidad: ')+'</strong>'+(details.fulfillment==='dinein'?tr('Dine in (sample)','Comer aquí (ejemplo)'):(details.fulfillment==='delivery'?tr('Delivery (sample)','Entrega (ejemplo)'):tr('Takeout / Pickup (sample)','Para llevar / recoger (ejemplo)')))+'</p>'+(details.guests?'<p><strong>'+tr('Guests: ','Personas: ')+'</strong>'+safe(details.guests)+'</p>':'')+(details.notes?'<p><strong>'+tr('Note: ','Nota: ')+'</strong>'+safe(details.notes)+'</p>':'')+'</div><p class="tle-order-tip">'+tr('This confirmation is only a demo. No email, table reservation, charge or real order will be generated.','Esta confirmación es solo una demostración. No se genera correo, reserva de mesa, cargo ni pedido real.')+'</p>';
  foot=summary()+'<div class="tle-order-two"><button type="button" class="tle-order-secondary" data-action="details">'+tr('Edit details','Editar datos')+'</button><button type="button" class="tle-order-primary" data-action="confirm">'+tr('Confirm demo order','Confirmar pedido DEMO')+'</button></div>';
 }else{
  body='<div class="tle-order-done"><div class="tle-order-done-mark" aria-hidden="true">✓</div><div class="tle-order-demo-tag">'+tr('Experience completed','Experiencia completada')+'</div><h2>'+tr('Your sample order is complete.','Tu pedido de ejemplo está listo.')+'</h2><p><strong>'+tr('Demo reference: ','Referencia de ejemplo: ')+'</strong>'+safe(receipt.reference)+'</p><p>'+tr('Order summary: ','Resumen: ')+safe(receipt.quantity+' '+tr('items','productos'))+' · '+fmt(receipt.total)+'</p><p class="tle-order-lede">'+tr('This is the confirmation screen a customer could reach. Nothing was ordered, paid for, or sent.','Esta es la pantalla de confirmación a la que llegaría un cliente. No se realizó ningún pedido, cobro ni envío.')+'</p></div>';
  foot='<div class="tle-order-two"><button type="button" class="tle-order-secondary" data-action="reset">'+tr('Try again','Probar de nuevo')+'</button><button type="button" class="tle-order-primary" data-action="close">'+tr('Continue exploring','Seguir explorando')+'</button></div>';
 }
 if(step!=='confirmed')body='<div class="tle-order-steps">'+progress+' · '+tr('DEMONSTRATION','DEMOSTRACIÓN')+'</div>'+body;
 dialog.innerHTML=h+'<div class="tle-order-body">'+body+'</div><div class="tle-order-footer">'+foot+'</div>';
 if(step==='details')syncDelivery();
}
function syncDelivery(){
 var form=dialog.querySelector('#tle-order-details');if(!form)return;
 var isDelivery=form.elements.fulfillment.value==='delivery',label=form.querySelector('[data-address-label]');
 if(label){label.hidden=!isDelivery;form.elements.address.required=isDelivery;}
}
function open(next){
 lastFocus=document.activeElement;step=next||(dineInAvailable&&!serviceMode?'service':'menu');render();
 if(!dialog.open)dialog.showModal();
 var btn=dialog.querySelector('.tle-order-head button');if(btn)btn.focus();
}
function startWithItems(items){if(dineInAvailable&&!serviceMode)serviceMode='takeout';
 if(Array.isArray(items)){cart.clear();var variants=[];items.forEach(function(x){var item=find(x.name||x.id),qty=Math.max(0,Math.min(24,Number(x.qty)||0));if(item&&qty){var i=catalog.indexOf(item);cart.set(i,Math.min(24,(cart.get(i)||0)+qty));if(x.size)variants.push(item.name+' · '+String(x.size))}});if(variants.length)details={notes:variants.join('; ').slice(0,250)}}
 paintFloat();open(count()?'cart':'menu');
}
window.TLE_ORDER={open:open,add:function(name,qty){return change(name,Math.max(1,Number(qty)||1))},startWithItems:startWithItems,items:catalog.map(function(x){return {name:x.name,priceCents:x.priceCents}})};
float.addEventListener('click',function(){open(count()?'cart':(dineInAvailable?'service':'menu'))});
dialog.addEventListener('close',function(){details=null;if(lastFocus&&typeof lastFocus.focus==='function')lastFocus.focus()});
dialog.addEventListener('click',function(event){if(event.target===dialog)close()});
dialog.addEventListener('change',function(event){if(event.target.name==='fulfillment')syncDelivery()});
dialog.addEventListener('click',function(event){
 var b=event.target.closest('button[data-action]');if(!b)return;
 var action=b.dataset.action,name=b.dataset.name;
 if(action==='close'){close();return}
 if(action==='dinein'||action==='takeout'){serviceMode=action;details=null;step='menu';render();return}
 if(action==='service'){step='service';render();return}
 if(action==='add'||action==='increase'||action==='remove'){change(name,action==='remove'?-1:1);render();return}
 if(action==='confirm'){
  receipt={reference:'DEMO-'+Math.floor(100000+Math.random()*900000),quantity:count(),total:subtotal()};cart.clear();details=null;step='confirmed';paintFloat();render();return;
 }
 if(action==='reset'){receipt=null;cart.clear();details=null;serviceMode='';step=dineInAvailable?'service':'menu';paintFloat();render();return}
 if(action==='review'){
  var form=dialog.querySelector('#tle-order-details');if(!form||!form.reportValidity())return;
  details=Object.fromEntries(new FormData(form).entries());step='review';render();return;
 }
 if(action==='menu'||action==='cart'||action==='details'){if(action==='details'&&!count())return;step=action;render()}
});
function decorate(){
 document.querySelectorAll('.tle-demo-price-collection .tle-price-card').forEach(function(card){
  if(card.querySelector('[data-tle-order-add]'))return;
  var title=card.querySelector('h3');if(!title||!find(title.textContent))return;
  var b=document.createElement('button');b.type='button';b.dataset.tleOrderAdd=title.textContent;b.textContent=tr('Add to cart +','Añadir al carrito +');b.style.setProperty('--toc-accent',tone);
  b.addEventListener('click',function(){change(title.textContent,1);open('cart')});var body=card.querySelector('.tle-price-card-body');if(body)body.appendChild(b);
 });
 // Add a non-intrusive purchase action beside individual priced dishes, not inside a nested button.
 if(slug==='wok-social'||slug==='havana-19'){
  document.querySelectorAll(slug==='wok-social'?'.menu-grid .dish':'.dish-grid article').forEach(function(card){
   if(card.querySelector('.tle-order-inline-add'))return;
   var title=card.querySelector('h3'),item=title&&find(title.textContent);if(!item)return;
   var b=document.createElement('button');b.type='button';b.className='tle-order-inline-add';b.textContent=tr('Add · ','Añadir · ')+fmt(item.priceCents);b.style.setProperty('--toc-accent',tone);
   b.addEventListener('click',function(){change(item.name,1);open('cart')});card.appendChild(b);
  });
 }
}
function augmentNative(){
 if(slug==='yummm'){
  var preview=document.getElementById('previewDialog'),back=document.getElementById('backToMenu');
  if(preview&&back&&!preview.querySelector('.tle-order-inline-add')){
   var b=document.createElement('button');b.type='button';b.className='tle-order-inline-add';b.textContent='Proceed to demo checkout';b.style.setProperty('--toc-accent',tone);
   b.addEventListener('click',function(){
    var items=[];try{items=JSON.parse(sessionStorage.getItem('yummm-demo-box')||'[]')}catch(_){}
    if(preview.open)preview.close();startWithItems(items);
   });back.before(b);
  }
 }
 if(slug==='crumb'){
  var previewButton=document.getElementById('preview-button');
  if(previewButton&&!previewButton.dataset.tleCheckoutBridge){previewButton.dataset.tleCheckoutBridge='1';previewButton.addEventListener('click',function(){
   setTimeout(function(){var panel=document.getElementById('preview');if(!panel||panel.hidden||panel.querySelector('.tle-order-inline-add'))return;
    var b=document.createElement('button');b.type='button';b.className='tle-order-inline-add';b.textContent='Continue to demo checkout';b.style.setProperty('--toc-accent',tone);
    b.addEventListener('click',function(){var items=catalog.map(function(x){var key=normalize(x.name);var map={'classicchocolatechip':'classic','doublechocolate':'double','saltedcaramel':'caramel','whitechocolateraspberry':'raspberry','nuttydream':'nutty','browniechip':'brownie'};return {name:x.name,qty:Number(document.getElementById('qty-'+map[key])?.textContent||0)}}).filter(function(x){return x.qty>0});document.getElementById('box-dialog')?.close();startWithItems(items)});
    panel.appendChild(b);
   },0);
  })}
 }
 if(slug==='casa-brownie'){
  var modal=document.getElementById('modal-body');
  if(modal){var decorateCart=function(){if(!modal.querySelector('.cart-lines')||modal.querySelector('[data-tle-cart-bridge]'))return;
   var b=document.createElement('button');b.type='button';b.className='tle-order-inline-add';b.dataset.tleCartBridge='1';b.textContent='Continuar al checkout DEMO';b.style.setProperty('--toc-accent',tone);
   b.addEventListener('click',function(){var items=Array.from(modal.querySelectorAll('.cart-line')).map(function(line){return {name:line.querySelector('strong')?.textContent||'',qty:Number(line.querySelector('output')?.textContent||0)}});document.getElementById('modal-close')?.click();startWithItems(items)});
   modal.appendChild(b);
  };new MutationObserver(decorateCart).observe(modal,{childList:true,subtree:true});decorateCart()}
 }
 if(slug==='jaramillo-boutique'){
  var bag=document.getElementById('bagDialog'),foot=bag&&bag.querySelector('.bag-dialog-foot');
  if(bag&&foot&&!bag.querySelector('[data-tle-boutique-checkout]')){
   var b=document.createElement('button');b.type='button';b.className='tle-order-inline-add';b.dataset.tleBoutiqueCheckout='1';b.textContent=tr('Continue to demo checkout','Continuar al checkout DEMO');b.style.setProperty('--toc-accent',tone);
   b.addEventListener('click',function(){var entries=Array.from(bag.querySelectorAll('.bag-item')).map(function(row){var name=row.querySelector('.bag-item-info strong')?.textContent||'',qty=Number(row.querySelector('.bag-item-quantity')?.textContent||0),size=Array.from(row.querySelectorAll('.bag-item-info small')).filter(function(el){return !el.classList.contains('bag-line-price')}).map(function(el){return el.textContent}).join(' · ');return {name:name,qty:qty,size:size}}).filter(function(x){return x.qty>0});bag.close();startWithItems(entries)});
   foot.insertBefore(b,document.getElementById('bagContinue'));
  }
 }
 if(slug==='golden-grid'){
  var pd=document.getElementById('product-dialog'),title=document.getElementById('product-name');
  if(pd&&title){var attach=function(){var item=find(title.textContent);var b=pd.querySelector('[data-tle-product-bridge]');
   if(!item){if(b)b.hidden=true;return}if(!b){b=document.createElement('button');b.type='button';b.className='tle-order-inline-add';b.dataset.tleProductBridge='1';b.style.setProperty('--toc-accent',tone);pd.querySelector('.dialog-copy')?.appendChild(b);
    b.addEventListener('click',function(){var i=find(title.textContent);if(i){change(i.name,1);pd.close();open('cart')}})}
   b.hidden=false;b.textContent=tr('Add to cart · ','Añadir al carrito · ')+fmt(item.priceCents);
  };new MutationObserver(attach).observe(title,{childList:true,subtree:true});attach()}
 }
}
if(['yummm','crumb','casa-brownie','jaramillo-boutique'].includes(slug))float.hidden=true;
paintFloat();decorate();augmentNative();
var watcher=new MutationObserver(function(){decorate();if(slug==='golden-grid')augmentNative()});
watcher.observe(document.body,{childList:true,subtree:true});
setTimeout(function(){watcher.disconnect()},9000);
})();