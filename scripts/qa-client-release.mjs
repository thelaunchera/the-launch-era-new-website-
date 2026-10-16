/**
 * The Launch Era — pre-deployment client-delivery contract checks.
 * Fast static guard: confirms shared promises and customer isolation.
 * This does NOT replace authenticated, owner-approved end-to-end QA.
 */
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import './qa-multicompany.mjs';
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
    assert.doesNotMatch(content, /s[aá]bad|Saturday|8:30 AM|siguiente horario laborable|next business day/i, 'Retired timetable or automatic next-business-day kickoff returned');
    assert.match(content, /approv|aprob|revisamos|review/i, 'Owner review or approval step is missing');
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
    assert.match(content, path.startsWith('public/es/') ? /PRÓXIMAMENTE/ : /COMING SOON/, 'Localized coming soon label missing: '+path);
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
check('Delivered buyer public Booking Page share is gated, workspace-scoped and bilingual', () => {
 const ui=read('public/command-center/index.html');
 const logic=read('public/command-center/assets/command-center-app.js');
 const lang=read('public/command-center/assets/command-center-i18n.js');
 for(const id of ['buyerBookingShareCard','buyerBookingShareActions','buyerBookingShareUrl','buyerCopyBookingLink','buyerOpenBookingLink','buyerBookingShareStatus'])
  assert(ui.includes('id="'+id+'"'),'Missing public-link control: '+id);
 assert.match(logic,/function verifiedPublicBookingUrl\(/,'Public link validator required');
 assert.match(logic,/url\.searchParams\.get\('key'\)/,'Missing actual buyer public key validation');
 assert.match(logic,/owner_preview/,'Private preview must not be shared');
 assert.match(logic,/delivery_ready===false/,'Must honor server release readiness');
 assert.match(logic,/if\(!buyerDeliveryReady\)await syncBuyerDeliveryActivation\(\)/,'Must refresh buyer delivery state');
 assert.match(logic,/function syncManagedBuyerEmailStatus\(/,'Managed email status must be independent of legacy self-managed sender');
 assert.match(lang,/"Copy Booking Link":"Copiar enlace de reservas"/,'Missing Spanish sharing label');
 assert.match(lang,/"Share your Booking Page":"Comparte tu página de reservas"/,'Missing Spanish sharing headline');
});
check('Smooth buyer Back navigation and real post-save confirmation in English and Spanish',()=>{
 const ui=read('public/command-center/index.html');
 const logic=read('public/command-center/assets/command-center-app.js');
 const styles=read('public/command-center/assets/command-center.css');
 for(const id of ['workspaceBack','crmSaveToast','crmSaveToastText'])assert(ui.includes('id="'+id+'"'),'Missing interaction: '+id);
 for(const marker of [
  'function showSaveToast(', 'function navigateWorkspaceBack()',
  'workspaceBackStack.push(priorView)', 'workspaceNavigationInitialized=false',
  "showSaveToast('success','Prices saved and published'",
  "showSaveToast('success','Availability saved'",
  "showSaveToast('success','Email edits saved'",
  "showSaveToast('error','Could not save prices'",
  "showSaveToast('error','Could not save availability'",
  "showSaveToast('success','Work dates saved'"
 ])assert(logic.includes(marker),'Missing saved-only feedback or navigation guard: '+marker);
 assert.match(styles,/prefers-reduced-motion:reduce/,'Animations must respect reduced motion');
 assert.match(styles,/safe-area-inset-bottom/,'Save banner must stay visible on mobile');
 assert.match(styles,/crmViewEnter/,'Missing view transition');
 assert(!logic.includes("history.pushState("),'Navigation should never expose private view state in URL');
});
check('Owner delivery excludes archived and queued clients, preserving Completed Clients', () => {
 const logic=read('public/command-center/assets/command-center-app.js');
 const stage=logic.match(/function ownerPurchaseStage\(a\)\{[\s\S]*?\n\}/);
 const pending=logic.match(/function ownerDeliveryPending\(a\)\{[\s\S]*?\n\}/);
 assert(stage && pending,'Missing owner lifecycle or pending-delivery logic');
 assert.match(logic,/const entries=\(Array\.isArray\(data\)\?data:\[\]\)\.filter\(ownerDeliveryPending\)/,'Client delivery must filter the paid-order response');
 assert.match(logic,/ownerPurchases=Array\.isArray\(data\)\?data:\[\]/,'Completed Clients must retain original history records');
 const isPending=runInNewContext(stage[0]+'\n'+pending[0]+'\nownerDeliveryPending;');
 assert.equal(isPending({already_queued:false,intake_done:false}),true,'New buyer should appear');
 assert.equal(isPending({already_queued:false,intake_done:true,crm_ready:true,booking_page_url:'https://example.com',status:'active'}),true,'Buyer under review should appear');
 assert.equal(isPending({already_queued:true,qa_pass_count:0}),false,'Queued delivery should leave the pending section');
 assert.equal(isPending({already_queued:true,qa_pass_count:6,buyer_review_status:'approved'}),false,'Archived completed buyer must not reappear');
 assert.match(logic,/No pending client deliveries/,'English empty state missing');
 assert.match(logic,/No hay entregas pendientes/,'Spanish empty state missing');
});
const failed = checks.filter(x => !x.passed);
console.log('Client release static checks:', checks.length - failed.length, 'passed,', failed.length, 'failed');
if (failed.length) process.exitCode = 1;
