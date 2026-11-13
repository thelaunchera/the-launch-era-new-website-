import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const root=path.resolve(process.argv[2]||'.output/public/demos/knockout-deli');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const html=read('menu.html'),css=read('menu-redesign.css'),js=read('app.js'),search=read('menu-redesign.js');
const m=js.match(/menu:\s*(\[[\s\S]*?\]),\s*events:\s*\[\]/);
assert(m,'Generated menu catalog must exist in app.js');
const items=JSON.parse(m[1]);
assert(items.length>=25 && items.length<=40,'Expected complete official screenshot menu');
assert.equal(new Set(items.map(i=>i.id)).size,items.length,'Duplicate product IDs');
const photos=items.filter(i=>i.image).map(i=>i.image);
assert.equal(photos.length,4,'Only four main items should have photographs');
assert.equal(new Set(photos).size,photos.length,'No photos may be repeated');
assert(items.every(i=>!(i.image||'').includes('instagram')&&!(i.image||'').includes('post')),'No Instagram assets in menu');
for(const item of items){
  assert(item.name && item.category && Object.hasOwn(item,'price'),'Incomplete item');
  if(item.image){const name=item.image.replace('./','');const img=path.join(root,name);assert(fs.existsSync(img),'Photo missing: '+name);assert(fs.statSync(img).size<400000,'Oversized menu photo: '+name)}
}
for(const category of ['Main Event','Breakfast','Ringside Favorites','Take Home','Beverages'])assert(items.some(i=>i.category===category),'Missing category '+category);
for(const element of ['km-banner','menu-redesign.css','menu-redesign.js','id="menu-grid"','id="menu-filters"','id="menu-search"','data-filter="Beverages"'])assert(html.includes(element),'Menu feature missing '+element);
assert(html.includes('BACK TO WEBSITE') && html.includes('NOT AN OFFICIAL BUSINESS WEBSITE'),'Menu must maintain navigation and concept disclosure');
assert(css.includes('grid-template-columns:repeat(2') && css.includes('max-width:760px') && css.includes('.menu-card:not(:has('),'Layout must support photo-less cards and mobile');
assert(search.includes("input.addEventListener('input'") && search.includes('MutationObserver'),'Search should work after category and language rerenders');

const pickup=read('window-order.js');
for(const anchor of ['function customizationMarkup','km-customizer','km-topping','km-side']){
  assert(js.includes(anchor),'Missing optional item customization: '+anchor);
}
for(const anchor of ['const cartId=','km-cart-options','km-preview-options','quantity:1,options']){
  assert(pickup.includes(anchor),'Pickup list must preserve selections: '+anchor);
}
for(const anchor of ['.km-pickup-instruction','#product-dialog .km-option-grid','@media(max-width:820px)']){
  assert(css.includes(anchor),'Missing tablet/desktop pickup layout: '+anchor);
}
assert(!html.includes('class="checkout-pickup-cards"') && !html.includes('class="pickup-option-switch"'), 'No redundant window pickup method cards');
assert(html.includes('data-order-i18n="pickupDetails"') && html.includes('type="hidden" name="method" value="ahead"'), 'Single direct pickup flow required');
assert(pickup.includes("mode='ahead'") && pickup.includes('pickupDetails:'), 'Bilingual direct pickup labels missing');
assert(!pickup.includes('fetch(')&&!pickup.includes('localStorage.'),'Demo must not send/store orders');

// The bag must be in the header, use the existing cart, and move more slowly than the old demos.
assert(search.includes("headerBag.id='knockout-header-cart'") && search.includes("windowBag.click()"), 'Top bar bag must open existing cart');
assert(search.includes('duration:1200') && search.includes('function flyToCart('), 'Slower flying-to-bag animation missing');
assert(search.includes("matchMedia('(prefers-reduced-motion: reduce)')") && search.includes('if(prefersLessMotion.matches'), 'Animation must respect reduced motion');
assert(search.includes("document.addEventListener('click'") && search.includes("},true);"), 'Fly-to-bag must launch on item addition');
assert(css.includes('.km-header-cart') && css.includes('.km-cart-flight') && css.includes('#window-sticky{display:none!important}'), 'Top cart styles or hidden old sticky bar missing');
assert(!search.includes('showModal('), 'Animation must not open bag automatically');
const compactMarkers=['KNOCKOUT MENU-FIRST COMPACT LAYOUT','.menu-head .head-aside,','.digital-menu-intro,','.menu-order-hint{display:none!important}','.order-routing-note{','@media(max-width:900px)','@media(max-width:600px)'];
for(const marker of compactMarkers)assert(css.includes(marker),'Compact menu layout missing '+marker);
assert(html.includes('class="km-banner"') && html.includes('id="menu-search"') && html.includes('id="menu-filters"') && html.includes('id="menu-grid"'), 'Functional menu DOM must be kept');
const pickupText=read('window-order.js');
assert(pickupText.includes('PICKUP AT THE TRUCK') && pickupText.includes('RECOGIDA EN EL TRUCK'), 'Short bilingual pickup labels missing');
assert(pickupText.includes('no pickup order is sent') && pickupText.includes('no se envían pedidos'), 'Demo no-send warning must remain');

for(const file of ['app.js','menu-redesign.js','window-order.js']){const r=spawnSync(process.execPath,['--check',path.join(root,file)],{encoding:'utf8'});assert.equal(r.status,0,file+' syntax error: '+r.stderr)}
console.log('PASS: Knockout Deli curated '+items.length+'-item menu; 4 unique photos, category search, EN/ES, cart-safe layout');
