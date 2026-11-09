/* Visual-only depth layer regression for The Launch Era demos.
   No real bookings, payments, or customer data. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const owner=readFileSync('public/demos/owner-center/index.html','utf8');
const gallery=readFileSync('public/demos/index.html','utf8');
const en=readFileSync('public/website-for-your-business/index.html','utf8');
const es=readFileSync('public/es/website-for-your-business/index.html','utf8');
const path='public/assets/tle-demo-depth-20261108.css';
assert.ok(existsSync(path),'Shared depth styles must exist');
const css=readFileSync(path,'utf8');
assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length,'Stylesheet braces must balance');
for(const [name,html] of Object.entries({owner,gallery,en,es})){
 assert.match(html,/\/assets\/tle-demo-depth-20261108\.css\?v=1/,'New visual layer must load on '+name);
}
assert.match(owner,/<body class="tle-depth-owner">/);
assert.match(gallery,/<body class="tle-depth-gallery">/);
for(const token of ['.demo-card{','.product-card{','.preview-card{','.phone{','.kpi{','.owner-admin-visual{','.owner-customer-frame{']){
 assert.ok(css.includes(token),'Missing tactile treatment for '+token);
}
assert.match(css,/@media\(max-width:740px\)/,'Mobile layout must be handled');
assert.match(css, /prefers-reduced-motion:reduce/,'Reduced motion must be supported');
assert.match(css,/body\.tle-depth-owner \.product-actions \.text-button\{[\s\S]*?min-height:44px/,'Edit buttons remain touch accessible');
assert.match(css,/body\.tle-depth-gallery \.demo-art\{[\s\S]*?border-radius:/,'Original photography must retain soft corners');
assert.doesNotMatch(css,/https?:\/\/|@import|display:none!important/,'Visual layer must not call external resources or hide interactive controls');
assert.equal([...gallery.matchAll(/<article\b[^>]*data-brand="([^"]+)"[^>]*>[\s\S]*?<\/article>/g)].length,19);
assert.equal([...owner.matchAll(/^ "([a-z0-9-]+)":\{name:/gm)].length,13);
assert.match(owner,/localStorage\.setItem\(key\(\),JSON\.stringify\(items\)\)/);
assert.doesNotMatch(owner,/\bfetch\s*\(/);
console.log('PASS: card depth, original 19 gallery concepts, 13 local owner demos, accessible controls, bilingual source and no network side effects');
