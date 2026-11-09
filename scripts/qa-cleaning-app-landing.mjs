/** Retirement regression: prevent re-selling the discontinued standalone Cleaning App. */
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
const read=(p)=>readFileSync(p,'utf8');
const en=read('src/components/editorial-sections.tsx');
const es=read('src/routes/es.index.tsx');
const service=read('src/components/service-sales.tsx');
const enRoute=read('src/routes/cleaning-web-app.tsx');
const esRoute=read('src/routes/es.cleaning-web-app.tsx');
const alias=read('public/cleaning-app/index.html');
const demo=read('public/cleaning-app-demo/index.html');
const checkout=read('public/service-checkout/index.html');
const termsEN=read('public/terms.html');
const termsES=read('public/es/terms.html');

for(const [name,src] of [['EN home',en],['ES home',es]]){
 assert(!src.includes("{title:'Cleaning App'"),name+' should not advertise product card');
 assert(!/Explore the Cleaning App|Conoce la Cleaning App|\/cleaning-web-app\//.test(src),name+' should have no active app sales links');
 assert(/Booking Automation \+ Command Center/.test(src),name+' should preserve Booking Page / Command Center');
}
assert(!/entry=signup|\/cleaning-app-demo|\$3\.99|About the Cleaning App|Sobre la Cleaning App/.test(service),'Shared service-sales component still sells the retired app');
assert(enRoute.includes("window.location.replace('/website-for-your-business/')"),'EN retired product route must redirect');
assert(esRoute.includes("window.location.replace('/es/website-for-your-business/')"),'ES retired product route must redirect');
assert(enRoute.includes('noindex,follow')&&esRoute.includes('noindex,follow'),'Retired sales routes must be noindex');
assert(alias.includes('auth-recovery.html'),'Legacy callback must preserve password recovery');
assert(alias.includes('website-for-your-business/'),'Old app alias must redirect to the website packages');
assert(demo.includes('website-for-your-business/'),'Old promotional demo must redirect to the website packages');
assert(!/["'](?:cleaning-app|cleaning-web-app|cleaning_app)["']/.test(checkout),'General service checkout must not accept old Cleaning App offer');
assert(!termsEN.includes('Cleaning App')&&!termsES.includes('Cleaning App'),'Current public terms must not promote Cleaning App');
console.log('PASS: retired Cleaning App offer absent; EN/ES redirects and Booking purchase paths preserved.');
