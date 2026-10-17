/* Homepage booking section retired by owner request 2026-10-16.
 * Guard against accidental resurrection of the duplicative sales block,
 * without touching product routes or pricing/checkout. */
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const en=read('src/routes/index.tsx');
const es=read('src/routes/es.index.tsx');
const editorial=read('src/components/editorial-sections.tsx');
const productEN=read('src/routes/booking-lead-automation.tsx');
const productES=read('src/routes/es.booking-lead-automation.tsx');
for(const [label,homepage,product,lang] of [
 ['English',en,productEN,'en'],['Spanish',es,productES,'es']
]){
 assert(!homepage.includes('<BookingSection'),label+': old homepage booking section reintroduced');
 assert(!homepage.includes('<ConnectedBookingFlow'),label+': retired workflow hub reintroduced');
 assert(homepage.includes('<HomeMotionInterlude lang="'+lang+'"/>'),label+': homepage successor removed');
 assert.match(product,/\$49\.99/,label+': regular booking price missing from product landing');
 assert.match(product,/\$19\.99/,label+': Fall Refresh promotion missing');
 assert(product.includes('/booking-bundle/?lang='+lang),label+': product checkout missing');
 assert(!/Saturday 12 PM ET|after-hours|next business day/i.test(product),label+': removed weekend limits must not reappear');
}
assert(!es.includes('<section className="booking-section">'),'Spanish homepage duplicate persists');
assert(en.includes('<FinalCTA/>')&&editorial.includes('export function FinalCTA'),'English final CTA removed');
assert(es.includes('className="final-section"'),'Spanish final CTA removed');
assert(!/After Saturday 12 PM ET|work starts the next business day/i.test(editorial),'Retired English booking block cannot bring back weekend cutoff copy');
assert(editorial.includes('<HeroConnectionBackdrop lang="en"/>')&&es.includes('<HeroConnectionBackdrop lang="es"/>'),'Do not remove approved hero effects');
console.log('✅ Retired home booking tone panel absent EN/ES; independent product pages, pricing, and final checkout preserved');
