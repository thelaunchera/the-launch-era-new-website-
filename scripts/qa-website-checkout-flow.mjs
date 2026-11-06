// Release guard: public CTAs must start Stripe checkout before paid-only setup.
import {readFileSync, existsSync} from 'node:fs';
function read(p){if(!existsSync(p))throw Error('Missing '+p);return readFileSync(p,'utf8')}
function ensure(v,m){if(!v)throw Error(m)}
const en=read('public/website-for-your-business/index.html');
const es=read('public/es/website-for-your-business/index.html');
const gateway=read('public/website-checkout/index.html');
const receipt=read('public/website-payment-success/index.html');
const basic=read('public/intake/website/index.html');
const advanced=read('public/intake/website-ai-crm/index.html');
const intakeJS=read('public/assets/tle-website-intake.js');
const customApp=read('public/custom-app/index.html');
const customJS=read('public/assets/tle-custom-app-request.js');

for (const [lang,page] of [['en',en],['es',es]]) {
 for(const offer of ['website-basic','website-ai-crm']){
  ensure(page.includes('href="/website-checkout/?offer='+offer+'&lang='+lang+'"'), lang+' '+offer+' does not go to checkout');
 }
 ensure(!/<p class="fine" data-key="termsNote">/.test(page),lang+' has the old lengthy pricing disclaimer');
 ensure(page.includes('src="/assets/website-packages-20261105/hero-jaramillo.svg"'),lang+' hero must remain untouched');
 ensure(!page.includes('data-key="heroOverline"')&&!page.includes('<span class="dash"></span>'),lang+' hero heading or yellow line still visible');
 ensure(page.includes('href="/custom-app/?lang='+lang+'"'),lang+' custom app request is not linked');
 ensure(page.includes(lang==='en'?'Due today: $25':'Pagas hoy $25'),lang+' $25 due today missing');
 ensure(page.includes(lang==='en'?'after 30 days':'después de 30 días'),lang+' 30-day recurring billing copy missing');
}
ensure(gateway.includes('tle-studio-website-start-checkout'), 'Missing secure checkout creation');
ensure(gateway.includes("dest.hostname!=='checkout.stripe.com'"),'Checkout must validate Stripe hostname');
ensure(receipt.includes('tle-studio-website-confirm-payment'),'Missing paid-session verification');
ensure(receipt.includes("data.paid!==true"),'Success page does not enforce paid status');
for(const p of [basic,advanced]){
 ensure(p.includes('id="intake-form" hidden'),'Form must be hidden before proof');
 ensure(p.includes('name="services" required'),'No services field in project setup');
 ensure(p.includes('name="preferred_email"'),'Missing delivery inbox');
 ensure(p.includes('name="brand_assets_url"'),'Missing brand asset URL');
 ensure(!p.includes('This is an inquiry'),'Retired inquiry template still published');
 ensure(p.includes('name="goals"'),'Missing website goals');
 ensure(p.includes('name="consent"'),'Missing consent');
 ensure(p.includes('name="domain_option"'),'Missing no-domain hosting choice');
 ensure(p.includes('name="website_photos"')&&p.includes('name="reference_photos"'),'Missing independent photo upload areas');
 ensure(p.includes('name="request_call"')&&p.includes('name="call_time"'),'Missing optional 1:1 call request');
}
ensure(intakeJS.includes("form.hidden=true;translate()"),'Form must be hidden by default');
ensure(intakeJS.includes("if(!paid||submit.disabled"),'Submission must require verified payment');
ensure(intakeJS.includes("kind:'intake',source:'checkout'"),'Paid intake payload missing');
ensure(intakeJS.includes("checkout_reference:session"),'Stripe session not linked to onboarding');
ensure(intakeJS.includes("receipt")===false,'No local receipt bypass should exist');
ensure(intakeJS.includes('tle-studio-website-upload-photo'),'Paid photo uploads must use private upload endpoint');
ensure(intakeJS.includes('after 30 days'),'Onboarding must show deferred AI fee');
ensure(customApp.includes('id="custom-app-form"'),'Custom app form missing');
ensure(customApp.includes('name="preferred_call"'),'Custom app 1:1 option missing');
ensure(customJS.includes('tle-studio-custom-app-request'),'Custom app form has no saving endpoint');
console.log('PASS: $15/$25 website CTAs start Stripe Checkout, paid confirmation gates project setup, old inquiry removed.');
