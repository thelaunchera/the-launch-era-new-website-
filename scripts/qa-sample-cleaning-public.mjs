/** Public Sample Cleaning exact-template safety: no access bypass or real sends. */
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync('public/sample-cleaning/index.html','utf8');
const en=readFileSync('src/components/editorial-sections.tsx','utf8');
const es=readFileSync('src/routes/es.index.tsx','utf8');
const privateGate=readFileSync('public/booking-demo-reset.html','utf8');
const request=readFileSync('public/booking-demo/index.html','utf8');
assert(existsSync('public/sample-cleaning/index.html'));
for(const required of ['INTERACTIVE PREVIEW','SAMPLE REQUESTS ARE NOT SUBMITTED','Beautifully cleaned.','Simply booked.','Serving Miami','PERSONALIZED FOR SAMPLE CLEANING','id="bookingStarter"','id="leadName"','const isSampleDemo=true']){
  assert(html.includes(required),'Required sample feature missing: '+required);
}
assert.match(html,/<meta http-equiv="Content-Security-Policy"/);
assert.match(html,/form-action 'none'/);
assert.match(html,/connect-src https:\/\/bowacxhmjvrqixtwaikv\.supabase\.co;/, 'Only the opt-in AI chat may contact Supabase');
assert(html.includes("document.querySelectorAll('.demo-feature-bar>div>strong').forEach((el,i)=>{el.textContent=['Explora','Personaliza','Revisa'][i]||el.textContent})"),'Spanish progress headings must all be translated');
assert.match(html,/src="\/assets\/cleaning-demo\/hero-cleaner-original\.jpg"/);
assert.doesNotMatch(html,/src="\/assets\/booking-template-live\.js/);
for(const src of ['tle-ai-booking-prefill.js','tle-ai-booking-chat.js','tle-sample-sonny.js']){
  assert(html.includes('/assets/'+src),'Required opt-in Sonny asset missing: '+src);
}
const sonny=readFileSync('public/assets/tle-sample-sonny.js','utf8');
const ai=readFileSync('public/assets/tle-ai-booking-chat.js','utf8');
assert(sonny.includes('/assets/lead-demo/ai-demo-robot.webp'),'Use the existing approved Sonny robot');
assert(ai.includes('/functions/v1/tle-ai-booking-demo'),'Sonny must use the existing demo-only AI endpoint');
assert(!sonny.includes('fetch('),'Sonny launcher styling must not create a second network path');
new vm.Script(sonny);new vm.Script(ai);
assert.doesNotMatch(html,/PAULA DIAS CLEANING|HAVENS TOUCH HOUSEKEEPING|AKO CLEANING SERVICES/);
assert.doesNotMatch(html,/https:\/\/bowacxhmjvrqixtwaikv\.supabase\.co\/functions\/v1\/(?!tle-ai-booking-demo)/,
  'Public sample cannot call booking, email, payment or customer backends');
assert.doesNotMatch(html,/sessionStorage\.setItem|localStorage\.setItem/);
assert.match(html, /for\(const k of \['key','owner_preview','rid','lead','business','area','access','session'\]\)/);
assert.match(html, /\/booking-demo\/\?lang=en&source=sample-cleaning/);
for(const block of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)])new vm.Script(block[1]);
assert.match(en, /href="\/experience-cleaning\/\?lang=en&source=homepage">Try the Booking Demo/);
assert.match(es, /href="\/experience-cleaning\/\?lang=es&source=homepage">Prueba el demo de reservas/);
assert.match(en,/Request a More Personalized Demo/);
assert.match(en,/href="\/booking-demo\/\?lang=en&source=homepage-clara"/);
assert.match(es,/href="\/booking-demo\/\?lang=es&source=homepage-clara"/);
assert.match(privateGate,/tle-booking-demo-gate/);
assert.match(request,/tle-personalized-demo/);
console.log('PASS public cleaning sample, opt-in Sonny-only network, no booking/email/payment, protected private request and bilingual CTA');
