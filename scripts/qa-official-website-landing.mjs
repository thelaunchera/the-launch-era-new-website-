import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const pages=['public/website-for-your-business/index.html','public/es/website-for-your-business/index.html'];
const assets=['hero-jaramillo.jpg','website-la-vie-in-pink.svg','automated-crm.svg','process-choose.svg','process-brand.svg','process-build.svg','process-launch.svg','optional-app.svg'];
const folder='public/assets/website-packages-20261105/';
const css=read('public/assets/tle-website-official.css');
assert.match(css,/max-width:780px/,'Responsive mobile package styling');
assert.match(css,/monthly-price/,'Mobile-readable $8 subscription pricing');
for(const name of assets)assert.ok(existsSync(folder+name),'Missing approved source photo '+name);
for(const [i,path] of pages.entries()){
 const s=read(path),language=i===0?'en':'es';
 for(const name of assets)assert.ok(s.includes('/assets/website-packages-20261105/'+name),'Missing localized section photo '+name);
 assert.match(s,/hero-jaramillo\.jpg/,'Hero must show original seated Jaramillo designer');
 assert.match(s,/id="website-basic"/);
 assert.match(s,/id="website-ai-crm"/);
 for(const amount of ['$15','$25','$8','$33'])assert.ok(s.includes(amount),'Missing package billing disclosure '+amount);
 assert.ok(s.includes('/service-checkout/?offer=website-basic&lang='+language),'Basic checkout route');
 assert.ok(s.includes('/service-checkout/?offer=website-ai-crm&lang='+language),'AI subscription checkout route');
 assert.doesNotMatch(s,/href="\/intake\/website-ai-crm\/\?lang=[a-z]+" data-key="start"/,'Do not bypass Stripe');
 assert.ok(s.includes(language==='es'?'/es/terms.html':'/terms.html'),'Language-correct terms');
 assert.match(s,/href="#paquetes"/);
 assert.match(s,/href="#proceso"/);
 assert.match(s,/href="#preguntas"/);
 assert.match(s,/rel="canonical"/);
 assert.match(s,/hreflang="en-US"/);
 assert.match(s,/hreflang="es-US"/);
}
console.log('[TLE OFFICIAL LANDING] EN/ES two packages, original Jaramillo JPEG, eight photos, Stripe before intake, $8/month, and terms passed');
