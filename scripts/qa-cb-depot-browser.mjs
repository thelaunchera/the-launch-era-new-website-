// Browser-level smoke verification. Runs without entering customer data or sending forms.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const url='https://the-launch-era-new-website.pages.dev/cb-depot/';
let chrome='';
for(const cmd of ['google-chrome','google-chrome-stable','chromium']){
 try{chrome=execFileSync('which',[cmd],{encoding:'utf8'}).trim();if(chrome)break}catch{}
}
assert.ok(chrome,'Chrome / Chromium is not installed on this QA runner');
const html=execFileSync(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--window-size=1440,900','--virtual-time-budget=13000','--dump-dom',url],{encoding:'utf8',timeout:90000,maxBuffer:10000000,stdio:['ignore','pipe','pipe']});
const brand=(html.match(/<small[^>]*id="leadName"[^>]*>([^<]*)/i)||[])[1]||'';
const title=(html.match(/<title>([^<]*)/i)||[])[1]||'';
const pageUnavailable=/Booking Page unavailable|Página de reservas no disponible/i.test(html);
console.log('Rendered browser title:',title,'Hero label:',brand,'Unavailable:',pageUnavailable);
assert.equal(brand.trim().toUpperCase(),'CB DEPOT','Live DOM did not load CB Depot branded booking data');
assert.ok(!pageUnavailable,'Page rendered unavailable error instead of live booking');
assert.ok(/class="[^"]*buyer-live-page/.test(html),'Live booking enhancement did not mount');
assert.ok(html.includes('cb-depot')||html.includes('CB Depot'),'CB Depot client assets absent from rendered browser DOM');
console.log('PASS: CB Depot branded booking page rendered in Chrome with live account configuration. No customer data submitted.');
