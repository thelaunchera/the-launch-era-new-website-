/** Public cleaning route regression after the standalone Cleaning App retirement.
 * Keep the removed route safe, and test the active Experience Cleaning booking demo instead.
 * No network calls, account access, submissions, or customer data. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
import vm from 'node:vm';

const redirect=readFileSync('public/cleaning-app-demo/index.html','utf8');
assert.match(redirect,/location\.replace/,'Retired app route should redirect visitors');
assert.match(redirect,/\/website-for-your-business\//,'Retired route must lead to website services');
assert.doesNotMatch(redirect,/Cleaning App \| Interactive Preview/,'Retired app workspace must not reappear');
assert(!existsSync('src/components/cleaning-app-showcase.tsx'),'Retired standalone app showcase must remain removed');

const html=readFileSync('public/experience-cleaning/index.html','utf8');
const js=readFileSync('public/experience-cleaning/app.js','utf8');
new vm.Script(js,{filename:'experience-cleaning/app.js'});
assert.match(html,/id="experience"/);
assert.match(html,/id="service-grid"/);
assert.match(html,/id="commercial-service-grid"/);
assert.match(html,/id="booking-visual-image"/);
assert.match(html,/id="booking-visual-title"/);
assert.match(html,/booking-progress-line/);
assert.match(html,/alpine-gold-20261108\.css/);
for(const asset of [
 '/experience-cleaning/photos/portfolio_living_finished.webp',
 '/experience-cleaning/photos/portfolio_cleaning_action.webp',
 '/assets/lead-demo/spotless-office.png',
 '/assets/clara-private-demo/commercial-home-office.webp'
])assert(existsSync('public'+asset),'Local service image missing: '+asset);

for(const lang of ['en','es']){
 const errors=[];
 const virtualConsole=new VirtualConsole();
 virtualConsole.on('jsdomError',err=>errors.push(err.message));
 const dom=new JSDOM(html,{url:'https://thelaunchera.com/experience-cleaning/?lang='+lang,runScripts:'outside-only',virtualConsole,pretendToBeVisual:true});
 const window=dom.window;
 window.matchMedia=()=>({matches:true,addListener(){},removeListener(){}});
 window.HTMLElement.prototype.scrollIntoView=function(){};
 window.eval(js);
 const doc=window.document;
 assert.equal(doc.documentElement.lang,lang);
 assert.equal(doc.querySelector('#owner').hidden,true);
 assert.equal(doc.querySelector('#stage-1').hidden,false);
 const deep=doc.querySelector('[data-service="deep"]');
 deep.click();
 assert.equal(doc.querySelector('#r-price').textContent,'$187');
 doc.querySelector('#next').click();
 assert.equal(doc.querySelector('#stage-2').hidden,false);
 doc.querySelector('#restart').click();
 assert.equal(doc.querySelector('#stage-1').hidden,false);
 const commercial=doc.querySelector('[data-category="commercial"]');
 commercial.click();
 assert.equal(doc.querySelector('#commercial-service-grid').hidden,false);
 assert.equal(doc.querySelector('#service-grid').hidden,true);
 assert.equal(doc.querySelector('#owner').hidden,true);
 assert.deepEqual(errors,[],'Public demo scripts should render without runtime errors');
 window.close();
}
console.log('[PUBLIC CLEANING DEMO QA PASSED] Retired app redirect; active bilingual residential/commercial booking preview with approved local photos.');
