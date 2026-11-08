import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const js=fs.readFileSync('public/assets/tle-website-demo-visibility-20261108.js','utf8');
const lib=fs.readFileSync('public/demos/index.html','utf8');
const en=fs.readFileSync('public/website-for-your-business/index.html','utf8');
const es=fs.readFileSync('public/es/website-for-your-business/index.html','utf8');

assert.match(js,/tle_website_demo_visibility\?select=demo_id,visible/);
assert.match(js,/row\.visible===false/);
assert.match(js,/\.hero-gallery-card\[data-demo\]/);
assert.match(js,/owner-experience/);
assert.match(js,/cache:'no-store'/);
assert.match(js,/window\.addEventListener\('pageshow'/);
assert.match(js,/document\.addEventListener\('visibilitychange'/);
assert.match(js,/selection=null;.*Deliberately fail closed/);
for(const [file,html] of [['Library',lib],['English offer',en],['Spanish offer',es]]){
 assert.ok(html.includes('tle-website-demo-visibility-20261108.js?v=2'),file+' must load v2 with cache-busting');
 assert.ok(html.includes('data-tle-demo-status="pending"'),file+' must hide unverified cards while reading data');
}
assert.match(lib,/hiddenPortfolioDemos instanceof Set/);
assert.match(lib,/portfolio\.subscribe\(applyPortfolioSelection\)/);
assert.match(lib,/hiddenPortfolioDemos\.has\(slug\)/);
assert.match(lib,/\.photo-inspiration-images img\[data-demo\]/);
assert.match(en,/data-demo="ivory-and-bloom"/);
assert.match(es,/data-demo="sova"/);
assert.ok(!js.includes('service_role'),'Never send a secret key to visitors');

function testContext(fetcher){
 const sandbox={
  window:{addEventListener(){}},
  document:{querySelector:()=>null,addEventListener(){},visibilityState:'visible'},
  fetch:fetcher,AbortController,setTimeout,clearTimeout,URL,Date,Set,
 };
 vm.runInNewContext(js,sandbox,{filename:'tle-website-demo-visibility-20261108.js'});
 return sandbox.window.TLEWebsiteDemoVisibility;
}
const success=testContext(async()=>({ok:true,json:async()=>[
 {demo_id:'havana-19',visible:false},{demo_id:'casa-brownie',visible:false},
 {demo_id:'sova',visible:true}
]}));
const hidden=await success.ready;
assert.equal(hidden.has('havana-19'),true);
assert.equal(hidden.has('casa-brownie'),true);
assert.equal(hidden.has('sova'),false);
const failure=testContext(async()=>{throw Error('Simulated offline');});
assert.equal(await failure.ready,null,'An unreachable visibility service must never mean show all demos');
const serverError=testContext(async()=>({ok:false,status:503}));
assert.equal(await serverError.ready,null,'HTTP errors must also fail closed');

if(process.argv.includes('--live')){
 const api=js.match(/const api='([^']+)'/)?.[1];
 const key=js.match(/const key='([^']+)'/)?.[1];
 assert.ok(api&&key,'Public read-only endpoint configuration must exist');
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetch(api,{headers:{apikey:key,Origin:'https://thelaunchera.com'},signal:controller.signal,cache:'no-store'});
  assert.equal(response.status,200,'Public portfolio API must respond to anonymous visitors');
  const allow=response.headers.get('access-control-allow-origin');
  assert.ok(allow==='*'||allow==='https://thelaunchera.com','The website origin must be CORS-authorized: '+allow);
  const rows=await response.json();
  assert.ok(Array.isArray(rows),'Public selection should be a JSON array');
  for(const row of rows){
   assert.match(row.demo_id,/^[a-z0-9][a-z0-9-]{0,79}$/);
   assert.equal(typeof row.visible,'boolean');
  }
  console.log('LIVE public selection API accessible; '+rows.length+' visibility overrides read successfully.');
 }finally{clearTimeout(timeout);}
}
console.log('Website of Websites selection checks OK: owner data, browser gating, offline safety, bilingual routes.');
