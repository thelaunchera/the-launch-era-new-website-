/* Homepage booking section retired by owner request 2026-10-16.
 * Guard against accidental resurrection of the duplicative sales block,
 * without touching product routes or pricing/checkout. */
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const en=read('src/routes/index.tsx');
const es=read('src/routes/es.index.tsx');
const editorial=read('src/components/editorial-sections.tsx');
const primary=read('src/components/primary-booking-offer.tsx');
const productEN=read('src/routes/booking-lead-automation.tsx');
const productES=read('src/routes/es.booking-lead-automation.tsx');
for(const [label,homepage,product,lang] of [
 ['English',en,productEN,'en'],['Spanish',es,productES,'es']
]){
 assert(!homepage.includes('<BookingSection'),label+': old homepage booking section reintroduced');
 assert(!homepage.includes('<ConnectedBookingFlow'),label+': retired workflow hub reintroduced');
 assert(homepage.includes('<HomeMotionInterlude lang="'+lang+'"/>'),label+': homepage successor removed');
 assert.match(product,/\$49\.99/,label+': regular booking price missing from product landing');
 assert.match(product,/\$15/,label+': approved $15 booking offer missing');
 assert(product.includes('/booking-bundle/?lang='+lang),label+': product checkout missing');
 assert(lang==='es'?/48 horas/.test(product):/48.hour/.test(product),label+': correct production estimate missing');
 assert(lang==='es'?/revisar tus datos y confirmar el inicio/.test(product):/setup review and kickoff confirmation/.test(product),label+': production should begin after review and email kickoff confirmation');
}
assert(!es.includes('<section className="booking-section">'),'Spanish homepage duplicate persists');
assert(en.includes('<FinalCTA/>')&&editorial.includes('export function FinalCTA'),'English final CTA removed');
assert(es.includes('className="final-section"'),'Spanish final CTA removed');
assert(editorial.includes('<HeroConnectionBackdrop lang="en"/>')&&es.includes('<HeroConnectionBackdrop lang="es"/>'),'Do not remove approved hero effects');

// Storytelling guard: one real-life situation, product proof, then distinct buying decision.
assert(editorial.includes('You’re cleaning one home. Someone wants to book the next.'),'EN hero must begin with the real on-the-job moment');
assert(es.includes('Te escriben para reservar. Tú estás limpiando otra casa.'),'ES hero must have a natural, concrete moment');
assert(primary.includes("YOU'VE SEEN THE FLOW")&&primary.includes('Now picture that page'),'Offer should move forward from demo to a personalized purchase');
assert(primary.includes('Ahora imagina esa página'),'Spanish offer should move forward from demo to customization');
assert(!primary.includes('Your cleaning requests. <em>One place to manage them.')&&!primary.includes('Una Booking Page personalizada y un Command Center privado para organizar'),'Duplicated hero message returned in buying section');
assert(!primary.includes('<del>$49.99</del>'),'Buying block must show $15 plainly without an invented discount comparison');
assert(primary.includes("Get my Booking Page — $15")&&primary.includes("Quiero mi página de reservas — $15"),'Approved $15 CTA missing');
assert(editorial.includes('Start with booking.')&&es.includes('Empieza por las reservas.'),'Solutions should explain optional expansion, not repeat hero pain');
assert(editorial.includes('WHAT HAPPENS AFTER YOU BUY')&&es.includes('DESPUÉS DE COMPRAR'),'Three-step section should describe fulfillment rather than repeat booking demonstration');

console.log('✅ Retired home booking tone panel absent EN/ES; independent product pages, pricing, and final checkout preserved');
