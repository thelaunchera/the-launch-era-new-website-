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
  if(!app.includes('km-customizer')||!windowOrder.includes('const cartId='))throw Error('Knockout customization patch incomplete');
  return {app,windowOrder};
}

export function upgradeKnockoutPickup(destination){
  const appPath=path.join(destination,'app.js');
  const windowPath=path.join(destination,'window-order.js');
  const updated=patchKnockoutPickup(fs.readFileSync(appPath,'utf8'),fs.readFileSync(windowPath,'utf8'));
  fs.writeFileSync(appPath,updated.app);
  fs.writeFileSync(windowPath,updated.windowOrder);
  console.log('Knockout Deli: optional topping/side preview choices retained per bag item');
}
