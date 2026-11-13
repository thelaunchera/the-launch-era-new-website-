import fs from 'node:fs';
import path from 'node:path';

function customizationMarkup(item, lang){
  const eligible=new Set(['ribeye','body','egg-mcdeli','jab','knockout','tko','upper-cut','head-butt','combination','champ','ali-shuffle','heavy-weight','pound','underdog','chopped-cheese']);
  if(item.price==null||!item.available)return '';
  const es=lang==='es';
  // Drinks and ready-made sides still get a clear second step, without inventing toppings.
  if(!eligible.has(item.id))return `<section class="km-customizer" aria-label="${es?'Personalizar':'Customize'}"><p class="km-no-modifiers">${es?'Este producto no tiene toppings ni acompañamientos para elegir. Puedes continuar al carrito.':'This item has no available toppings or sides. Continue to the bag.'}</p></section>`;
  const choices=[
    ['no-onions',es?'Sin cebolla':'No onions'],
    ['no-pickles',es?'Sin pepinillos':'No pickles'],
    ['sauce-side',es?'Salsa aparte':'Sauce on the side']
  ];
  const sides=[
    ['',es?'Sin acompañamiento extra':'No extra side'],
    ['fries',es?'Papas fritas':'Hand-cut fries'],
    ['chips',es?'Papas chips':'Potato chips'],
    ['salad',es?'Ensalada deli':'Deli salad']
  ];
  const toppingHtml=choices.map(([value,label])=>`<label class="km-option"><input type="checkbox" name="km-topping" value="${value}"><span>${label}</span></label>`).join('');
  const sideHtml=sides.map(([value,label],i)=>`<label class="km-option"><input type="radio" name="km-side" value="${value}" ${i===0?'checked':''}><span>${label}</span></label>`).join('');
  return `<section class="km-customizer" aria-label="${es?'Personalizar':'Customize'}"><fieldset class="km-option-group"><legend>${es?'Cambios · opcional':'Toppings · optional'}</legend><div class="km-option-grid">${toppingHtml}</div></fieldset><fieldset class="km-option-group"><legend>${es?'Acompañamiento · opcional':'Side request · optional'}</legend><div class="km-option-grid km-side-grid">${sideHtml}</div></fieldset><p class="km-options-note">${es?'Solo solicitudes de ejemplo. Disponibilidad y cargos adicionales sujetos a confirmación del negocio.':'Preview requests only. Availability and any extra charges must be confirmed by the truck.'}</p></section>`;
}

