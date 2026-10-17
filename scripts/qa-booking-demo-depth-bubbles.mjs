/** TLE private Booking Demo: depth bubbles are visual only and pause off-screen.
 * This never requests customer codes, logs private requests, or submits a booking.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import postcss from 'postcss';
const read=name=>fs.readFileSync(name,'utf8');
const script='public/assets/tle-demo-horizontal-story.js';
const style='public/assets/tle-demo-ink-service-cards.css';
const js=read(script),css=read(style);
execFileSync(process.execPath,['--check',script],{stdio:'pipe'});
postcss.parse(css,{from:style});
assert.equal(js.split('TLE BUBBLE DRIFT V1').length-1,1,'One canvas initializer only');
assert.equal(css.split('TLE BUBBLE DRIFT V1').length-1,1,'One CSS theme only');
for(const token of [
 'bookingBubbleStory','bookingPage','requestAnimationFrame',
 'cancelAnimationFrame','ResizeObserver','IntersectionObserver',
 'visibilitychange','prefers-reduced-motion','Math.min(2,window.devicePixelRatio',
 'Math.min((now-last)/1000,.05)','pointer-events:none'
])assert(js.includes(token)||css.includes(token),token+' needs implementation');
assert(js.includes("const count=window.innerWidth<=600?"),'Mobile particle budget required');
assert(js.includes("canvas.setAttribute('aria-hidden','true')"),'Decorative canvas must be hidden');
assert(css.includes('has-depth-bubble-canvas .booking-bubble-layer'),'Remove old CSS bubbles only if canvas exists');
assert(css.includes('has-depth-bubble-canvas .custom::before'),'Retire competing CSS bubble pseudo-elements');
assert(!js.includes('fetch(')&&!js.includes('form.submit'),'Background may not make network or booking requests');
const privatePage=read('public/booking-demo-reset.html');
assert.match(privatePage,/action:"verify"/);
assert.match(privatePage,/action:"request"/);
assert.doesNotMatch(privatePage,/id="bookingPage"/,'Protected content stays on private server');
assert.match(css,/#tleDemoCurtainPage #bookingBubbleStory/);
assert.match(css,/#tleDemoCurtainPage #bookingPage/);
console.log('PASS: responsive canvas bubble drift, privacy, reduced motion, deep-blue cards and private gate contracts');
