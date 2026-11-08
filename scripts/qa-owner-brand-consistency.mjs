/** The Launch Era: protect industry-appropriate labels across all public demos. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const read=p=>readFileSync(p,'utf8');
const owner=read('public/demos/owner-center/index.html');
const library=read('public/demos/index.html');
const brandSource=read('public/assets/tle-owner-brand-context-20261108.js');
const requestsSource=read('public/assets/tle-owner-request-examples-20261108.js');
const env={window:{}};
new Script(brandSource,{filename:'brand-context'}).runInNewContext(env);
new Script(requestsSource,{filename:'request-examples'}).runInNewContext(env);
const brand=env.window.TLEOwnerBrandContext,examples=env.window.TLEOwnerRequestExamples;
const themes=[...owner.matchAll(/^ "([a-z0-9-]+)":\{name:"([^"]+)",kind:"(menu|service)"/gm)];
const slugs=themes.map(x=>x[1]);
assert.equal(slugs.length,13,'Keep existing 13 Owner Center brands');
assert.deepEqual(Object.keys(brand).sort(),slugs.sort(),'Every existing brand needs its own UI context');
assert.deepEqual(Object.keys(examples).sort(),slugs.sort(),'Every brand needs its own fictional activity');
assert.equal([...library.matchAll(/<article\b[^>]*data-brand="([^"]+)"[^>]*>[\s\S]*?<\/article>/g)].length,16,'Keep 16 branded portfolio demos');
assert.match(owner,/TLEOwnerBrandContext\?\.\[current\]/,'Owner Center must read selected brand context');
assert.match(owner,/TLEOwnerRequestExamples\?\.\[current\]/,'Requests must use current brand');
assert.match(owner,/id="catalog-view"/,'Keep editor functional');
assert.match(owner,/const currency=/,'Keep price editor and previews intact');
assert.match(owner,/localStorage\.setItem/,'Keep browser-only simulated changes');
assert.doesNotMatch(owner,/\bfetch\s*\(/,'Public demo must not call real backend');
assert.match(owner,/\/assets\/tle-owner-brand-context-20261108\.js/,'Load brand UI context in browser');
const keys=['eyebrow','heading','accent','intro','catalogNav','stats','addLabel','newCategory','phoneCaption','requestsHeading','itemNoun'];
for(const slug of slugs){
 for(const lang of ['en','es']){
  const ui=brand[slug]?.[lang];
  assert.ok(ui,'Missing brand/locale: '+slug+' '+lang);
  assert.deepEqual(Object.keys(ui).sort(),keys.sort(),'Missing or extra UI labels for '+slug+' '+lang);
  for(const k of keys)assert.ok(typeof ui[k]==='string'&&ui[k].trim().length>=2,slug+' '+lang+': '+k);
  const sample=examples[slug]?.[lang];
  assert.ok(sample?.cards?.length===3,'Need three sample cards: '+slug+' '+lang);
  const contents=[...Object.values(ui),...sample.cards.flat()].join(' ').toLowerCase();
  if(slug!=='experience-cleaning'){
   assert.doesNotMatch(contents,/residential|residencial|limpieza profunda|home cleaning|limpieza residencial|move-out/,
    'Other businesses must not inherit residential-cleaning copy: '+slug+' '+lang);
  }
  if(!['havana-19','wok-social'].includes(slug)){
   assert.doesNotMatch(ui.intro.toLowerCase(),/\bdishes\b|\bplatos\b/,
    'Product, editorial and service brands must not be described as restaurant dishes: '+slug+' '+lang);
  }
  if(slug==='lavender-edit'){
   assert.doesNotMatch([ui.eyebrow,ui.heading,ui.catalogNav,...sample.cards.flat()].join(' '),/appointments?|citas|reserva de cita/i,
    'Lavender editorial concept must not pretend to provide appointments');
  }
 }
}
assert.match(brand['ivory-and-bloom'].es.heading,/pasteles/);
assert.match(brand['ivory-and-bloom'].es.newCategory,/Pasteles de boda/);
assert.match(brand['crumb'].es.catalogNav,/Productos/);
assert.match(brand['casa-brownie'].es.intro,/brownies/);
assert.match(brand['lavender-edit'].es.eyebrow,/COLECCIÓN EDITORIAL/);
assert.match(brand['lavender-edit'].es.intro,/no una tienda ni un servicio de citas real/);
assert.match(brand['soluna-yoga'].es.newCategory,/Clases/);
assert.match(brand['experience-cleaning'].es.newCategory,/Residencial/);
assert.doesNotMatch(owner,/Gifting Appointment|Signature Experience/, 'Remove made-up Lavender appointment/booking products');
assert.match(owner,/Lavender Gifting Edit/);
assert.match(owner,/Daily Ritual/);
const originalLavender=read('public/demos/lavender-edit/index.html');
assert.match(originalLavender,/Not a real storefront/i,'Lavender original website is an editorial concept, not live shop');
console.log('PASS: 13 brand-specific bilingual catalog headings, edit defaults, requests and customer previews; Lavender editorial context; no cross-industry leaks.');
