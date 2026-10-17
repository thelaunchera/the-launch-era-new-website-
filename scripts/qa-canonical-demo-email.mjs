/** No-send fixture: Jessie Booking Automation email must lead into authorization, not expose the demo URL. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
const api=readFileSync('supabase/functions/tle-jessie-demo-lead/index.ts','utf8');
const website=readFileSync('public/assets/jessy-site.js','utf8');
const source=stripTypeScriptTypes(api,{mode:'strip'});
const start=source.indexOf('function emailHtml('),end=source.indexOf('\nasync function rateLimit(',start);
assert(start>=0&&end>start,'Jessie email renderer is available');
const ctx={URLSearchParams};vm.createContext(ctx);
vm.runInContext('function escapeHtml(v){return v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}\n'+source.slice(start,end),ctx);
for(const lang of ['en','es']){
 const business='QA Fixture & Co',area='Example service area';
 const legacy='https://thelaunchera.com/lead-private-preview.html?business=Fake';
 const interest='https://example.invalid/interest?lead=synthetic';
 const html=ctx.emailHtml(business,area,{name:'Booking Automation',url:legacy},interest,lang);
 const links=[...html.matchAll(/<a href="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(links.length,1,'Jessie first email may only contain the interest confirmation CTA');
 assert.equal(links[0],interest,'Email must not include demo before authorization');
 assert(!html.includes(legacy),'Original direct-demo URL must not appear');
 assert(html.includes(lang==='es'?'Me interesa':"I'm Interested"));
 assert(html.includes(lang==='es'?'primero confirma tu interés':'first confirm your interest'));
 assert(html.includes('QA Fixture &amp; Co'),'Always escape lead-entered company names');
 assert(!/pages\.dev|workers\.dev|cloudflare/i.test(html),'Do not include a third-party sample demo URL');
}
assert(api.includes('Idempotency-Key'),'Preserve send idempotency');
assert(api.includes('email_followup_enabled:false'),'Do not enable campaigns on first email');
assert(api.includes('tle-crm-interest'),'Use the existing two-step confirmed-interest endpoint');
assert(!api.includes('demoUrl'),'Never send a raw Booking Demo direct URL');
const front=readFileSync('public/lead-private-preview.html','utf8');
const gate=readFileSync('public/booking-demo-reset.html','utf8');
assert(front.includes("location.replace('/booking-demo-reset.html'+location.search+location.hash)"));
assert(front.includes("p.has('key')||p.get('owner_preview')==='1'"),'Do not interrupt keyed buyer pages');
assert(gate.includes('tle-booking-demo-gate'),'Unkeyed lead previews require server authorization');
assert(gate.includes('Email my access code'),'Users must confirm ownership of their approved demo email');
assert(website.includes('Sonny está dentro del demo'),'Jessie public capabilities are unchanged');
console.log('PASS: EN/ES one-step invitation -> Interested confirmation -> private Booking Demo OTP. No real mail sent.');
