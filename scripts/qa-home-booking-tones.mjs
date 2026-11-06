/* Rebranded homepage guard: the old booking-only sales offer stays archived,
   while existing customer product routes remain untouched for fulfillment. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const en=read('src/routes/index.tsx'),es=read('src/routes/es.index.tsx');
const official=read('src/components/official-home.tsx');
for(const [name,source,language] of [['EN',en,'en'],['ES',es,'es']]){
 assert(source.includes('<OfficialHome lang="'+language+'" />'),name+' universal homepage missing');
 assert(!source.includes('<PrimaryBookingOffer'),name+' retired cleaning purchase block returned');
 assert(!source.includes('<SmartWelcomeBundle'),name+' legacy cleaning popup returned');
 assert(source.includes('hero-jaramillo.jpg'),name+' canonical marketing hero missing');
}
for(const [lang,p] of [['en','public/website-for-your-business/index.html'],['es','public/es/website-for-your-business/index.html']]){
 const html=read(p);
 assert(html.includes('/service-checkout/?offer=website-basic&lang='+lang),'Current website package checkout missing');
 assert(html.includes('/service-checkout/?offer=website-ai-crm&lang='+lang),'Current AI CRM package checkout missing');
 assert(html.includes('$8'),lang+' recurring billing missing');
 assert(!html.includes('Booking Automation + Command Center'),'Old sales offer leaked into current marketing');
}
assert(official.includes('hero-jaramillo.jpg'),'Original Jaramillo hero missing in actual home');
assert(existsSync('public/booking-bundle/index.html'),'Historical purchases must remain accessible');
console.log('[TLE HOME QA] Universal bilingual website packages replaced the retired cleaning-only homepage');
