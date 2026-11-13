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
assert.equal(photos.length,9,'Exactly nine menu items should have unique photographs');
assert.equal(new Set(photos).size,photos.length,'No photos may be repeated');
for(const id of ["knockout","tko","heavy-weight","pound","round-knish"])assert(items.find(i=>i.id===id)?.image?.includes('knockout-menu-'),'Missing cropped menu photograph: '+id);
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
assert(js.includes('data-configure-item=') && js.includes('showProduct(customize.dataset.configureItem)'),'Menu plus must open Step 2 customization');
assert(!js.includes('class="card-add" data-add-item=') && !js.includes('class="card-detail" data-detail-item='),'No add-direct or View Details actions may remain in menu cards');
assert(js.includes('km-order-progress') && js.includes('02 · TOPPINGS') && js.includes('03 · BAG'),'Step 2 progress missing');
assert(js.includes('ADD & VIEW BAG') && js.includes('AÑADIR Y VER CARRITO'),'Step 2 confirm must be bilingual');
assert(js.includes('km-no-modifiers'),'Unsupported products should not get invented toppings');
assert(pickup.includes("else window.setTimeout(()=>{if(!$('#product-dialog')?.open)openBag();},1250)"),'Cart must open after selected toppings and existing animation');
assert(pickup.includes("checkoutKicker:'03 / YOUR BAG'") && pickup.includes("checkoutKicker:'03 / TU CARRITO'"),'Step 3 bag labels must be bilingual');
assert(css.includes('KNOCKOUT CUSTOMIZATION STEPS'),'Responsive stepper CSS missing');
const driveHero=path.join(root,'assets','knockout-menu-hero-drive-07.png');
assert(fs.existsSync(driveHero)&&fs.statSync(driveHero).size>100000,'Drive-sourced hero photo must be bundled locally');
assert(css.includes('KNOCKOUT DRIVE HERO')&&css.includes("url('./assets/knockout-menu-hero-drive-07.png')"),'Menu hero must use new Drive photo, not original site hero');
assert(!css.includes("background:#301919 url('./assets/knockout-menu-hero-event.webp')"),'Original hero photo cannot be used again');
assert(html.includes('menu-redesign.css?v=20261113-foodfirst-v2'),'Menu must bust cached old hero CSS');
assert(html.includes('class="km-banner-image"')&&html.includes('class="km-banner-photo"'),'Mobile hero must have separate full image');
assert(html.includes('class="km-brand-back"') && html.includes('class="km-brand-back-label"'),'Header must integrate back navigation');
assert(html.includes('SOUTH FLORIDA · FOOD TRUCK'),'Hero must use editorial food-truck overline');
assert(html.includes('menu-redesign.css?v=20261113-foodfirst-v2'),'New hero styles must bust cached CSS');
assert(css.includes('KNOCKOUT FOOD-FIRST HERO V2') && css.includes('.menu-route-bar{display:none!important}'),'Redundant back strip must disappear');
assert(css.includes('.menu-section .menu-head{') && css.includes('clip-path:inset(50%)'),'Redundant OUR MENU heading must be visually hidden, not removed');
assert(search.includes("back.textContent=es?'VOLVER':'BACK'"),'Back link text must translate to Spanish');

assert(css.includes('KNOCKOUT MOBILE HERO FULL PHOTO')&&css.includes('object-fit:contain!important;')&&css.includes('aspect-ratio:3 / 2!important;'),'Uncropped 3:2 mobile image styles missing');


assert(html.includes('id="km-pickup-action"')&&html.includes('km-order-choice-delivery'),'Separate pickup and DoorDash controls missing');
assert(html.includes('km-choice-doordash-symbol') && html.includes('km-choice-pickup-symbol'),'Branded delivery and pickup symbols missing');
assert(html.includes('M23.071 8.409') && html.includes('km-choice-doordash-symbol'),'DoorDash brand mark missing');
assert(!html.includes('ORDER ON DOORDASH ↗') && !pickup.includes("orderDoorDash:'ORDER ON DOORDASH ↗'"),'Old external arrow must not return to DoorDash button');
assert(pickup.includes("orderDoorDash:'ORDER ON DOORDASH'") && pickup.includes("orderDoorDash:'PEDIR POR DOORDASH'"),'Bilingual DoorDash label must remain arrow-free');
assert(css.includes('KNOCKOUT VISUAL PICKUP AND DOORDASH BUTTONS') && css.includes('.menu-tools .menu-search-field input'),'One-border search refinement missing');
assert(css.includes('KNOCKOUT HIGH-CONTRAST CTAS') && css.includes('.km-order-choice .km-choice-text{') && css.includes('color:#fff!important;') && css.includes('-webkit-text-fill-color:#fff!important;') && css.includes('.km-order-choice .km-choice-symbol{'),'CTA labels and symbols must remain legible on red and black buttons');

assert(html.includes('data-direct-copy="squareRequirement"'),'Square payment guidance missing');
assert(!/\bStripe\b/i.test(html+pickup),'Legacy Stripe visible to customer');
assert(pickup.includes("payTruck:'SQUARE PAYMENT BEFORE ORDER'")&&pickup.includes("payTruck:'PAGO CON SQUARE ANTES DEL PEDIDO'"),'Bilingual Square pre-order heading missing');
assert(pickup.includes('before the pickup order is sent')&&pickup.includes('antes de enviar el pedido'),'Square must precede order transmission');
assert(search.includes("getElementById('km-pickup-action')")&&search.includes('grid.scrollIntoView('),'Pickup button must browse the menu');
assert(css.includes('.km-order-choice-delivery')&&css.includes('.km-order-choice-pickup'),'Two button styles missing');
const compactMarkers=['KNOCKOUT MENU-FIRST COMPACT LAYOUT','.menu-head .head-aside,','.digital-menu-intro,','.menu-order-hint{display:none!important}','.order-routing-note{','@media(max-width:900px)','@media(max-width:600px)'];
for(const marker of compactMarkers)assert(css.includes(marker),'Compact menu layout missing '+marker);
assert(html.includes('class="km-banner"') && html.includes('id="menu-search"') && html.includes('id="menu-filters"') && html.includes('id="menu-grid"'), 'Functional menu DOM must be kept');
const pickupText=read('window-order.js');
assert(pickupText.includes('PICKUP AT THE TRUCK') && pickupText.includes('RECOGIDA EN EL TRUCK'), 'Short bilingual pickup labels missing');
assert(pickupText.includes('no pickup order is sent') && pickupText.includes('no se envían pedidos'), 'Demo no-send warning must remain');

for(const file of ['app.js','menu-redesign.js','window-order.js']){const r=spawnSync(process.execPath,['--check',path.join(root,file)],{encoding:'utf8'});assert.equal(r.status,0,file+' syntax error: '+r.stderr)}
console.log('PASS: Knockout Deli curated '+items.length+'-item menu; 9 unique photos, category search, EN/ES, cart-safe layout');
