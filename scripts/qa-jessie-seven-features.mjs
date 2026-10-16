import assert from "node:assert/strict";
import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const front=read("public/assets/jessy-site.js"),css=read("public/assets/jessy-site.css");
const chat=read("supabase/functions/tle-jessy-chat/index.ts");
const crm=read("supabase/functions/tle-jessie-demo-lead/index.ts");
const metrics=read("supabase/functions/tle-jessie-metrics/index.ts");
const sql=read("supabase/migrations/20261015_tle_jessie_anonymous_insights.sql");
const owner=read("public/command-center/lead-insights.html");
const sonny=read("public/assets/tle-demo-enhancements-v12.js");
const sonnyChat=read("public/assets/tle-ai-booking-chat.js");
const sonnyCss=read("public/assets/tle-demo-enhancements-v12.css");
// Product fit + two original interactive samples: no second copy, private tokens or real booking endpoint.
assert.match(chat,/missed or scattered booking requests -> Booking Automation/);
assert.match(chat,/inquiries lost through an existing website -> Website Automation/);
assert.match(crm,/lead-private-preview\.html/,"The original personalized demo URL is emailed by the backend");
assert.doesNotMatch(front,/lead-private-preview\.html/,"Never reveal the sample demo URL inside Jessie");
assert.match(front,/\/cleaning-app-demo\//); // Direct, freely accessible app sample.
assert.doesNotMatch(front,/showDemoCard\("cleaning-app"\)/);
assert.match(front,/else if\(next==="demo_choice"\)\{showDemoCard\("booking"\)\}/);
assert.match(front,/else if\(next==="app_demo"\)/);
assert.match(front,/a\.href="\/cleaning-app-demo\/\?lang="\+lang/);
assert.doesNotMatch(front,/demoSelected="cleaning-app"/);
assert.match(chat,/id==="cleaning-app"\?"app_demo"/);
assert.match(chat,/Cleaning App sample is freely accessible/);
assert.match(crm,/clean\(data\.service,40\)!=="booking"/);
assert.doesNotMatch(crm,/"cleaning-app":\{name:"Cleaning App"/);

assert.doesNotMatch(front,/tle-jessy-demo-frame/,"Jessie must not embed the demo after confirmation");
assert.doesNotMatch(front,/demoFrame\.src/,"The personalized demo belongs only in the email");
assert.doesNotMatch(front,/showDemoCard\("cleaning-app"\)/);
assert.match(front,/else if\(next==="demo_choice"\)\{showDemoCard\("booking"\)\}/);
assert.match(front,/else if\(next==="app_demo"\)/);
assert.match(front,/a\.href="\/cleaning-app-demo\/\?lang="\+lang/);
assert.match(front,/if\(next==="demo"&&offer==="booking"\)showDemoCard\("booking"\)/);
assert.match(front,/demoGate\.addEventListener\("submit"/);
assert.match(front,/demoBusiness=demoField\("Business name"\)/);
assert.match(front,/demoArea=demoField\("Service area/);
assert.match(front,/demoConsent\.required=true/);
assert.match(front,/consent:demoConsent\.checked/);
assert.match(front,/email:demoEmail\.value\.trim\(\)/);
assert.match(front,/demoConfirmation\.hidden=false/,"Success must be shown inside Jessie's confirmation dialog");
assert.match(front,/demoGate\.hidden=true/);
assert.match(front,/demoDone\.addEventListener\("click",closeDemo\)/);
assert.match(front,/Don.t forget to try a live booking with my friend Sonny!/);
assert.match(sonny,/data-action="home"/,"Sonny must let sample visitors choose home cleaning");
assert.match(sonny,/data-action="business"/,"Sonny must let sample visitors choose business cleaning");
assert.match(sonny,/data-action="explain"/,"Sonny must explain how the simulation works");
assert.match(sonny,/form\.requestSubmit\(\)/,"Choosing a category should start Sonny immediately");
assert.match(sonny,/No real booking is submitted/,"Do not imply sample bookings are real");
assert.match(sonnyCss,/tle-demo-v12-chat-actions\[hidden\]/,"Hide Sonny sample chips after selection");
assert.match(sonnyChat,/quick\.hidden=false/,"Reset sample chips when Sonny restarts");

assert.match(front,/it.s a simulation, not a real booking/);
// User consent must precede any demo unlock and backend must require business + email + area.
assert.ok(front.indexOf("data.email_sent!==true")<front.indexOf("demoConfirmation.hidden=false"),"Only show success after email provider accepts the request");
assert.match(crm,/data\.consent!==true/);
assert.match(crm,/business\|\|!area/);
assert.match(crm,/jessie_demo/);
assert.match(crm,/tle_crm_leads/);
assert.match(crm,/eq\("workspace_id",WORKSPACE\)/);
assert.match(crm,/email_consent_status:"unknown",email_followup_enabled:false/);
assert.match(crm,/email_consent_status==="withdrawn"/);
assert.match(crm,/find\(row=>!row\.archived_at\)/,"Archived leads should never be revived silently");
assert.doesNotMatch(crm,/if\(previous\?\.archived_at\)return json/,"Archived history alone must not block a new opted-in request");
assert.match(crm,/some\(row=>row\.email_consent_status==="withdrawn"\|\|row\.contact_decision==="no"\)/,"Opt-outs override new public demo requests");
assert.match(crm,/p_limit:6/,"Allow retries after prior failed submissions while retaining rate limit");
const examples=[
 {archive:true,consent:"unknown",decision:"yes"},
 {archive:false,consent:"unknown",decision:"review"},
 {archive:true,consent:"withdrawn",decision:"yes"}
];
const suppressed=rows=>rows.some(row=>row.consent==="withdrawn"||row.decision==="no");
const active=rows=>rows.find(row=>!row.archive);
assert.equal(active([examples[0]]),undefined,"A previous archived record is not an active lead");
assert.equal(suppressed([examples[0]]),false,"Archival alone does not mean unsubscribe");
assert.deepEqual(active([examples[0],examples[1]]),examples[1],"Reuse the active record if one exists");
assert.equal(suppressed([examples[2]]),true,"A previous opt-out must block the transactional request");

assert.match(crm,/href="'\+svc\.url\+'".*color:#276687/,"Sonny link in email must use the SAME personalized sample URL");
assert.match(crm,/Try a live booking simulation with my friend Sonny/,"Email presents a simulated, not real, booking");
assert.match(crm,/Idempotency-Key/);
assert.match(crm,/tle-crm-interest\?lead=/);
assert.match(crm,/event_type:"email_sent"/);
assert.match(crm,/event_type:"jessie_demo_sent"/);
assert.doesNotMatch(crm,/email_followup_enabled:true/);
// Explicit opt-in is NOT the same as interest confirmation; no auto followup.
assert.match(crm,/I'm Interested/);
assert.match(crm,/No marketing subscription is added/);
assert.match(chat,/For returning buyers/);
assert.match(chat,/client_help/);
assert.match(front,/visitorLanguage/);
assert.match(front,/manualLanguage=true/);
assert.match(front,/visitorIntent/);
assert.match(front,/showAiPlanChoices/);
assert.match(front,/consent\.checked/);
// Analytics are categories only; authenticated owner access and RLS enforced.
assert.match(sql,/ENABLE ROW LEVEL SECURITY/);
assert.match(sql,/REVOKE ALL/);
assert.match(metrics,/db\.auth\.getUser\(token\)/);
assert.match(metrics,/platform_admins/);
assert.match(metrics,/const summary=/);
assert.match(metrics,/event_type:event,service,intent,language/);
assert.match(owner,/jessieAnalyticsPanel/);
assert.match(owner,/session\.access_token/);
assert.ok(!/\b(email|phone|transcript|ip_address|session_id)\s+(text|varchar|uuid)\b/i.test(sql),"Analytics schema must contain no identity columns");
assert.match(css,/tle-jessy-demo-gate/);
assert.match(css,/max-width:600px/);
assert.ok(!front.includes("send payment")&&!front.includes("booking_created:true"));
console.log("PASS Jessie email-only demo flow, 3-field opt-in, inline confirmation, Sonny simulation reminder, no in-chat demo, app demo remains public and anonymous owner insights.");
