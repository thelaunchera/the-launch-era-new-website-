/** Editorial booking reference: CSS-only and gated-demo boundary checks. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import postcss from 'postcss';

const stylesheet='public/assets/tle-demo-ink-service-cards.css';
const css=readFileSync(stylesheet,'utf8');
const marker='/* TLE-4 | 2026-10-17';
assert.equal(css.split(marker).length-1,1,'Editorial patch must be unique');
const scoped=css.slice(css.indexOf(marker));
postcss.parse(css,{from:stylesheet});
const rules=postcss.parse(scoped,{from:stylesheet}).nodes.flatMap(
  node=>node.type==='atrule'&&node.nodes?node.nodes:[node]
).filter(x=>x.type==='rule');
assert(rules.length>=30,'Editorial booking implementation missing');
for(const rule of rules){
 assert.match(rule.selector,/#tleDemoCurtainPage #bookingPage/,'Unscoped demo rule: '+rule.selector);
}
for(const token of [
 '#flowTitle::after','.service-flip-front .service',
 '.service-media','.service-copy','.service-title','.service-detail',
 '.service-price','.service-flip-back','.booking-progress',
 '.demo-mini-dot','.field :is(input,select,textarea)',
 '.choice-check input:checked+span','.booking-extras','.primary',
 'prefers-reduced-motion'
]) assert(scoped.includes(token),'Missing design or accessible feature: '+token);
const gate=readFileSync('public/booking-demo-reset.html','utf8');
assert.match(gate,/action:"verify"/);
assert.match(gate,/action:"content"/);
assert.doesNotMatch(gate,/id="bookingPage"/,'Protected demo must stay server-side');
const html=readFileSync('public/lead-private-preview.html','utf8');
assert.match(html,/location\.replace\('\/booking-demo-reset\.html'/);
console.log('PASS: scoped editorial CSS parses; selections, forms, animation and private gate untouched.');
