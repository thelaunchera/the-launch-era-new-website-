import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read=path=>readFileSync(path,'utf8');
const root=read('src/routes/__root.tsx');
const home=read('src/components/official-home.tsx');
const routes=[['src/routes/index.tsx','en'],['src/routes/es.index.tsx','es']];
const pages=[['public/website-for-your-business/index.html','en'],['public/es/website-for-your-business/index.html','es']];
const checkout=read('public/service-checkout/index.html');
const termsEN=read('public/terms.html'), termsES=read('public/es/terms.html');
const sitemap=read('public/sitemap.xml');
const hero='public/assets/website-packages-20261105/hero-jaramillo.jpg';
assert.ok(existsSync(hero),'Original Jaramillo photo must be a direct high-quality JPEG asset');
assert.match(root,/officialHome=pathname==='\/'/,'Root must recognize official home routes');
assert.match(root,/!officialHome && <SiteHeader/,'Do not render legacy cleaning navbar on official home');
assert.match(root,/!officialHome && <SiteFooter/,'Do not render legacy cleaning footer on official home');
for(const [path,lang] of routes){
 const s=read(path);
 assert.match(s,/<OfficialHome lang=/,'Homepage should contain official landing, not old booking offer');
 assert.match(s,/hero-jaramillo\.jpg/,'SEO should preload original Jaramillo hero image');
 assert.match(s,/og:image/,'SEO needs social preview image');
 assert.match(s,/canonical/,'Canonical required');
 assert.match(s,/hrefLang:'en-US'/);
 assert.match(s,/hrefLang:'es-US'/);
 assert.doesNotMatch(s,/Cleaning Business Automation|Booking Page \+ Command Center/);
 assert.match(s,new RegExp('lang="'+lang+'"'));
}
for(const [path,lang] of pages){
 const s=read(path);
 assert.match(s,/hero-jaramillo\.jpg/,'Hero is seated woman with Jaramillo laptop');
 assert.match(s,/monthly-price/,'The recurring fee must appear beside AI package');
 assert.match(s,/\$8/,'Monthly fee must be visible');
 assert.match(s,/\$33/,'First checkout charge must be visible');
 assert.match(s,/service-checkout\/\?offer=website-basic/);
 assert.match(s,/service-checkout\/\?offer=website-ai-crm/);
 assert.doesNotMatch(s,/href="\/intake\/website-ai-crm\/\?lang=[a-z]+" data-key="start"/);
 assert.match(s,/https:\/\/thelaunchera\.com\/assets\/website-packages-20261105\/hero-jaramillo\.jpg/);
 assert.match(s,lang==='es'?/lang="es"/:/lang="en"/);
}
assert.match(home,/hero-jaramillo\.jpg/);
assert.match(home,/\$8/);
assert.match(home,/service-checkout/);
// Regression: every checkout DOM node accessed by startup JS must exist in markup.
const checkoutNodes=[...checkout.matchAll(/\$\('([^']+)'\)/g)].map(m=>m[1]);
for(const id of new Set(checkoutNodes)){
 assert.match(checkout,new RegExp('id="'+id+'"'),'Checkout startup would crash: missing DOM node #'+id);
}
assert.match(checkout,/'website-basic':\{cents:1500/);
assert.match(checkout,/'website-ai-crm':\{cents:3300/,'AI Checkout must expect $25 setup + first $8 month');
assert.match(checkout,/website-payment-success|create-tle-service-checkout/);
assert.match(termsEN,/\$33/);assert.match(termsES,/\$33/);
assert.match(termsEN,/pop-up/);assert.match(termsES,/pop-ups/);
assert.match(termsEN,/\$8/);assert.match(termsES,/\$8/);
assert.doesNotMatch(termsEN,/Cleaning Web App|VA Essential Support|Booking Automation \+ Command Center/);
assert.doesNotMatch(termsES,/Cleaning Web App|VA Essential Support|Booking Automation \+ Command Center/);
assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]),['https://thelaunchera.com/','https://thelaunchera.com/es']);
console.log('PASS: bilingual official home, original Jaramillo hero, recurring price, checkout routing, service terms and SEO.');
