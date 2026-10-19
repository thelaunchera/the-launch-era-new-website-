/* Read-only release guard for staged private Booking Demo enhancement. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const js=fs.readFileSync('public/assets/tle-private-demo-conversion.js','utf8');
const css=fs.readFileSync('public/assets/tle-private-demo-conversion.css','utf8');
const photos=fs.readFileSync('scripts/build_demo_photo_assets.py','utf8');
const code='js '+js+' css '+css;
assert.match(js,/document\.getElementById\('customerView'\)/);
assert.match(js,/document\.getElementById\('ownerView'\)/);
assert.match(js,/document\.getElementById\('try'\)/);
assert.match(js,/document\.querySelector\('section\.closing'\)/);
assert.match(js,/https:\/\/thelaunchera\.com\/booking-lead-automation/);
assert.match(js,/tle-compare-range/);
assert.match(js,/tle-business-name/);
assert.match(js,/replaceWith\(a\)/);
assert.doesNotMatch(js,/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|form\.submit\s*\(/);
assert.doesNotMatch(code,/service_role|anon[_-]?key|supabase\.co\/functions\/v1|<html/);
for(const id of ['1S6jtvi5zjF_406RSvYqmKWWIu5IZwpmG','1D56-v3lVV6FpBqW3FqYH442kiPVvjlLT','1a7BDMhN69nn3JU1eaq3HhxepR0fVGOF0','1OWiVlmtTiDOs6ZYDyEOzo6bG8LAd915d'])assert.ok(photos.includes(id));
console.log('PASS: private demo enhancement is gated by DOM, data-write-free, contains sale CTA and approved Drive asset IDs.');
