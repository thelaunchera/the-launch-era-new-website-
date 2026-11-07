import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const files=[
 'demo-source/la-vie-in-pink/src/App.tsx',
 'public/demos/la-vie-in-pink/assets/index-BnbJ7qEi.js',
 'public/demos/lavender-edit/index.html',
 'public/demos/havana-19/index.html',
 'public/demos/umbral/app.js',
 'public/demos/angela-so-fresh-clean-queen/index.html',
 'public/demos/claudia/index.html',
 'public/demos/ivory-and-bloom/index.html',
 'demo-source/marea-wigs-miami/src/main.ts',
 'public/demos/marea-wigs-miami/assets/index-CxF6j5zA.js'
];
for(const file of files){
 const src=readFileSync(file,'utf8');
 assert(!/[✳✨📩]/u.test(src),file+' has a decorative emoji');
 if(/(lavender-edit|havana-19|umbral|ivory-and-bloom)/.test(file))
  assert(!/[↗↑↓]/u.test(src),file+' has a decorative typographic arrow');
}
const source=readFileSync(files[0],'utf8'),bundle=readFileSync(files[1],'utf8');
const scoped=readFileSync('public/demos/la-vie-in-pink/hero-art-direction-20261107.css','utf8');
assert(source.includes("'Ver' : 'View'"),'Source localised view action missing');
assert(bundle.includes('O==="es"?"Ver":"View"'),'Bundled view action missing');
assert(source.includes('navigate(\'home\', \'collection\')'),'Source collection CTA missing');
assert(bundle.includes('onClick:()=>_("product/"+B.id)'),'Bundled product navigation missing');
assert(scoped.includes('.product-view-button')&&scoped.includes('.hero-bottom svg'),'Decorative CSS incomplete');
assert(readFileSync('public/demos/havana-19/index.html','utf8').includes('href="#story"'),'Havana story action missing');
assert(readFileSync('public/demos/lavender-edit/index.html','utf8').includes('href="#ritual"'),'Lavender hero action missing');
console.log('PASS: no distracting emoji or decorative arrows; product and section actions retained');
