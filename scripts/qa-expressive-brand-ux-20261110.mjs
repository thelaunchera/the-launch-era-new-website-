import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const sheet='/assets/tle-expressive-brand-ux-20261110.css?v=1';
const css=read('public/assets/tle-expressive-brand-ux-20261110.css');
const brands=['la-vie-in-pink','havana-19','casa-brownie','golden-grid','sneekiefs','sova'];

for(const slug of brands){
  const html=read('public/demos/'+slug+'/index.html');
  assert.match(html,new RegExp('data-tle-one-motion="'+slug+'"'),slug+' existing brand identity retained');
  assert.equal(html.split(sheet).length-1,1,slug+' sheet included exactly once');
  assert.ok(html.indexOf(sheet)<html.indexOf('</head>'),slug+' style loaded in head');
  assert.ok(css.includes('html[data-tle-one-motion="'+slug+'"]'),slug+' has its own theme');
}
assert.match(css,/prefers-reduced-motion:\s*reduce/,'reduced-motion support');
assert.match(css,/:focus-visible/,'keyboard focus visible');
const rules=css.replace(/\/\*[\s\S]*?\*\//g,'');
assert.doesNotMatch(rules,/(?:[.#]canvas(?:\b|[-_])|checkout|booking|cart-drawer|modal-root|#app)/i,
  'expressive layer cannot touch editing, checkout or booking UI');
assert.equal((rules.match(/!important/g)||[]).length,2,'force motion off only in accessibility override');
const open=(css.match(/{/g)||[]).length,close=(css.match(/}/g)||[]).length;
assert.equal(open,close,'CSS bracket balance');
console.log('Expressive design QA passed for '+brands.length+' existing demos.');
