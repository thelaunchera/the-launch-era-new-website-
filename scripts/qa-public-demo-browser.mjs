/** The former public Cleaning App is retired; verify its URL cannot show an obsolete workspace. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('public/cleaning-app-demo/index.html','utf8');
assert.match(source,/<title>The Launch Era — Website Services<\/title>/);
assert.match(source,/<meta name="robots" content="noindex,nofollow">/);
assert.doesNotMatch(source,/id="nav"|id="app"|sample workspace|Cleaning App \| Interactive Preview/i,
  'No retired app controls or claims should remain');
const js=source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(js,'Retired route must include a short redirect');
new vm.Script(js,{filename:'cleaning-app-retirement.js'});
for(const lang of ['en','es']){
  const navigations=[];
  vm.runInNewContext(js,{URLSearchParams,location:{
    search:'?lang='+lang,replace:(url)=>navigations.push(url)
  }},{timeout:1000});
  assert.deepEqual(navigations,[lang==='es'?'/es/website-for-your-business/':'/website-for-your-business/'],
    'Retired URL must redirect to the active bilingual website');
}
assert.match(source,/href="\/website-for-your-business\//,
  'Accessible fallback link should work even without JavaScript');
console.log('[PUBLIC DEMO RETIREMENT QA PASSED] Old Cleaning App safely redirects EN/ES with no obsolete controls.');
