/** Outcome-first website offer: bilingual, accessible, browser-only demonstration.
 * This QA never submits a payment, email, or CRM request.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const read=p=>readFileSync(p,'utf8');
const css=read('public/assets/tle-outcome-journey-20261109.css');
const js=read('public/assets/tle-outcome-journey-20261109.js');
execFileSync(process.execPath,['--check','public/assets/tle-outcome-journey-20261109.js']);
assert.match(css,/@media\(max-width:460px\)/,'phone layout');
assert.match(css,/min-height:48px/,'touch targets');
assert.match(css,/:focus-visible/,'keyboard focus');
assert.match(css,/prefers-reduced-motion/,'reduced motion');
assert.doesNotMatch(js,/\bfetch\s*\(|\bXMLHttpRequest\b|\blocalStorage\b|\bsessionStorage\b|\bsendBeacon\s*\(/,'preview must never send/store data');
for(const [lang,path] of [['en','public/website-for-your-business/index.html'],['es','public/es/website-for-your-business/index.html']]){
 const html=read(path);
 assert.match(html,new RegExp('data-tle-outcome-demo data-lang="'+lang+'"'),'bilingual demo marker');
 assert.equal((html.match(/data-tle-outcome-demo/g)||[]).length,1,'never duplicate the interactive journey or Command Center preview');
 assert.doesNotMatch(html,/offer=website-ai-crm/,'retired AI subscription must never appear in current public sales');
 assert.match(html,/\/assets\/tle-outcome-journey-20261109\.css/,'demo styles');
 assert.match(html,/\/assets\/tle-outcome-journey-20261109\.js/,'demo interaction');
 assert.match(html,/data-outcome-form/,'working sample request');
 assert.match(html,/data-outcome-reset/,'reset function');
 assert.match(html,/data-outcome-owner-title/,'owner result');
 assert.match(html,/data-outcome-receipt-text/,'email acknowledgment preview');
 assert.match(html,/data-preview-state="idle"/,'safe initial state');
 assert.match(html,/\$15/,'basic website price');
 assert.match(html,/\$25/,'Website Plus price');
 assert.match(html,lang==='en'?/AI AGENT · \$10\/MONTH/:/AGENTE IA OPCIONAL · \$10\/MES/,'optional agent price clearly outside packages');
 const section=html.match(/<article class="plan" id="website-plus">([\s\S]*?)<\/article>/)?.[1];
 assert.ok(section,'plus package must exist');
 assert.doesNotMatch(section,/\$10|AI agent|Agente IA|agente IA|agent subscription/i,'AI must not be bundled with $25');
 const demo=html.match(/<section class="tle-outcome"([\s\S]*?)<\/section>/)?.[1];
 assert.ok(demo,'one integrated commercial preview must exist');
 assert.equal((demo.match(/class="tle-outcome-card"/g)||[]).length,3,'exactly three journey steps');
 assert.match(demo,lang==='en'?/Nothing is submitted, emailed or saved/:/No se envían ni guardan mensajes/,'no simulated backend claims');
 const htmlBefore=html.slice(0,html.indexOf('<section class="pricing"'));
 assert.ok(htmlBefore.includes('data-tle-outcome-demo'),'show the benefit before packages');
 assert.match(html,/\/website-checkout\/\?offer=website-plus&lang=/,'existing verified checkout preserved');
}
console.log('PASS: bilingual 3-step outcome journey, visible independent $10/month agent, 48px mobile controls and no backend or checkout changes');
