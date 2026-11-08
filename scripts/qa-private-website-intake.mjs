import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const cases=[
 ['website','website-basic'],
 ['website-ai-crm','website-ai-crm']
];
const script=readFileSync('public/assets/tle-website-intake.js','utf8');
const css=readFileSync('public/assets/tle-website-intake.css','utf8');
assert.match(script,/fhrvuhikrybobidxpvnh\.supabase\.co\/functions\/v1\//,'must route to the private Studio project');
assert.match(script,/tle-studio-website-intake/,'must submit paid intake to Studio only');
assert.match(script,/tle-studio-website-upload-photo/,'paid photos must upload to private Studio assets');
assert.doesNotMatch(script,/tle-contact|command\.thelaunchera|\/crm\/|tle_crm_/,'never route new package inquiries to old CRM/Command Center');
assert.match(script,/submission_id/,'must include submission idempotency key');
assert.match(script,/contact_consent/,'consent needed');
assert.match(script,/note\('Services\/products'/,'must preserve business services in project goals');
assert.match(script,/const goals=/,'must capture website goals');
assert.match(script,/checkout_reference:session/,'must link paid session to intake');
assert.match(script,/if\(!paid\|\|submit\.disabled/,'must require payment proof before submission');
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
 assert.match(html,/name="website_photos"/,'uploads selected website photos');
 assert.match(html,/name="reference_photos"/,'uploads inspiration images');
 assert.match(html,/name="domain_option"/,'supports clients without a domain');
 assert.match(html,/name="request_call"/,'optional 1:1 request');
 assert.match(html,/name="ai_photo_request"/,'photo enhancement request visible in both offers');
 assert.match(html,/demos\/photo-gallery/,'buyers can browse actual examples');
 assert.doesNotMatch(html,/api\/crm|command\.thelaunchera|tle-contact/,'no Command Center routing');
}

// AI PHOTO SHOWCASE QA — opt-in remains optional in both paid packages, but is retained in Studio.
const photoBrief=readFileSync('public/assets/tle-website-intake-brief.js','utf8');
execFileSync(process.execPath,['--check','public/assets/tle-website-intake-brief.js'],{stdio:'pipe'});
assert.match(photoBrief,/aiPhotoQuestion:/,'AI photo opt-in must be bilingual');
assert.match(photoBrief,/updatePhotoChoice/,'AI photo details should only appear when requested');
assert.match(script,/note\('AI-enhanced photo request'/,'AI photo request must be preserved in project goals');
assert.match(script,/note\('Preferred photo look'/,'selected look must reach private Studio notes');
const curated=readFileSync('public/demos/photo-gallery/index.html','utf8');
const found=[...curated.matchAll(/\["(?:FD|BK|PR|BT|CL|SV)-\d{2}"/g)];
assert.equal(found.length,24,'publish exactly 24 real individually listed photo references');
for(const image of [...curated.matchAll(/"(\/(?:demos|experience-cleaning)\/[^"]+\.(?:png|webp|jpg|jpeg))"/g)]){
 assert.ok(existsSync('public'+image[1]),'curated image source missing '+image[1]);
}
console.log('[TLE WEBSITE INTAKES] Both payment-gated project setups, private photo uploads, optional call and Studio-only routing passed.');
