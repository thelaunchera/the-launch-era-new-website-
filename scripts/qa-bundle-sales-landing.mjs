import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const read=p=>readFileSync(p,'utf8');
const page=read('public/booking-bundle/index.html');
const js=read('public/assets/tle-bundle-landing.js');
const css=read('public/assets/tle-bundle-landing.css');
const checkout=read('public/assets/tle-booking-bundle.js');
const approved=[
 ['hero',2108152,'4ccd9d0e13f0457526e4847949ec4d206ae50babd983b50a26eb0665a8c84ac4'],
 ['booking',2068715,'da4336ffe3baa9bc3a5fab31b0a010b4f8b80ffa32e2e9f8602f8908e337e2e7'],
 ['command',2102496,'c38b643c2943cf7943cfaa5c2f2917bfbe90aa3502c6af276662b5fd1625e008'],
 ['ai',1994029,'330352a78db180ae7e5069131c117de05b8b4a5e4898b96f52854bb6a9b3a303']
];
for(const [name,size,sha] of approved){
 const path='public/assets/bundle-landing/bundle-'+name+'.png';
 assert(existsSync(path),'Missing approved photography '+path);
 const img=readFileSync(path);
 assert.equal(img.length,size,'Original photograph size changed '+name);
 assert.equal(createHash('sha256').update(img).digest('hex'),sha,'Original photograph bytes changed '+name);
 assert(page.includes('/assets/bundle-landing/bundle-'+name+'.png'),'Landing missing approved photo '+name);
}
for(const p of ['public/assets/tle-bundle-landing.js','public/assets/tle-booking-bundle.js']){
 execFileSync(process.execPath,['--check',p],{stdio:'inherit'});
}
assert(page.includes('id="experience"')&&page.includes('id="choose-plan"'),'Demo before checkout required');
assert(page.indexOf('id="experience"')<page.indexOf('id="choose-plan"'),'Checkout displayed before product education');
assert(page.includes('data-tle-bundle'),'Existing checkout mount point removed');
assert(page.includes('tle-booking-bundle.js?v=20261014-smart-welcome-v1'),'Existing checkout code missing');
assert(!js.includes('method:"POST"')&&!js.includes("method:'POST'"),'Sample demo must never post data');
assert(!js.includes('location.assign')&&!js.includes('checkout.stripe.com'),'Preview must not open payment itself');
assert(js.includes("data?.percent_off!==40"),'Promotion badge must be server-gated');
assert(checkout.includes('tle-booking-bundle-checkout'),'Pricing and Stripe checkout backend must remain authoritative');
assert(checkout.includes('data.amount_total'),'Existing checkout total verification absent');
assert(page.includes('href="#experience"'),'Story demo link missing');
assert(page.includes('href="#choose-plan"'),'Final checkout anchor missing');
assert(page.includes('data-es='),'Missing Spanish localizations');
assert(!page.includes('command-center/buyer-account-preview'),'Private owner-only Command Center preview must not be linked publicly');
assert(css.includes('max-width:720px')&&css.includes('max-width:380px'),'Responsive design fallbacks absent');
console.log('PASS: 4 approved images, safe sample demos, responsive bilingual landing and original secure pricing/checkout');
