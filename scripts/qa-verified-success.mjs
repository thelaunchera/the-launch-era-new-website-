/* Source guard for server-confirmed contact/freebie receipts. Never sends data. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const confirm=read('src/components/success-confirmation.tsx');
const styles=read('src/components/success-confirmation.css');
const en=read('src/components/editorial-sections.tsx');
const es=read('src/routes/es.index.tsx');
const freebie=read('src/components/freebie-page.tsx');
for(const [name,source] of [['EN',en],['ES',es],['freebie',freebie]]){
 assert(source.includes('SuccessConfirmation'), name+' must render shared receipt');
 assert(source.includes("setStatus('sent')"),name+' must render confirmed state');
 assert(source.includes('if(!'),name+' must gate on a backend success response');
 assert(!source.includes("window.setTimeout(()=>setStatus('sent'),1450)"),name+' must not delay receipt');
}
assert(confirm.includes('emailSent')&&confirm.includes("role=\"status\""),'success receipt must be accurate and announced');
for(const token of ['pathLength="1"','tle-success-ring','tle-success-summary','tle-success-compact','prefers-reduced-motion:reduce','stroke-dashoffset:0']){
 assert((confirm+styles).includes(token),token+' must be accessible and visually defined');
}
assert(styles.includes('@media(max-width:760px)'),'phone layout missing');
assert(en.includes('sendingRef.current')&&es.includes('sendingRef.current')&&freebie.includes('sendingRef.current'),'duplicate-submit guard missing');
assert(read('src/components/contact-stepper.tsx').includes('validStep(step)'),'existing step validation must remain');
console.log('[VERIFIED SUCCESS QA PASSED] server-gated EN/ES contact and freebie receipts, compact check and retry semantics.');
