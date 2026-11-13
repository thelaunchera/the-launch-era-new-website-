import fs from 'node:fs';
import path from 'node:path';

function customizationMarkup(item, lang){
  const eligible=new Set(['ribeye','body','egg-mcdeli','jab','knockout','tko','upper-cut','head-butt','combination','champ','ali-shuffle','heavy-weight','pound','underdog','chopped-cheese']);
  if(!eligible.has(item.id)||item.price==null||!item.available)return '';
  const es=lang==='es';
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
  return `<section class="km-customizer" aria-label="${es?'Personalizar':'Customize'}"><fieldset class="km-option-group"><legend>${es?'Toppings · opcional':'Toppings · optional'}</legend><div class="km-option-grid">${toppingHtml}</div></fieldset><fieldset class="km-option-group"><legend>${es?'Acompañamiento · opcional':'Side request · optional'}</legend><div class="km-option-grid km-side-grid">${sideHtml}</div></fieldset><p class="km-options-note">${es?'Solo solicitudes de ejemplo. Disponibilidad y cargos adicionales sujetos a confirmación del negocio.':'Preview requests only. Availability and any extra charges must be confirmed by the truck.'}</p></section>`;
}

function patchKnockoutPickup(app,windowOrder){
  const once=(input,needle,replacement,label)=>{
    if(!input.includes(needle)||input.indexOf(needle)!==input.lastIndexOf(needle))throw Error(`Knockout ${label} patch anchor missing or duplicated`);
    return input.replace(needle,()=>replacement);
  };
  const func=customizationMarkup.toString();
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
  // Single pickup flow: no alternative 'I'm at the window' path.
  windowOrder=once(windowOrder,"mode=value==='at-truck'?'at-truck':'ahead';","mode='ahead';",'single pickup mode');
  windowOrder=once(windowOrder,"if(qrMode){setMode('at-truck');","if(qrMode){setMode('ahead');",'legacy deep link pickup mode');
  const pickupHeaders=['PICKUP DETAILS','DATOS PARA RECOGER'];
  let pickupHeaderIndex=0;
  windowOrder=windowOrder.replace(/choosePickup:'[^']*'/g,match=>match+",pickupDetails:'"+pickupHeaders[pickupHeaderIndex++]+"'");
  if(pickupHeaderIndex!==2)throw Error('Pickup detail titles missing in translations');
  windowOrder=windowOrder.replace("en:{orderRoutes:","en:{pickupFormHelp:'Review pickup details and pay at the truck. No online payment.',orderRoutes:");
  windowOrder=windowOrder.replace("es:{orderRoutes:","es:{pickupFormHelp:'Revisa los datos y paga en el truck. Sin pago online.',orderRoutes:");
  const routingTitles=['PICKUP OR DELIVERY','RECOGIDA O DELIVERY'];
  const routingHelp=[
    'For pickup, build your bag and review the details here. For delivery, order directly on DoorDash. This demo does not send pickup requests.',
    'Para recoger, prepara tu carrito y revisa los datos aquí. Para delivery, pide directamente en DoorDash. Esta demo no envía solicitudes.'
  ];
  let routeTitleIndex=0,routeHelpIndex=0;
  windowOrder=windowOrder.replace(/orderRoutes:'[^']*'/g,()=> "orderRoutes:'"+routingTitles[routeTitleIndex++]+"'");
  windowOrder=windowOrder.replace(/orderRoutesHelp:'[^']*'/g,()=> "orderRoutesHelp:'"+routingHelp[routeHelpIndex++]+"'");
  if(routeTitleIndex!==2||routeHelpIndex!==2)throw Error('Pickup/delivery descriptions missing translations');
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
  replaceMenu(/<h3 data-order-i18n="choosePickup">[^<]*<\/h3>/,
    '<h3 data-order-i18n="pickupDetails">PICKUP DETAILS</h3><p class="km-pickup-instruction" data-direct-copy="pickupFormHelp">Review pickup details and pay at the truck. No online payment.</p>',
    "checkout pickup heading");
  if(menu.includes('class="checkout-pickup-cards"')||menu.includes('class="pickup-option-switch"'))
    throw Error('Redundant pickup choices remain visible');
  fs.writeFileSync(menuPath,menu);
  console.log('Knockout Deli: one pickup detail step, separate DoorDash checkout, and customized items');
}
