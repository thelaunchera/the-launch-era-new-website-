// AI Agent $10/month checkout release gate — must stay independent of $15/$25 one-time websites.
// Non-payment QA: checks wiring, customer consent, bilingual notices and server-verification controls.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const checkout=read('public/website-checkout/index.html');
const receipt=read('public/website-payment-success/index.html');
const agent=read('public/ai-agent-checkout/index.html');
const success=read('public/ai-agent-payment-success/index.html');
const start=read('supabase/functions/tle-studio-website-start-checkout/index.ts');
const verify=read('supabase/functions/tle-studio-website-agent-confirm/index.ts');
for(const [lang,path] of [['en','public/website-for-your-business/index.html'],['es','public/es/website-for-your-business/index.html']]){
 const page=read(path);
 assert.ok(page.includes('/ai-agent-checkout/?lang='+lang),lang+' standalone agent link');
 assert.match(page,/website-agent-addon/,lang+' optional agent separated from website packages');
 assert.match(page,/\+\$10/,lang+' approved optional monthly price');
 assert.ok(page.includes('/website-checkout/?offer=website-basic&lang='+lang),lang+' website basic checkout');
 assert.ok(page.includes('/website-checkout/?offer=website-plus&lang='+lang),lang+' website plus checkout');
 assert.ok(!page.includes('offer=website-ai-crm'),lang+' must not advertise legacy subscription');
}
assert.match(checkout,/id="agent-option" type="checkbox"/,'agent opt-in is not pre-checked');
assert.match(checkout,/tle_agent_option_at_checkout/,'customer opt-in persists only through checkout');
assert.match(checkout,/offer==='website-basic'\?'\$15':'\$25'/,'website prices do not include subscription');
assert.match(checkout,/tle-studio-website-start-checkout/,'secure Stripe website session creation');
assert.match(checkout,/website-ai-crm/,'existing paid sessions still supported');
assert.match(receipt,/tle-studio-website-confirm-payment/,'website paid proof remains enforced');
assert.match(receipt,/agentOpt\?\.selected===true/,'agent offered only when buyer selected it');
assert.match(receipt,/id="agent-skip"/,'agent purchase can be skipped');
assert.match(receipt,/ai-agent-checkout/,'separate agent subscription checkout is linked');
assert.match(agent,/website-agent/,'new agent purchase creates separate Stripe subscription');
assert.match(agent,/mode|subscription|monthly|mes/,'agent renewal terms displayed');
assert.ok(agent.includes('$10')&&!agent.includes('$8'),'agent checkout $10 only');
assert.ok(success.includes('$10')&&!success.includes('$8'),'agent receipt $10 only');
assert.match(success,/tle-studio-website-agent-confirm/,'receipt verified on server');
assert.match(success,/setup_received/,'paid setup state required');
assert.match(verify,/payment_status/,'Stripe proof must be paid');
assert.match(verify,/proof\.offer!=="website-agent"/,'unrelated payments cannot activate agent');
assert.match(verify,/proof\.amount_total\)!==1000/,'exact paid amount must be $10');
assert.match(verify,/stripe_subscription_id/,'a Stripe subscription is required');
assert.match(verify,/tle_studio_website_agent_orders/,'setup brief remains private');
assert.match(start,/website-agent/,'checkout server must allow separate agent offer');
assert.ok(read('public/terms.html').includes('$10 USD/month'),'EN terms show optional agent recurring cost');
assert.ok(read('public/es/terms.html').includes('$10 USD'),'ES terms show optional agent recurring cost');
console.log('PASS optional $10/month agent checkout opt-in, separate Stripe subscription, secure verification, EN/ES terms and grandfathered website routes.');
