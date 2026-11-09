import {readFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {join} from 'node:path';
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=join(dir,e.name);return e.isDirectory()?walk(p):/\.(html|css|js|ts|tsx)$/.test(e.name)?[p]:[]})}
const roots=['public/demos','demo-source','brand-board-studio/src'];

/* Public HTML and shared scripts must not revive the retired green decorative symbol. */
const retiredGreenSymbols=/[✳✱❇🟩🟢✅💚]/u;
for(const file of walk('public').filter(path=>path.endsWith('.html'))){
 assert(!retiredGreenSymbols.test(readFileSync(file,'utf8')),'Retired green symbol in public page '+file);
}
for(const dir of ['public/assets','public/command-center/assets']){
 for(const file of walk(dir).filter(path=>path.endsWith('.js')&&!path.includes('/vendor/'))){
  assert(!retiredGreenSymbols.test(readFileSync(file,'utf8')),'Retired green symbol in shared script '+file);
 }
}

for(const root of roots)for(const p of walk(root))assert(!/[✳✱❇🟩🟢✅💚✨📩]/u.test(readFileSync(p,'utf8')),'Unwanted green decorative symbol in '+p);
for(const p of walk('public/demos')) if(/\.(html|js)$/.test(p))assert(!/[↗↑↓]/.test(readFileSync(p,'utf8')),'Decorative arrow remains in '+p);
const authored=readFileSync('demo-source/la-vie-in-pink/src/App.tsx','utf8');
assert(!/(ArrowDown|ArrowUpRight|ArrowLeft|ArrowRight)/.test(authored),'La Vie decorative arrow component in editable source');
assert(!readFileSync('public/demos/la-vie-in-pink/assets/index-BnbJ7qEi.js','utf8').includes('✳'),'La Vie published React bundle still has emoji');
const scoped=readFileSync('public/demos/la-vie-in-pink/editorial-refinement-20261105.css','utf8');
assert(scoped.includes('.site-shell .product-meta .product-view-button'),'Text-labeled product action CSS missing');
assert(!readFileSync('public/demos/la-vie-in-pink/assets/index-BnbJ7qEi.js','utf8').includes('className:"product-overlay-arrow"'),'Duplicate arrow overlay still in compiled product');
assert(authored.includes("'Ver' : 'View'"),'Localized product action missing');
for(const path of ['public/demos/la-vie-in-pink/index.html','public/demos/marea-wigs-miami/index.html','public/demos/lavender-edit/index.html','public/demos/havana-19/index.html']){const text=readFileSync(path,'utf8');assert(/<body|<main/.test(text),'Missing published entry point '+path)}
console.log('PASS: no green decorative emoji in published demos or relevant sources; nonfunctional arrows removed');

const liveBundle=readFileSync('public/demos/la-vie-in-pink/assets/index-BnbJ7qEi.js','utf8');
assert(!liveBundle.includes('children:"·"')&&!liveBundle.includes('·   BONJOUR'),'Substitute decorative dots remain');
assert(liveBundle.includes('O==="es"?"Ver":"View"'),'Compiled bilingual view control missing');

import {execFileSync} from 'node:child_process';
for(const path of ['public/demos/la-vie-in-pink/assets/index-BnbJ7qEi.js','public/demos/marea-wigs-miami/assets/index-CxF6j5zA.js'])execFileSync(process.execPath,['--check',path],{stdio:'pipe'});
for(const [path,asset] of [['public/demos/la-vie-in-pink/index.html','cafe-boutique-20261108.js?v=localwebp1'],['public/demos/marea-wigs-miami/index.html','index-CxF6j5zA.js?v=20261107clean']])assert(readFileSync(path,'utf8').includes(asset),'Updated bundle must bypass old phone cache: '+path);
console.log('PASS: published compiled JS syntax and cache-busting links');
