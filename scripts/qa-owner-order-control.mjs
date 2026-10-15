import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('public/command-center/index.html','utf8');
const code=readFileSync('public/command-center/assets/command-center-app.js','utf8');
const stage=code.match(/function ownerPurchaseStage\(a\)\{[\s\S]*?\n\}/)?.[0];
assert(stage,'Owner Booking status classifier missing');
const fn=new Function(stage+'; return ownerPurchaseStage;')();
const completed={intake_done:true,booking_page_url:'https://example.org/book',crm_ready:true,status:'active',already_queued:true,qa_pass_count:6,buyer_review_status:'approved',activation_email_delivery_status:'delivered',buyer_signed_in_after_email:true,release_ready:true};
assert.equal(fn(completed),'completed','Fully audited recorded delivery');
assert.equal(fn({...completed,buyer_signed_in_after_email:false}),'delivered','No buyer access proof means delivery still needs verification');
assert.equal(fn({...completed,release_ready:false}),'delivered','Server readiness flag must be true');
assert.equal(fn({...completed,qa_pass_count:3}),'delivered','Legacy delivery with missing QA must not be shown as finished');
assert.equal(fn({...completed,activation_email_delivery_status:'sent'}),'delivered','Provider-accepted access email cannot be treated as delivered');
assert.equal(fn({...completed,buyer_review_status:'pending_review'}),'delivered','No client approval, no completed claim');
assert.equal(fn({...completed,already_queued:false}),'review');
assert.equal(fn({intake_done:false,already_queued:false}),'intake');
assert.equal(fn({intake_done:true,already_queued:false,crm_ready:false}),'production');

for(const id of ['ownerOrderControl','ownerOrderControlStatus','ownerOrderControlItems','ownerAIAssistantOrders','ownerAIOrdersStatus','ownerAIOrdersList'])assert(html.includes('id="'+id+'"'),'Missing owner order UI: '+id);
assert(html.indexOf('id="ownerOrderControl"')<html.indexOf('id="ownerTwoPreviews"'),'Order control must be the first useful mobile content');
assert(html.indexOf('id="ownerAIAssistantOrders"')<html.indexOf('id="ownerTwoPreviews"'),'AI orders must not be buried below demos');
for(const word of ['function ownerOrderNext','function renderOwnerOrderControl','function renderOwnerAIOrders','async function loadOwnerAIOrders','db.auth.getSession()','tle-ai-activation-on-delivery','ownerAIError','renderOwnerAIOrders();renderOwnerOrderControl();'])assert(code.includes(word),'Order integration missing '+word);
assert(code.includes("filter==='active'?!['completed','delivered'].includes(ownerPurchaseStage(a))"),'Already recorded deliveries must not clutter active production');
assert(code.includes("ownerPurchases.filter(x=>ownerPurchaseStage(x)!=='completed')"),
  'Owner attention queue must retain all unverified deliveries, including missing buyer sign-in and server readiness');
const isolated=code.slice(code.indexOf('function ownerOrderNext'),code.indexOf('function renderOwnerPurchases'));
assert(isolated.length>3000,'Owner order functions not found');
assert(!isolated.includes('confirm_delivery')&&!isolated.includes('send_activation')&&!isolated.includes('stripe/checkout'),'Order overview cannot send or activate');
assert(isolated.includes('if(!res.ok)throw Error('),'Errors must not count as zero AI orders');
assert(code.includes("ownerBookingError='unavailable'"),'Booking outages cannot be displayed as zero orders');
assert(code.includes("ownerPurchases=[];ownerBookingError='unavailable'"),'Clear stale booking records on error');
assert(code.includes("void loadOwnerAIOrders();"),'AI orders must load separately from Booking status');

console.log('PASS Owner Order Control: paid Booking/AI visibility, honest delivery state, mobile priority, no side effects.');


