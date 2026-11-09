import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import {JSDOM} from 'jsdom';

const path='public/experience-cleaning/';
const html=readFileSync(path+'index.html','utf8');
const core=readFileSync(path+'app.js','utf8');
const alpine=readFileSync(path+'alpine-gold-20261108.js','utf8');
const atelier=readFileSync(path+'booking-atelier-20261109.js','utf8');
const css=readFileSync(path+'booking-atelier-20261109.css','utf8');
for(const [name,source] of [['core',core],['alpine',alpine],['atelier',atelier]]){
 new vm.Script(source,{filename:name+'.js'});
}
assert.match(css,/#F6BE28|var\(--clean-gold\)/);
assert.match(css,/#087E9C|var\(--clean-alpine\)/);
assert.match(css,/prefers-reduced-motion/);
assert.match(html,/booking-atelier-20261109\.css/);
assert.match(html,/booking-atelier-20261109\.js/);
for(const id of ['booking-inclusions-list','booking-inline-value','booking-review-total','booking-review-edit-details','booking-review-edit-service','booking-time-help']){
 assert.match(html,new RegExp('id="'+id+'"'),'Missing booking journey component '+id);
}
assert.match(html,/class="booking-review"/);
assert.doesNotMatch(atelier,/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|WebSocket/,'New booking UX must remain local-only');
assert(!html.includes('images.pexels.com'),'Service cards must use repo photos only');
for(const lang of ['en','es']){
 const dom=new JSDOM(html,{runScripts:'outside-only',pretendToBeVisual:true,url:'https://thelaunchera.com/experience-cleaning/?lang='+lang});
 const w=dom.window;
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.matchMedia=()=>({matches:true,addListener(){},removeListener(){}});
 w.eval(core);w.eval(alpine);w.eval(atelier);
 const $=id=>w.document.getElementById(id);
 const settle=()=>new Promise(resolve=>w.requestAnimationFrame(()=>w.requestAnimationFrame(resolve)));
 await settle();
 assert.equal($('booking-inline-value').textContent,'$120');
 assert.match($('booking-inclusions-kicker').textContent,lang==='en'?/EXAMPLE/:/EJEMPLO/);
 assert.equal(w.document.querySelectorAll('.booking-card-price').length,6);
 const deep=w.document.querySelector('[data-service="deep"]');deep.click();await settle();
 assert.equal($('booking-inline-value').textContent,'$187');
 assert.match($('booking-inclusions-title').textContent,lang==='en'?/Deep cleaning/:/Limpieza profunda/);
 $('next').click();await settle();assert.equal($('stage-2').hidden,false);
 $('beds').value='3';$('beds').dispatchEvent(new w.Event('change',{bubbles:true}));
 const oven=w.document.querySelector('.extras input[value="oven"]');oven.checked=true;oven.dispatchEvent(new w.Event('change',{bubbles:true}));
 await settle();assert.equal($('booking-inline-value').textContent,'$237');
 $('next').click();await settle();assert.equal($('stage-3').hidden,false);
 assert.equal($('booking-review-total').textContent,'$237');
 assert.match($('booking-review-service').textContent,lang==='en'?/Deep/:/profunda/);
 assert.equal($('booking-review-date').textContent,$('r-date').textContent);
 assert.equal(w.document.querySelector('.steps .step.is-current')?.dataset.stepLabel,'3');
 assert.equal(w.document.querySelectorAll('.steps .step[aria-current="step"]').length,1);
 $('booking-review-edit-details').click();await settle();
 assert.equal($('stage-2').hidden,false);assert.equal($('beds').value,'3');
 $('next').click();await settle();
 $('booking-review-edit-service').click();await settle();
 assert.equal($('stage-1').hidden,false);
 assert.equal($('booking-inline-value').textContent,'$237');
 w.document.querySelector('.booking-category-tab[data-category="commercial"]').click();await settle();
 assert.equal($('commercial-service-grid').hidden,false);
 assert.equal($('booking-inline-value').dataset.estimate,'true');
 assert.match($('booking-inline-value').textContent,lang==='en'?/Request estimate/:/Solicitar estimado/);
 assert.match($('booking-inclusions-title').textContent,lang==='en'?/Office cleaning/:/Limpieza de oficinas/);
 assert.equal($('owner').hidden,true,'No sample request should be shown as confirmed before final step');
 dom.window.close();
}
console.log('[CLEANING BOOKING ATELIER QA PASSED] EN/ES live pricing, sample scope, step review, edits, no real booking, commercial estimates.');