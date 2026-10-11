/**
 * The Launch Era — pre-deployment client-delivery contract checks.
 * Fast static guard: confirms shared promises and customer isolation.
 * This does NOT replace authenticated, owner-approved end-to-end QA.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const checks = [];
const check = (label, fn) => {
  try { fn(); checks.push({label, passed: true}); console.log('PASS', label); }
  catch (error) { checks.push({label, passed: false}); console.error('FAIL', label, error.message); }
};
const productionCopy = [
  'src/components/service-faq.tsx',
  'public/automation-terms/index.html',
  'public/es/automation-terms/index.html',
  'public/va-terms/index.html',
  'public/es/va-terms/index.html'
];
for (const path of productionCopy) {
  check('Production terms: ' + path, () => {
    const content = read(path);
    assert.match(content, /48\s*(?:-|‑|–)?\s*(?:hour|hora)/i, '48-hour promise missing');
    assert.match(content, /s[aá]bad|Saturday/i, 'Saturday cutoff missing');
    assert.doesNotMatch(content, /\b24\s*(?:-|‑|–)?\s*(?:hour|hora)[^\n]{0,45}(?:production|producci[oó]n)|(?:production|producci[oó]n)[^\n]{0,45}\b24\s*(?:-|‑|–)?\s*(?:hour|hora)/i, 'Old 24-hour production copy returned');
  });
}
check('Checkout confirmation only reveals intake after validation', () => {
  const page = read('public/booking-flow-payment-success/index.html');
  assert.match(page, /id="intakeLink"\s+hidden/);
  assert.match(page, /48\s*(?:-|‑|–)?\s*hour/);
  assert.match(page, /Promotions or Spam/, 'Buyer email reminder must stay visible in English');
  assert.match(page, /Promociones o Spam/, 'Buyer email reminder must have Spanish translation');
  assert.match(page, /getElementById\("nextStep"\)\.textContent/, 'Localized next-step text must update the correct element');
});
check('CB Depot brand and car-specific copy', () => {
  const js = read('public/assets/cb-depot-experience.js');
  assert.match(js, /vehicle-booking/, 'Branding must be scoped to detailing buyer');
  assert.match(js, /Professional car detailing/);
  assert.match(js, /assets\/clients\/cb-depot\/photos\/hero-desktop/);
  assert.match(js, /approved-favicon-192\.png/);
  assert.match(js, /\/cb-depot\/privacy\//);
  assert.match(js, /\/cb-depot\/terms\//);
  assert.doesNotMatch(js, /\bLicensed\s*(?:&|and)\s*Insured\b/i, 'Do not publish unverified licensed/insured');
});
check('Buyer-specific favicon and hero assets', () => {
  for (const path of [
    'public/assets/clients/cb-depot/photos/hero-desktop.webp',
    'public/assets/clients/cb-depot/photos/hero-mobile.webp',
    'public/assets/clients/cb-depot/approved-favicon-192.png',
    'public/assets/clients/cb-depot/approved-favicon-512.png'
  ]) assert(existsSync(path), path + ' missing');
});
check('CB Depot privacy and booking terms', () => {
  assert.match(read('public/cb-depot/privacy/index.html'), /CB Depot/);
  assert.match(read('public/cb-depot/terms/index.html'), /Requests are not confirmations/);
  assert.match(read('public/cb-depot/privacy/index.html'), /data-cb-back/);
  assert.match(read('public/cb-depot/terms/index.html'), /data-cb-back/);
});
check('Private AI Assistant review center has both decisions and revision count', () => {
  const page = read('public/client-review/index.html');
  assert.match(page, /Private AI Assistant Review/);
  for (const id of ['approve','change','feedback','limit','openAgent']) assert(page.includes('id="'+id+'"'), 'Missing AI review control: '+id);
  assert.match(page, /ai_status/);
  assert.match(page, /ai_decision/);
  assert.match(page, /token/);
  assert.doesNotMatch(page, /stripe\.com\/v1|STRIPE_SECRET_KEY/, 'Customer review must not manage billing directly');
});
check('Client-specific and agency app icons remain distinct', () => {
  const crm = 'https://github.com/thelaunchera/the-launch-era-crm/blob/main/';
  assert.match(read('public/assets/cb-depot-experience.js'), /approved-favicon/);
  assert(crm.includes('the-launch-era-crm'));
});
check('Reusable launch checklist exists', () => {
  assert(existsSync('scripts/qa-booking-base.mjs'));
  assert(existsSync('.github/workflows/booking-base-qa.yml'));
  assert(existsSync('.github/workflows/website-responsive-qa.yml'));
});
check('WhatsApp AI launch stays Coming Soon without public prices or checkout', () => {
  const offer = read('src/components/whatsapp-offer.tsx');
  assert.match(offer, /WHATSAPP_COMING_SOON=true/, 'The launch gate must remain enabled');
  assert.match(offer, /COMING SOON/, 'Homepage WhatsApp asset must show Coming Soon');
  for (const path of ['public/whatsapp-ai-agent/index.html', 'public/es/whatsapp-ai-agent/index.html']) {
    const content = read(path);
    assert.match(content, /class="offer-panel" hidden aria-hidden="true"/, 'Price panel must stay hidden: '+path);
    assert.match(content, /#setup\[hidden\],\.offer-panel\[hidden\]\{display:none!important\}/, 'Hide launch setup and prices: '+path);
    assert.match(content, /coming-soon-note/, 'Coming Soon state must be prominent');
    assert.match(content, /COMING SOON/, 'Coming Soon label missing');
    assert.match(content, /<p hidden aria-hidden="true">[^<]*\$48/, 'Retain existing prices in hidden markup for later: '+path);
    assert.doesNotMatch(content, /href="[^"]*service-checkout/, 'WhatsApp purchase must not open a checkout');
  }
});
check('Buyer design review offers both choices before delivery', () => {
  const page = read('public/command-center/index.html');
  const actions = read('public/command-center/assets/command-center-app.js');
  assert.match(page, /id="buyerReviewApprove"/);
  assert.match(page, /id="buyerReviewChange"/);
  assert.match(page, /id="buyerReviewFeedback"/);
  assert.match(actions, /buyer_decision/);
  assert.match(actions, /request_changes/);
  assert.match(actions, /Approve \/ Changes/, 'Mobile review entry must indicate both paths');
});
check('Private AI review preserves tab access and selects purchaser language', () => {
 const page=read('public/client-review/index.html');
 assert.match(page,/sessionStorage\.setItem\('tle_ai_private_review_token'/,'Lost token recovery on same-tab refresh');
 assert.match(page,/status\.language==='es'/,'AI review is not tied to purchase language');
 assert.match(page,/Solicitar cambios/,'Spanish request-changes UI missing');
 assert.match(page,/Guardar|Guardando tu decisión/,'Spanish status feedback missing');
 assert.match(page,/lang=status\.language==='es'\?'es':'en'/,'Language must be selected from authenticated review response');
});
check('Client review labels are translated in the reusable command center', () => {
 const view=read('public/command-center/index.html');
 const i18n=read('public/command-center/assets/command-center-i18n.js');
 const app=read('public/command-center/assets/command-center-app.js');
 assert.match(view,/id="buyerReviewApprove"/);
 assert.match(view,/id="buyerReviewChange"/);
 assert.match(i18n,/"✓ Approve Design":"✓ Aprobar diseño"/);
 assert.match(i18n,/"Approve \/ Changes":"Aprobar \/ Cambios"/);
 assert.match(app,/Aprobar diseño/);
 assert.match(app,/Solicitar cambios/);
});
check('WhatsApp Coming Soon English and Spanish feature parity', () => {
 const en=read('public/whatsapp-ai-agent/index.html');
 const es=read('public/es/whatsapp-ai-agent/index.html');
 const occurrences=(source,re)=>[...source.matchAll(re)].length;
 for(const [name,re] of [
  ['feature cards',/<article class="feature">/g],
  ['demo scenarios',/class="scenario" data-index=/g],
  ['FAQ questions',/<details><summary>/g],
  ['hidden prices',/<div class="offer-panel" hidden/g],
  ['launch banner',/class="coming-soon-note"/g]
 ])assert.equal(occurrences(en,re),occurrences(es,re),'EN/ES mismatch: '+name);
 assert.equal(occurrences(en,/<article class="feature">/g),6,'Six planned features must remain visible');
 assert.match(read('src/components/editorial-sections.tsx'),/Coming Soon/);
 assert.match(read('src/routes/es.index.tsx'),/Próximamente/);
 assert.doesNotMatch(read('src/components/editorial-sections.tsx'),/while we finish the connection/);
 assert.doesNotMatch(read('src/routes/es.index.tsx'),/mientras preparamos la conexión/);
});
check('All bilingual public pages keep matching forms, pricing and FAQ structure', () => {
 const pairedRoutes=[
  'ai-booking-assistant','automation-terms','booking-flow-intake',
  'intake/automation','intake/va','va-terms','whatsapp-ai-agent'
 ];
 const count=(src,re)=>[...src.matchAll(re)].length;
 for(const route of pairedRoutes){
  const en=read('public/'+route+'/index.html');
  const es=read('public/es/'+route+'/index.html');
  for(const [field,re] of Object.entries({
   forms:/<form\b/g,inputs:/<input\b/g,selects:/<select\b/g,
   buttons:/<button\b/g,details:/<details\b/g
  }))assert.equal(count(en,re),count(es,re),route+' '+field+' EN/ES mismatch');
  const dollarPrices=src=>[...src.matchAll(/\$\d+(?:\.\d{1,2})?/g)].map(m=>m[0]);
  assert.deepEqual(dollarPrices(en),dollarPrices(es),route+' EN/ES listed prices mismatch');
 }
});
const failed = checks.filter(x => !x.passed);
console.log('Client release static checks:', checks.length - failed.length, 'passed,', failed.length, 'failed');
if (failed.length) process.exitCode = 1;
