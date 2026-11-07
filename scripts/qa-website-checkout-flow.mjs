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
const ownerDelivery=read('public/website-delivery-admin/index.html');
const secureDeliveryFunction=read('supabase/functions/tle-website-delivery-activate/index.ts');
const customApp=read('public/custom-app/index.html');
const customJS=read('public/assets/tle-custom-app-request.js');

for (const [lang,page] of [['en',en],['es',es]]) {
 for(const offer of ['website-basic','website-ai-crm']){
  ensure(page.includes('href="/website-checkout/?offer='+offer+'&lang='+lang+'"'), lang+' '+offer+' does not go to checkout');
 }
 ensure(!/<p class="fine" data-key="termsNote">/.test(page),lang+' has the old lengthy pricing disclaimer');
 ensure(page.includes('<section class="hero hero-gallery" id="inicio">')&&page.includes('hero-gallery-stage'),lang+' official website hero structure missing');
 ensure(page.includes('href="/demos/?demo=havana-19"')&&!page.includes('data-demo="umbral"'),lang+' demo hero must link to canonical Havana 19 without duplicating Umbral');
 ensure(!page.includes('data-key="heroOverline"')&&!page.includes('<span class="dash"></span>'),lang+' hero heading or yellow line still visible');
 ensure(!page.includes('href="/custom-app/?lang='+lang+'"')&&!page.includes('class="app-section"'),lang+' should not advertise a separate app');
 ensure(page.includes(lang==='en'?'Due today: $25':'Hoy pagas $25'),lang+' $25 due today missing');
 ensure(page.includes(lang==='en'?'first month of AI + CRM service starts when the finished project is delivered':'primer mes de servicio IA + CRM comienza cuando entreguemos el proyecto terminado'),lang+' recurring billing must start after project delivery');
 ensure(!page.includes(lang==='en'?'after 30 days':'después de 30 días'),lang+' checkout-relative billing copy must not remain');
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
ensure(intakeJS.includes('first AI + CRM service month starts when the completed website is delivered'),'EN paid intake must start the service month upon delivery');
ensure(intakeJS.includes('primer mes de IA + CRM empieza con la entrega del website terminado'),'ES paid intake must start the service month upon delivery');
ensure(!intakeJS.includes('after 30 days')&&!intakeJS.includes('después de 30 días'),'Do not promise checkout-relative monthly billing');
ensure(ownerDelivery.includes('tle-website-delivery-activate'),'Owner delivery console must contact secured server function');
ensure(ownerDelivery.includes('Entregas &amp; mensualidades'),'Owner console must explain delivery-based billing');
ensure(secureDeliveryFunction.includes('platform_admins?user_id=eq.'),'Only authorized company admins can activate delivery billing');
ensure(secureDeliveryFunction.includes('confirmed_delivered!==true'),'Manual verified delivery confirmation required');
ensure(secureDeliveryFunction.includes('first_month_ends_at'),'First month must be stored from actual delivery');
ensure(secureDeliveryFunction.includes('tle_private_payment_hooks'),'Private Make activation webhook required');
ensure(secureDeliveryFunction.includes('stripe_subscription_id'),'Repeated delivery must not create another subscription');
ensure(customApp.includes('id="custom-app-form"'),'Custom app form missing');
ensure(customApp.includes('name="preferred_call"'),'Custom app 1:1 option missing');
ensure(customJS.includes('tle-studio-custom-app-request'),'Custom app form has no saving endpoint');
for(const kind of ['goal','feature','reference']){
 ensure(customApp.includes('data-group="'+kind+'"'),kind+' checkbox group missing');
 ensure(customApp.includes('name="'+kind+'_choices"'),kind+' options missing');
 ensure(customJS.includes('choiceGroup("'+kind+'")'),kind+' selected options are not saved');
}
ensure((customApp.match(/class="choice-option"/g)||[]).length>=20,'App brief needs specific selectable options');
ensure(customApp.includes('name="app_goals"')&&customApp.includes('name="preferred_features"')&&customApp.includes('name="reference_urls"'),'Each group needs an open-text field');
ensure(customJS.includes('goalRequired'),'One goal or free-text must be required');
ensure(customApp.includes('optional-app-original.jpg'),'Custom app uses old blurry image');
console.log('PASS: $15/$25 website CTAs start Stripe Checkout, paid confirmation gates project setup, recurring service month anchored to delivered website, old inquiry removed.');