function patchKnockoutPickup(app,windowOrder){
  const once=(input,needle,replacement,label)=>{
    if(!input.includes(needle)||input.indexOf(needle)!==input.lastIndexOf(needle))throw Error(`Knockout ${label} patch anchor missing or duplicated`);
    return input.replace(needle,()=>replacement);
  };
  const func=customizationMarkup.toString();
  // Step 1 -> 2: the menu + becomes a customization action, never a cart write.
  app=once(app,'class="card-add" data-add-item=', 'class="card-add" data-configure-item=', 'menu plus must not add to cart');
  app=once(app,'aria-label="Add ${esc(item.name)} to window list"', 'aria-label="${lang===\'es\'?\'Personalizar\':\'Customize\'} ${esc(item.name)}"', 'accessible customizable item label');
  app=once(app,'+ <span class="add-label">ADD TO LIST</span>', '+ <span class="add-label">${lang===\'es\'?\'PERSONALIZAR\':\'CUSTOMIZE\'}</span>', 'menu plus call-to-action');
  app=once(app,'<button type="button" class="card-detail" data-detail-item="${esc(item.id)}">${phrase(\'more\')}</button>', '', 'remove redundant View Details action');
  app=once(app,"if(e.target.closest('[data-add-item]'))return;const card=e.target.closest('[data-menu-id]');",
    "const customize=e.target.closest('[data-configure-item]');if(customize){showProduct(customize.dataset.configureItem);return;}if(e.target.closest('[data-add-item]'))return;const card=e.target.closest('[data-menu-id]');",
    'menu plus must open customization');
  app=once(app,'<div class="dialog-text"><span class="section-kicker">',
    '<div class="dialog-text"><div class="km-order-progress" aria-label="${lang===\'es\'?\'Paso 2 de 3\':\'Step 2 of 3\'}"><span>${lang===\'es\'?\'01 · MENÚ\':\'01 · MENU\'}</span><strong>${lang==='es'?'02 · OPCIONES':'02 · TOPPINGS'}</strong><span>${lang===\'es\'?\'03 · CARRITO\':\'03 · BAG\'}</span></div><span class="section-kicker">',
    'step 2 progress header');
  app=once(app,'+ ADD TO PICKUP LIST','${lang===\'es\'?\'AÑADIR AL CARRITO\':\'ADD TO BAG\'}','confirm customization button');
  app=once(app,'<a class="modal-doordash-link" target="_blank" rel="noopener noreferrer" href="${DOORDASH_URL}">${phrase(\'orderButton\')}</a>','','modal should focus on pickup customization');

  app=once(app,'  function showProduct(id){',`  ${func}\n  function showProduct(id){`,'product customization function');
  app=once(app,'if(!item)return;const photo=',"if(!item)return;const optionMarkup=customizationMarkup(item,lang);const photo=",'product options call');
  app=once(app,'<p>${esc(item.description)}</p>${item.price!==null', '<p>${esc(item.description)}</p>${optionMarkup}${item.price!==null','product modal insertion');
  const variant=`
    const modal=btn.closest('#product-dialog');
    const checked=modal ? $$('input[name="km-topping"]:checked',modal).map(input=>input.closest('label')?.textContent?.trim()||input.value) : [];
    const side=modal?.querySelector('input[name="km-side"]:checked');
    const sideText=side?.value ? side.closest('label')?.textContent?.trim()||side.value : '';
    const options=[...checked,...(sideText?[(lang()==='es'?'Acompañamiento: ':'Side: ')+sideText]:[])].slice(0,4);
    const cartId=options.length?id+'::'+options.join('|'):id;
    const current=items.get(cartId);`;
  windowOrder=once(windowOrder,'    const current=items.get(id);',variant,'cart variant identity');
  windowOrder=once(windowOrder,'else items.set(id,{id,name,price,quantity:1});','else items.set(cartId,{id:cartId,name,price,quantity:1,options});','cart variant storage');
  const bagAnchor="clean(t('priceNote'))}</span></div>";
  const bagSegment='${item.options?.length ? `<small class="km-cart-options">${clean(item.options.join(" · "))}</small>` : ""}';
  windowOrder=once(windowOrder,bagAnchor,`clean(t('priceNote'))}</span>${bagSegment}</div>`,'cart options summary');
  const previewAnchor='clean(x.name)}</b></span>';
  const previewSegment='${x.options?.length ? `<small class="km-preview-options">${clean(x.options.join(" · "))}</small>` : ""}';
  windowOrder=once(windowOrder,previewAnchor,`clean(x.name)}</b>${previewSegment}</span>`,'preview options summary');
  // Step 2 confirms the item, then returns to browsing the menu.
  // The 1.2-second flying animation and top-bar count still run, but the bag
  // is opened only when its top-bar icon is tapped by the customer.
  windowOrder=once(windowOrder,
    "    if($('#product-dialog')?.open)$('#product-dialog').close();\n    if(dialog.open){renderBag();setStage('bag');}",
    "    if($('#product-dialog')?.open){\n      $('#product-dialog').close();\n    }else if(dialog.open){renderBag();setStage('bag');}",
    'confirm customization without opening bag');
  let step3LabelCount=0;
  windowOrder=windowOrder.replace(/checkoutKicker:'[^']*'/g,()=>{
    const title=step3LabelCount++===0?'03 / YOUR BAG':'03 / TU CARRITO';
    return "checkoutKicker:'"+title+"'";
  });
  if(step3LabelCount!==2)throw Error('Missing bilingual bag step 3 labels');
  // Single pickup flow: no alternative 'I'm at the window' path.
  windowOrder=once(windowOrder,"mode=value==='at-truck'?'at-truck':'ahead';","mode='ahead';",'single pickup mode');
  windowOrder=once(windowOrder,"if(qrMode){setMode('at-truck');","if(qrMode){setMode('ahead');",'legacy deep link pickup mode');
  const pickupHeaders=['PICKUP DETAILS','DATOS PARA RECOGER'];
  let pickupHeaderIndex=0;
  windowOrder=windowOrder.replace(/choosePickup:'[^']*'/g,match=>match+",pickupDetails:'"+pickupHeaders[pickupHeaderIndex++]+"'");
  if(pickupHeaderIndex!==2)throw Error('Pickup detail titles missing in translations');
  windowOrder=windowOrder.replace("en:{orderRoutes:","en:{pickupFormHelp:'Square payment will be required before a pickup order is sent. This demo does not process payments.',orderRoutes:");
  windowOrder=windowOrder.replace("es:{orderRoutes:","es:{pickupFormHelp:'Se requerirá el pago con Square antes de enviar el pedido para recoger. Este demo no procesa pagos.',orderRoutes:");
  const routingTitles=['PICKUP AT THE TRUCK','RECOGIDA EN EL TRUCK'];
  const routingHelp=[
    'Build your bag here. Demo only — no pickup order is sent.',
    'Prepara tu bolsa aquí. Solo demo: no se envían pedidos.'
  ];
  let routeTitleIndex=0,routeHelpIndex=0;
  windowOrder=windowOrder.replace(/orderRoutes:'[^']*'/g,()=> "orderRoutes:'"+routingTitles[routeTitleIndex++]+"'");
  windowOrder=windowOrder.replace(/orderRoutesHelp:'[^']*'/g,()=> "orderRoutesHelp:'"+routingHelp[routeHelpIndex++]+"'");
  if(routeTitleIndex!==2||routeHelpIndex!==2)throw Error('Pickup/delivery descriptions missing translations');
  // Keep brand mark on the DoorDash link while translating its nested label.
  const doordashText=[
    ["orderDoorDash:'ORDER ON DOORDASH ↗'","orderDoorDash:'ORDER ON DOORDASH'"],
    ["orderDoorDash:'PEDIR POR DOORDASH ↗'","orderDoorDash:'PEDIR POR DOORDASH'"]
  ];
  for(const [before,after] of doordashText){
    if(!windowOrder.includes(before))throw Error('DoorDash localized label unavailable');
    windowOrder=windowOrder.replace(before,after);
  }
  const squareTitles=['SQUARE PAYMENT BEFORE ORDER','PAGO CON SQUARE ANTES DEL PEDIDO'];
  const squareDescriptions=[
    'Secure Square payment will be required before the pickup order is sent. Demo only — no charge or order is processed.',
    'Se requerirá el pago seguro con Square antes de enviar el pedido. Solo demo: no se cobra ni se envía ninguna orden.'
  ];
  let squareCopyIndex=0;
  windowOrder=windowOrder.replace(/payTruck:'[^']*',noStripe:'[^']*'/g,()=>{
    const i=squareCopyIndex++;
    return "payTruck:'"+squareTitles[i]+"',squareRequirement:'"+squareDescriptions[i]+"'";
  });
  if(squareCopyIndex!==2 || /noStripe:|\bStripe\b/.test(windowOrder))throw Error('Square payment labels not applied in both languages');

  // The catalog now includes authoritative Spanish product fields. Render the
  // localized display text in both cards and the modal, without changing item
  // IDs, pricing, selected options, URLs or the underlying English source.
  for(const [token,translation,label] of [
    ['esc(item.name)',"esc(lang==='es'&&item.nameEs?item.nameEs:item.name)",'product names'],
    ['esc(item.description)',"esc(lang==='es'&&item.descriptionEs?item.descriptionEs:item.description)",'product descriptions'],
    ['esc(item.category)',"esc(lang==='es'&&item.categoryEs?item.categoryEs:item.category)",'product categories']
  ]){
    if(!app.includes(token))throw Error('Knockout locale: missing app template '+label);
    app=app.replaceAll(token,translation);
  }
  if(!app.includes('item.descriptionEs')||!app.includes('item.nameEs')||!app.includes('item.categoryEs'))
    throw Error('Knockout Spanish menu fields were not integrated');

  if(!app.includes('km-customizer')||!windowOrder.includes('const cartId='))throw Error('Knockout customization patch incomplete');
  return {app,windowOrder};
}

