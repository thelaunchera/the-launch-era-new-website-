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
// The bag must be in the header, use the existing cart, and move more slowly than the old demos.
assert(search.includes("headerBag.id='knockout-header-cart'") && search.includes("windowBag.click()"), 'Top bar bag must open existing cart');
assert(search.includes('duration:1200') && search.includes('function flyToCart('), 'Slower flying-to-bag animation missing');
assert(search.includes("matchMedia('(prefers-reduced-motion: reduce)')") && search.includes('if(prefersLessMotion.matches'), 'Animation must respect reduced motion');
assert(search.includes("document.addEventListener('click'") && search.includes("},true);"), 'Fly-to-bag must launch on item addition');
assert(css.includes('.km-header-cart') && css.includes('.km-cart-flight') && css.includes('#window-sticky{display:none!important}'), 'Top cart styles or hidden old sticky bar missing');
assert(!search.includes('showModal('), 'Animation must not open bag automatically');
for(const file of ['app.js','menu-redesign.js']){const r=spawnSync(process.execPath,['--check',path.join(root,file)],{encoding:'utf8'});assert.equal(r.status,0,file+' syntax error: '+r.stderr)}
console.log('PASS: Knockout Deli curated '+items.length+'-item menu; 4 unique photos, category search, EN/ES, cart-safe layout');
