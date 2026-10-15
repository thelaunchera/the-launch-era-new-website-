import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const widget=readFileSync("public/assets/jessy-site.js","utf8");
const api=readFileSync("supabase/functions/tle-jessie-demo-lead/index.ts","utf8");
const metrics=readFileSync("supabase/functions/tle-jessie-metrics/index.ts","utf8");
assert.ok(widget.includes("business_name:demoBusiness.value.trim()"));
assert.ok(widget.includes("service_area:demoArea.value.trim()"));
assert.ok(widget.includes("email:demoEmail.value.trim()"));
assert.ok(widget.includes("consent:demoConsent.checked"));
assert.ok(widget.includes("data.email_sent!==true"),"Only a provider-confirmed email unlocks the demo and inbox message");
assert.match(widget,/Check your inbox![\s\S]{0,70}my friend Sonny/);
assert.ok(widget.includes('openDemo("booking")'),"Sonny reuses the original booking sample");
assert.ok(api.includes("jessie_demo_sent")&&api.includes('event_type:"email_sent"'));
assert.ok(api.includes("email_followup_enabled:false"),"Demo request cannot enable follow-up subscription");
assert.ok(api.includes("tle-crm-interest?lead="),"Interest requires a separate explicit confirmation");
assert.ok(!/mark.*authorized|email_consent_status:"authorized"/.test(api),"A demo request must not authorize sales follow-ups");
assert.ok(metrics.includes("Owner only")&&metrics.includes("getUser(token)"));
const endpoint="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/";
const headers={"content-type":"application/json",origin:"https://thelaunchera.com"};
const invalid=await fetch(endpoint+"tle-jessie-demo-lead",{method:"POST",headers,
 body:JSON.stringify({business_name:"Synthetic Business",email:"synthetic-do-not-send@example.invalid",service_area:"Test City",consent:false})});
assert.equal(invalid.status,400,"Non-consenting visitor can never trigger demo email");
const unauthorized=await fetch(endpoint+"tle-jessie-metrics",{method:"GET",headers:{origin:"https://thelaunchera.com"}});
assert.equal(unauthorized.status,401,"Anonymous visitors cannot read owner Jessie insights");
const invalidMetric=await fetch(endpoint+"tle-jessie-metrics",{method:"POST",headers,
 body:JSON.stringify({event:"private_transcript",service:"booking",intent:"demo",language:"en"})});
assert.equal(invalidMetric.status,400,"Unknown metrics must be rejected, no transcripts stored");
console.log("PASS Jessie demo asks business/email/area and consent, blocks unsent mail claims, links Sonny & double opt-in, and guards owner analytics.");
