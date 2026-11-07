import {readFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {join} from 'node:path';
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=join(dir,e.name);return e.isDirectory()?walk(p):/\.(html|css|js|ts|tsx)$/.test(e.name)?[p]:[]})}
const roots=['public/demos','demo-source/la-vie-in-pink/src','demo-source/marea-wigs-miami/src'];
for(const root of roots)for(const p of walk(root))assert(!/[✳✱❇🟩🟢]/u.test(readFileSync(p,'utf8')),'Green decorative emoji in '+p);
for(const path of ['public/demos/lavender-edit/index.html','public/demos/havana-19/index.html','public/demos/ivory-and-bloom/index.html','public/demos/umbral/app.js'])assert(!/[↗↑↓]/.test(readFileSync(path,'utf8')),'Decorative arrow remains in '+path);
const authored=readFileSync('demo-source/la-vie-in-pink/src/App.tsx','utf8');
assert(!authored.includes('ArrowDown'),'La Vie hero scroll arrow still present in authored source');
assert(!readFileSync('public/demos/la-vie-in-pink/assets/index-BnbJ7qEi.js','utf8').includes('✳'),'La Vie published React bundle still has emoji');
const scoped=readFileSync('public/demos/la-vie-in-pink/editorial-refinement-20261105.css','utf8');
assert(scoped.includes('.site-shell .hero-bottom>svg'),'La Vie static published bundle decorative arrow must be hidden');
for(const path of ['public/demos/la-vie-in-pink/index.html','public/demos/marea-wigs-miami/index.html','public/demos/lavender-edit/index.html','public/demos/havana-19/index.html']){const text=readFileSync(path,'utf8');assert(/<body|<main/.test(text),'Missing published entry point '+path)}
console.log('PASS: no green decorative emoji in published demos or relevant sources; nonfunctional arrows removed');