export function upgradeKnockoutPickup(destination){
  const appPath=path.join(destination,'app.js');
  const windowPath=path.join(destination,'window-order.js');
  const updated=patchKnockoutPickup(fs.readFileSync(appPath,'utf8'),fs.readFileSync(windowPath,'utf8'));
  fs.writeFileSync(appPath,updated.app);
  fs.writeFileSync(windowPath,updated.windowOrder);
  const menuPath=path.join(destination,'menu.html');
  let menu=fs.readFileSync(menuPath,'utf8');
  const replaceMenu=(pattern,replacement,label)=>{
    if(!pattern.test(menu))throw Error('Knockout menu missing '+label);
    menu=menu.replace(pattern,replacement);
  };
  replaceMenu(/<div class="pickup-option-switch"[^>]*>[\s\S]*?<\/div>/,
    '',"redundant pickup method switch");
  replaceMenu(/<div class="checkout-pickup-cards"[^>]*>[\s\S]*?<\/div>/,
    '<input type="hidden" name="method" value="ahead" />',"redundant pickup radio choices");
  // Separate actual controls: pickup browses the food; delivery leaves for official DoorDash.
  replaceMenu(/<div class="order-routing-note" role="note">[\s\S]*?<\/div>/,
    '<div class="order-routing-note km-order-choices" role="group" aria-label="Pickup or delivery"><button type="button" id="km-pickup-action" class="km-order-choice km-order-choice-pickup"><span class="km-choice-symbol km-choice-pickup-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h16l-1.2 11H5.2L4 9Z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/></svg></span><span class="km-choice-text" data-direct-copy="orderRoutes">PICKUP AT THE TRUCK</span></button><a class="km-order-choice km-order-choice-delivery" href="https://www.doordash.com/store/42538456" target="_blank" rel="noopener noreferrer" aria-label="Order delivery on DoorDash"><span class="km-choice-symbol km-choice-doordash-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M23.071 8.409a6.09 6.09 0 00-5.396-3.228H.584A.589.589 0 00.17 6.184L3.894 9.93a1.752 1.752 0 001.242.516h12.049a1.554 1.554 0 11.031 3.108H8.91a.589.589 0 00-.415 1.003l3.725 3.747a1.75 1.75 0 001.242.516h3.757c4.887 0 8.584-5.225 5.852-10.413"/></svg></span><span class="km-choice-text" data-direct-copy="orderDoorDash">ORDER ON DOORDASH</span></a><small class="km-order-preview-note" data-direct-copy="orderRoutesHelp">Build your bag here. Demo only — no pickup order is sent.</small></div>',
    'separate pickup / DoorDash controls');
  replaceMenu(/<h3 data-order-i18n="choosePickup">[^<]*<\/h3>/,
    '<h3 data-order-i18n="pickupDetails">PICKUP DETAILS</h3><p class="km-pickup-instruction" data-direct-copy="pickupFormHelp">Square payment will be required before a pickup order is sent. This demo does not process payments.</p>',
    "checkout pickup heading");
  replaceMenu(/<strong data-direct-copy="payTruck">[^<]*<\/strong>/,
    '<strong data-direct-copy="payTruck">SQUARE PAYMENT BEFORE ORDER</strong>', 'Square payment heading');
  replaceMenu(/<small data-direct-copy="noStripe">[^<]*<\/small>/,
    '<small data-direct-copy="squareRequirement">Secure Square payment will be required before the pickup order is sent. Demo only — no charge or order is processed.</small>', 'Square payment note');
  replaceMenu(/(<div class="direct-pay-truck" role="note"><span aria-hidden="true">)✓(<\/span>)/,
    '$1●$2', 'neutral payment-step icon');
  if(/\bStripe\b|data-direct-copy="noStripe"/.test(menu))throw Error('Legacy Stripe copy remains in demo HTML');
  if(menu.includes('class="checkout-pickup-cards"')||menu.includes('class="pickup-option-switch"'))
    throw Error('Redundant pickup choices remain visible');
  // Apply receipt-specific styling after every legacy/menu stylesheet.
  // The original ZIP has no detailed styling for review facts or action buttons.
  const reviewCss='pickup-review.css';
  const reviewCssSource=path.resolve('demo-source/knockout-deli/landing',reviewCss);
  if(!fs.existsSync(reviewCssSource))throw Error('Knockout receipt styles missing');
  fs.copyFileSync(reviewCssSource,path.join(destination,reviewCss));
  if(!menu.includes('pickup-review.css')) {
    if(!menu.includes('menu-redesign.css'))throw Error('Knockout menu stylesheet missing before receipt layout');
    menu=menu.replace('</head>','  <link rel="stylesheet" href="./pickup-review.css?v=20261113-receipt-contrast-v1" />\n</head>');
  }
  fs.writeFileSync(menuPath,menu);
  console.log('Knockout Deli: one pickup detail step, separate DoorDash checkout, and customized items');
}