// Bundle regression: one paid checkout and one intake, with separate Booking / AI activation gates.
const start=code.indexOf('const ownerBundlePlans=');
const end=code.indexOf('function renderOwnerOrderControl(){',start);
assert(start>0&&end>start,'Combined purchase helpers must appear in owner view');
const source=code.slice(start,end);
const bundleLogic=(bookings,aiOrders,bundles,bookingError='',bundleError='')=>{
 const factory=new Function('ownerPurchases','ownerAIOrders','ownerBundles','ownerBookingError','ownerBundlesError',
   stage+';\n'+source+';\nreturn {ownerOrderBuckets,ownerPurchaseDisplayStage,ownerBundleNext};');
 return factory(bookings,aiOrders,bundles,bookingError,bundleError);
};
const id='11111111-1111-4111-8111-111111111111';
const bOrder={...completed,id,ai_addon_offer:'ai-business',intake_done:true};
const aiOrder={id:'22222222-2222-4222-8222-222222222222',offer:'ai-business',submitted_at:'2026-10-15',delivered_at:null};
const standaloneAI={id:'33333333-3333-4333-8333-333333333333',offer:'ai-followup',submitted_at:'2026-10-15',delivered_at:null};
const join={id,bundle_ai:'ai-business',ai_order_id:aiOrder.id,ai_status:'in_setup',ai_delivered_at:null};
let unit=bundleLogic([bOrder], [aiOrder,standaloneAI], [join]);
let buckets=unit.ownerOrderBuckets();
assert.equal(buckets.bundles.length,1,'Bundle has exactly one parent order');
assert.equal(buckets.booking.length,0,'Booking bundle not counted as standalone booking');
assert.equal(buckets.ai.length,1,'Bundled AI order not counted again as standalone AI');
assert.equal(buckets.ai[0].id,standaloneAI.id,'Unrelated AI purchase remains visible');
assert.equal(unit.ownerPurchaseDisplayStage(bOrder),'bundle','Delivered Booking is not completed bundle until AI delivered');
assert.match(unit.ownerBundleNext(bOrder,join,true),/AI Assistant/, 'Partial bundle next step must identify AI work');
let completedJoin={...join,ai_status:'active',ai_delivered_at:'2026-10-15'};
unit=bundleLogic([bOrder], [{...aiOrder,delivered_at:'2026-10-15'},standaloneAI], [completedJoin]);
buckets=unit.ownerOrderBuckets();
assert.equal(buckets.bundles.length,0,'Fully verified bundle no longer in pending queue');
assert.equal(unit.ownerPurchaseDisplayStage(bOrder),'completed','Only both verified deliveries can close bundle');
unit=bundleLogic([bOrder], [aiOrder,standaloneAI], [{...join,ai_order_id:null,ai_status:'not_prepared'}]);
buckets=unit.ownerOrderBuckets();
assert.equal(buckets.bundles.length,1,'A missing AI order must remain visible as an incomplete bundle');
assert.match(unit.ownerBundleNext(bOrder,buckets.bundles[0].linked,false),/linked AI order is missing/, 'Warn if AI order not created');
unit=bundleLogic([bOrder], [aiOrder,standaloneAI], [],'','unavailable');
assert.equal(unit.ownerOrderBuckets().bundles.length,1,'Bundle still visible with unverified backend linkage');
assert.equal(unit.ownerPurchaseDisplayStage(bOrder),'bundle','Missing linkage cannot close the bundle');
assert(html.includes('<option value="bundle">Booking + AI Bundle</option>'),'Bundle has dedicated purchase filter');
assert(code.includes("void loadOwnerBundles();"),'Load bundle records independently');
assert(code.includes("db.rpc('tle_owner_bundle_queue')"),'Use verified owner bundle purchase relation');
assert(!source.includes('owner_email==='),'Do not join customer orders by email');
console.log('PASS Booking+AI bundle: one owner order, two approvals, missing AI alert, no duplicate AI, fail-closed joins.');
