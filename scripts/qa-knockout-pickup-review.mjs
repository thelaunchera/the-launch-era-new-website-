import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Inspect the published output, not just source, so CSS order/route are protected.
const root=path.resolve(process.argv[2]||'.output/public/demos/knockout-deli');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const menu=read('menu.html');
const css=read('pickup-review.css');
const order=read('window-order.js');

assert(menu.includes('pickup-review.css?v=20261113-receipt-contrast-v1'),'Updated review stylesheet missing from digital menu');
assert(menu.indexOf('pickup-review.css')>menu.indexOf('menu-redesign.css'),'Review fixes must load after menu styles');
assert(!read('index.html').includes('pickup-review.css'),'Do not change the separate marketing website');
assert(css.startsWith('/* Knockout Deli — Step 3 pickup review'),'Missing review-specific stylesheet');
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'Review CSS block mismatch');

for(const selector of [
  '#window-review-slip.window-review-slip',
  '.preview-lines > li',
  '.preview-facts > p',
  '.preview-facts p > span',
  '.preview-facts p > strong',
  '.window-slip-total',
  '.preview-warning',
  '.preview-activation',
  '.preview-submit-disabled',
  '.preview-actions #pickup-edit.button-outline',
  '.preview-actions #pickup-done.button-red',
  '@media(max-width:600px)'
])assert(css.includes(selector),'Missing visible review component style: '+selector);

assert(css.includes('grid-template-columns:minmax(0,1fr)')&&css.includes('display:block'),'Mobile label/value separation must remain visible');
assert(css.includes('-webkit-text-fill-color:#24201f!important'),'Outlined Edit Pickup text must be visible on iOS');
assert(css.includes('background:#fffdfa!important')&&css.includes('background:#bd2630!important'),'Review action buttons need strong contrast');
assert(css.includes('opacity:1!important')&&css.includes('visibility:visible!important'),'iOS buttons must not fade away');
assert(!css.includes('pointer-events:none'),'Active Edit Pickup / Back to Menu must stay clickable');
assert(order.includes('id="pickup-edit"')&&order.includes('id="pickup-done"'),'Both review buttons must remain functional');
assert(order.includes('id="window-review-slip"')===false,'Review must render into the existing dialog only');
assert(order.includes('preview-submit-disabled')&&order.includes('disabled aria-disabled="true"'),'Never activate demo send-to-truck button');
assert(order.includes('This is a design preview, not an order receipt or confirmation.'),'Keep the non-live order disclosure');
assert(menu.includes('id="window-review-slip"'),'Existing pickup review target missing');

console.log('PASS: Knockout Deli pickup preview contrast, readable facts, buttons, mobile layout and non-live safety');