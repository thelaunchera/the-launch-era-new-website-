/* Retired cleaning scrollytelling is archived. Validate the current
   three-phase production journey and customer-facing delivery instead. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const en=read('public/website-for-your-business/index.html');
const es=read('public/es/website-for-your-business/index.html');
for(const [lang,s] of [['EN',en],['ES',es]]){
 assert(s.includes('id="proceso"'),lang+' process missing');
 assert.equal((s.match(/class="step-photo"/g)||[]).length,4,lang+' should show four steps');
 assert(s.includes('service-checkout/?offer=website-basic'),lang+' checkout missing');
 assert(s.includes('service-checkout/?offer=website-ai-crm'),lang+' subscription checkout missing');
}
for(const photo of ['process-choose.svg','process-brand.svg','process-build.svg','process-launch.svg']){
 assert(existsSync('public/assets/website-packages-20261105/'+photo),photo+' missing');
}
assert(read('src/routes/index.tsx').includes('OfficialHome'),'New public home must not show retired cleaning scrollytelling');
assert(read('src/routes/es.index.tsx').includes('OfficialHome'),'New Spanish home must not show retired cleaning scrollytelling');
console.log('[TLE CURRENT PROCESS] Four-step bilingual website production, agreed automations and package checkout paths passed');
