/* The universal services feature row replaces retired cleaning card color shifts.
   No live booking or payment calls in this check. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const en=read('public/website-for-your-business/index.html');
const es=read('public/es/website-for-your-business/index.html');
const css=read('public/assets/tle-website-official.css');
for(const [name,page] of [['EN',en],['ES',es]]){
 assert(page.includes('class="features container"'),name+' four-feature row missing');
 assert.equal((page.match(/class="feature"/g)||[]).length,4,name+' must have four universal benefits');
 assert(page.includes('id="website-basic"')&&page.includes('id="website-ai-crm"'),name+' packages missing');
 assert(page.includes('class="process-grid"'),name+' simple steps missing');
}
assert(css.includes('.tle-universal'),'Offer stylesheet must remain scoped');
assert(css.includes('prefers-reduced-motion'),'Accessible reduced-motion behavior needed');
assert(read('src/routes/__root.tsx').includes('if (officialHome) return;'),'Old card color animation must not run on new homepage');
console.log('[TLE UNIVERSAL FEATURES] Four benefits, two packages, no retired cleaning color-shift UI on public home');
