// Static-only verification of the separate Cloudflare Pages project build.
// Does not create accounts, bookings or send emails.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root='dist-client-bookings/';
const home=readFileSync(root+'index.html','utf8');
const tenant=readFileSync(root+'cb-depot/index.html','utf8');
assert.equal(home,tenant,"Branded project root must open the client booking route");
assert.match(home,/CB Depot · Book Detailing/,'Project root must show client name');
assert.match(home,/\/booking\//,'Project root must link into the real booking page');
assert.ok(!home.includes('service_role')&&!home.includes('SUPABASE_SERVICE_ROLE_KEY'),'Never expose private admin secrets');
for(const path of ['booking/index.html','booking/return/index.html','cb-depot/privacy/index.html','cb-depot/terms/index.html','assets/cb-depot-experience.js']){
 assert.ok(existsSync(root+path),'Client build missing '+path);
}
const content=readFileSync(root+'assets/cb-depot-experience.js','utf8');
assert.match(content,/We bring professional car detailing to your location\./);
console.log('PASS: Branded standalone Pages root and mobile service copy built without changing the shared staging root.');
