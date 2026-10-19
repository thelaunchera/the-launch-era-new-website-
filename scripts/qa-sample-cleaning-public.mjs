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
for(const required of ['INTERACTIVE PREVIEW','TEST REQUESTS ONLY','Beautifully cleaned.','Simply booked.','Serving Miami','PERSONALIZED FOR SAMPLE CLEANING','id="bookingStarter"','id="leadName"','const isSampleDemo=true','connect-src &#39;none&#39;']){
  if(required.includes('&#39;')){assert(html.includes("connect-src 'none'"),'Block all network requests for public preview');continue;}
  assert(html.includes(required),'Required original sample feature missing: '+required);
}
assert.match(html,/<meta http-equiv="Content-Security-Policy"/);
assert.match(html,/form-action 'none'/);
assert.match(html,/src="\/assets\/cleaning-demo\/hero-cleaner-original\.jpg"/);
assert.doesNotMatch(html,/src="\/assets\/booking-template-live\.js|src="\/assets\/tle-ai-booking-chat\.js/);
assert.doesNotMatch(html,/PAULA DIAS CLEANING|HAVENS TOUCH HOUSEKEEPING|AKO CLEANING SERVICES/);
assert.doesNotMatch(html,/https:\/\/bowacxhmjvrqixtwaikv\.supabase\.co/);
assert.doesNotMatch(html,/sessionStorage\.setItem|localStorage\.setItem/);
assert.match(html, /for\(const k of \['key','owner_preview','rid','lead','business','area','access','session'\]\)/);
assert.match(html, /\/booking-demo\/\?lang=en&source=sample-cleaning/);
for(const block of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)])new vm.Script(block[1]);
assert.match(en, /href="\/sample-cleaning\/\?lang=en&source=homepage">Try the Booking Demo/);
assert.match(es, /href="\/sample-cleaning\/\?lang=es&source=homepage">Ver demos/);
assert.match(en,/Request a More Personalized Demo/);
assert.match(en,/href="\/booking-demo\/\?lang=en&source=homepage-clara"/);
assert.match(es,/href="\/booking-demo\/\?lang=es&source=homepage-clara"/);
assert.match(privateGate,/tle-booking-demo-gate/);
assert.match(request,/tle-personalized-demo/);
console.log('PASS sample preview exact identity, no backend/network, original protected Clara request, bilingual CTA');
