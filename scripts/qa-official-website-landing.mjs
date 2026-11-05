import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const routes=['public/website-for-your-business/index.html','public/es/website-for-your-business/index.html'];
const photos=['hero-jaramillo','website-la-vie-in-pink','automated-crm','process-choose','process-brand','process-build','process-launch','optional-app'];
const css=readFileSync('public/assets/tle-website-official.css','utf8');
assert.ok(css.includes('max-width:780px'),'phone CTA rules');
assert.ok(css.includes('hero>img'),'hero photo');
for(const p of photos)assert.ok(existsSync('public/assets/website-packages-20261105/'+p+'.svg'),'missing approved photo '+p);
for(const r of routes){
 const html=readFileSync(r,'utf8');
 for(const p of photos)assert.ok(html.includes(p+'.svg'),'missing photo '+p+' at '+r);
 assert.match(html,/id="website-basic"/);
 assert.match(html,/id="website-ai-crm"/);
 assert.match(html,/\$15/);
 assert.match(html,/\$25/);
 assert.match(html,/\/intake\/website\/\?lang=/);
 assert.match(html,/\/intake\/website-ai-crm\/\?lang=/);
 assert.match(html,/\/terms\.html/);
 assert.doesNotMatch(html,/\/service-checkout\//,'do not route to incomplete legacy checkout');
 assert.ok(html.includes('href="#paquetes"'),'package anchor');
 assert.ok(html.includes('href="#proceso"'),'process anchor');
 assert.ok(html.includes('href="#preguntas"'),'FAQ anchor');
}
console.log('[TLE OFFICIAL LANDING] Eight approved images, two prices, bilingual content, safe intake links and responsive CSS validated');
