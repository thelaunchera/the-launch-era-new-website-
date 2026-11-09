/**
 * Static bilingual demo contract: 13 reusable Owner Centers, 18 portfolio
 * cards, Spanish/English navigation and full-price local-only presentation.
 * No network, no real orders, no writes to customer records.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const file=p=>readFileSync(p,'utf8');
const owner=file('public/demos/owner-center/index.html');
const library=file('public/demos/index.html');
const locale=file('public/assets/tle-demo-locale-20261108.js');
const en=file('public/website-for-your-business/index.html');
const es=file('public/es/website-for-your-business/index.html');
new Script(locale,{filename:'tle-demo-locale-20261108.js'});
for(const [name,html] of [['owner',owner],['library',library],['website EN',en],['website ES',es]]){
 let ix=0;
 for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){
  new Script(match[1],{filename:name+' inline script '+(++ix)});
 }
}
assert.match(owner,/id="tle-owner-raspberry-20261108"/);
assert.match(owner,/--ui-pink:#C90B73/);
assert.match(owner,/--paper:#FEFDFE/);
assert.doesNotMatch(owner,/>✳<\/span>/,'Do not restore green emoji decoration');
assert.match(owner,/heading-accent/);
assert.match(owner,/src="\/assets\/tle-demo-locale-20261108\.js"/);
assert.match(owner,/TLELocale\?\.init\("owner"\)/);
assert.match(library,/TLELocale\?\.init\("library"\)/);
assert.match(library,/src="\/assets\/tle-demo-locale-20261108\.js"/);
assert.match(owner,/\?demo="\+encodeURIComponent\(current\)/);
assert.match(owner,/"&lang=es"/);
assert.match(locale,/lang=es enables Spanish/);
assert.match(locale,/query\.get\("lang"\)==="es"/);
assert.match(locale,/window\.TLELocale=/);
assert.match(locale,/MutationObserver/);
assert.match(locale,/Editar producto/);
assert.match(locale,/Volver a la vista del sitio web/);
assert.match(locale,/DEMOSTRACIÓN INTERACTIVA/);
assert.match(owner,/localStorage\.setItem/);
assert.match(owner,/localStorage\.removeItem/);
assert.match(owner,/Number\(p\.discount\)/);
assert.doesNotMatch(owner,/\bfetch\(/,'Public mock owner must not send real transactions');
const cards=[...library.matchAll(/<article\b[^>]*data-brand="([^"]+)"[^>]*>[\s\S]*?<\/article>/g)];
assert.equal(cards.length,18,'Existing demo cards plus Sneekiefs and FRESKA remain');
const linked=new Set(cards.filter(([html])=>html.includes('class="owner-view"')).map(([,slug])=>slug));
const themes=[...owner.matchAll(/^ "([a-z0-9-]+)":\{name:"[^"]+",kind:"(menu|service)"/gm)];
assert.equal(themes.length,13,'Exactly 13 Owner Center themes');
assert.equal(themes.filter(x=>x[2]==='menu').length,9);
assert.equal(themes.filter(x=>x[2]==='service').length,4);
assert.deepEqual([...linked].sort(),themes.map(x=>x[1]).sort());
for(const [kind,s] of [['English',en],['Spanish',es]]){
 assert.equal([...s.matchAll(/<section class="owner-experience"/g)].length,1,kind+' must contain one editorial showcase');
 assert.match(s,/owner-customer-frame/);
 assert.match(s,/owner-admin-product/);
 assert.match(s,/owner-admin-fields/);
 assert.match(s,/tle-raspberry-showcase/);
}
assert.match(en,/Beautiful for them/);
assert.match(es,/Bonito para ellos/);
assert.match(es,/lang=es&amp;returnTo=/);
assert.match(es,/VISTA DEL PROPIETARIO/);
const requestSource=file('public/assets/tle-owner-request-examples-20261108.js');
const requestCtx={window:{}};
new Script(requestSource,{filename:'tle-owner-request-examples-20261108.js'}).runInNewContext(requestCtx);
const requests=requestCtx.window.TLEOwnerRequestExamples;
assert.match(owner,/src="\/assets\/tle-owner-request-examples-20261108\.js"/);
assert.match(owner,/TLEOwnerRequestExamples\?\.\[current\]/);
assert.equal(Object.keys(requests).length,13,'Every demo brand needs its own fictional requests');
assert.deepEqual(Object.keys(requests).sort(),themes.map(x=>x[1]).sort());
for(const [slug,group] of Object.entries(requests)){
 for(const lang of ['en','es']){
  assert.ok(['Orders','Pedidos','Bookings','Reservas','Appointments','Citas','Requests','Solicitudes','Inquiries','Consultas','Reservations'].includes(group[lang]?.nav),
    'The navigation label must fit the business: '+slug+' '+lang);
  assert.ok(group[lang]?.intro.length>=25,'Meaningful fictional descriptor required: '+slug+' '+lang);
  assert.equal(group[lang]?.cards.length,3,'Three example inquiries per brand: '+slug+' '+lang);
  for(const card of group[lang].cards){
   assert.equal(card.length,3,'Title, subtitle and simulation disclaimer: '+slug+' '+lang);
   assert.ok(card.every(x=>typeof x==='string'&&x.trim()),'No blank content: '+slug+' '+lang);
   if(slug!=='experience-cleaning')assert.doesNotMatch(card.join(' ').toLowerCase(),/residencial|residential|home cleaning|limpieza profunda|mudanza/,
    'No residential cleaning copy for unrelated brands: '+slug+' '+lang);
  }
 }
}
assert.match(requests['lavender-edit'].es.cards[0][1],/lavanda/);
assert.match(requests['lavender-edit'].es.cards[1][1],/Ritual de lavanda/);
assert.match(requests['experience-cleaning'].es.cards[0][1],/residencial/);
assert.match(requests['ivory-and-bloom'].es.cards[0][1],/Pastel floral/);
assert.match(requests['soluna-yoga'].es.cards[0][1],/Flujo matutino/);
assert.doesNotMatch(owner,/New inquiry · Residential/,'The old cross-business default must be removed');

console.log('PASS: bilingual raspberry experience, 18 portfolio cards, 13 simulated Owner Centers, navigation and no real transactions');
