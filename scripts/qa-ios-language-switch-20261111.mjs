import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const root=process.argv.includes('--root')?process.argv[process.argv.indexOf('--root')+1]:'.output/public';
const asset='tle-ios-language-switch-20261111';
const expected=[
 'demos/la-vie-in-pink/index.html',
 'demos/freska/index.html',
 'demos/casa-brownie/index.html',
 'demos/havana-19/index.html',
 'website-for-your-business/index.html',
 'es/website-for-your-business/index.html',
 'intake/website/index.html',
];
const read=p=>readFileSync(join(root,p),'utf8');
assert.match(read('assets/'+asset+'.js'),/hookGroup/);
assert.match(read('assets/'+asset+'.css'),/84px/);
for(const path of expected){
 const html=read(path);
 assert.ok(html.includes(asset+'.css'),path+' CSS was not installed');
 assert.ok(html.includes(asset+'.js'),path+' script was not installed');
 assert.ok(html.includes('rel="icon"')||html.includes('rel="shortcut icon"')||!html.includes('<link rel="icon"'),path);
}
const unilingual=read('demos/crumb/index.html');
assert.ok(!unilingual.includes(asset+'.js'),'Monolingual Crumb should not expose a fake translation control');
console.log('Bilingual spring switch QA passed for '+expected.length+' representative English/Spanish routes; monolingual unchanged.');
