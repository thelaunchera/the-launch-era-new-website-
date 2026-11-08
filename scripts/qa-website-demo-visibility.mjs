import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const js=fs.readFileSync('public/assets/tle-website-demo-visibility-20261108.js','utf8');
const lib=fs.readFileSync('public/demos/index.html','utf8');
const en=fs.readFileSync('public/website-for-your-business/index.html','utf8');
const es=fs.readFileSync('public/es/website-for-your-business/index.html','utf8');

assert.match(js,/tle_website_demo_visibility\?select=demo_id,visible/);
assert.match(js,/\.visible===false/);
assert.match(js,/\.hero-gallery-card\[data-demo\]/);
assert.match(js,/owner-experience/);
for(const [file,html] of [['Library',lib],['English offer',en],['Spanish offer',es]]){
 assert.ok(html.includes('tle-website-demo-visibility-20261108.js'),file+' must load the shared public selection');
}
assert.match(lib,/hiddenPortfolioDemos\.has\(card\.dataset\.brand\)/);
assert.match(lib,/hiddenPortfolioDemos\.has\(slug\)/);
assert.match(lib,/selectionReady\.then/);
assert.match(lib,/shown\.length/);
assert.match(en,/data-demo="ivory-and-bloom"/);
assert.match(es,/data-demo="sova"/);
assert.ok(!js.includes('service_role'),'Never send a secret key to visitors');

const sandbox={
 window:{},
 document:{querySelector:()=>null},
 fetch:async()=>({ok:true,json:async()=>[
  {demo_id:'sova',visible:false},{demo_id:'golden-grid',visible:true}
 ]}),
 AbortController,setTimeout,clearTimeout,URL,
};
vm.runInNewContext(js,sandbox,{filename:'tle-website-demo-visibility-20261108.js'});
const hidden=await sandbox.window.TLEWebsiteDemoVisibility.ready;
assert.equal(hidden.has('sova'),true);
assert.equal(hidden.has('golden-grid'),false);

console.log('Website of Websites owner selection: static routes, shared script and public selection behavior OK.');
