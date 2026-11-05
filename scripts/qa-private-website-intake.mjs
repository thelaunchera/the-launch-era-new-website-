import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const cases=[
 ['website','website-basic'],
 ['website-ai-crm','website-ai-crm']
];
const script=readFileSync('public/assets/tle-website-intake.js','utf8');
const css=readFileSync('public/assets/tle-website-intake.css','utf8');
assert.match(script,/fhrvuhikrybobidxpvnh\.supabase\.co\/functions\/v1\/tle-studio-website-intake/,'must post directly to private Studio project');
assert.doesNotMatch(script,/tle-contact|command\.thelaunchera|\/crm\/|tle_crm_/,'never route new package inquiries to old CRM/Command Center');
assert.match(script,/submission_id/,'must include submission idempotency key');
assert.match(script,/contact_consent/,'consent needed');
assert.match(script,/payload\.goals/,'must capture goals');
assert.match(css,/max-width:550px/,'mobile layout must exist');
execFileSync(process.execPath,['--check','public/assets/tle-website-intake.js'],{stdio:'pipe'});
for(const [slug,pkg] of cases){
 const path='public/intake/'+slug+'/index.html';
 assert.ok(existsSync(path),path+' exists');
 const html=readFileSync(path,'utf8');
 assert.match(html,new RegExp('data-package="'+pkg+'"'),'correct fixed package id');
 assert.match(html,/tle-website-intake\.js/,'shared form submission');
 assert.match(html,/tle-website-intake\.css/,'mobile styles');
 assert.match(html,/name="consent"[^>]*required/,'explicit contact consent');
 assert.match(html,/name="preferred_email"/,'customer email destination');
 assert.match(html,/name="industry"/,'works for every business');
 assert.match(html,/name="customer_action"/,'captures customer intent');
 assert.doesNotMatch(html,/api\/crm|command\.thelaunchera|tle-contact/,'no Command Center routing');
}
console.log('[TLE WEBSITE INTAKES] Both independent package forms, JS syntax, privacy consent and Studio-only routing passed.');
