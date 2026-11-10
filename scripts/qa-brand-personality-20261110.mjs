/* TLE brand personality release gate.
   Static: node scripts/qa-brand-personality-20261110.mjs
   Browser: QA_URL=http://127.0.0.1:4193 node scripts/qa-brand-personality-20261110.mjs --browser
*/
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const brands=['sova','sneekiefs','casa-brownie','havana-19','la-vie-in-pink','golden-grid'];
const css=read('public/assets/tle-brand-personality-20261110.css');
const script=read('public/demos/sova/sova-listening-mode-20261110.js');
for(const slug of brands) {
  const html=read('public/demos/'+slug+'/index.html');
  const needle='/assets/tle-brand-personality-20261110.css?v=1';
  assert.equal(html.split(needle).length-1,1,slug+' has exactly one personality stylesheet');
  assert.match(html,new RegExp('data-tle-one-motion="'+slug+'"'),slug+' preserved brand identity');
  assert.ok(html.indexOf(needle)<html.indexOf('</head>'),slug+' link loads before head ends');
  assert.ok(css.includes('html[data-tle-one-motion="'+slug+'"]'),slug+' has dedicated visual rules');
}
const sova=read('public/demos/sova/index.html');
assert.equal(sova.split('sova-listening-mode-20261110.js').length-1,1,
  'SOVA progressive enhancement is included once');
assert.match(css,/prefers-reduced-motion:reduce/,'reduced motion guard');
assert.match(css,/forced-colors:active/,'high contrast guard');
assert.match(css,/:focus-visible/,'keyboard focus');
assert.match(script,/aria-pressed/,'real accessible toggle state');
assert.match(script,/Escuchar de noche/,'Spanish translation');
assert.doesNotMatch(script,/new Audio|\.play\(|fetch\(|XMLHttpRequest|localStorage|sessionStorage/,
  'SOVA mood switch must not play music, transmit data or change user sessions');
assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length,'CSS bracket balance');
console.log('PASS source guard: six independent brands, SOVA bilingual controls, accessibility');

if (process.argv.includes('--browser')) {
  const {chromium,webkit}=await import('playwright');
  const origin=(process.env.QA_URL||'http://127.0.0.1:4193').replace(/\/$/,'');
  for(const browserType of [chromium,webkit]) {
    const browser=await browserType.launch({headless:true});
    try {
      for(const motion of ['no-preference','reduce']) {
        const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:motion});
        const errors=[];
        page.on('pageerror',e=>errors.push(String(e.message)));
        const response=await page.goto(origin+'/demos/sova/',{waitUntil:'domcontentloaded'});
        assert.equal(response?.status(),200,'SOVA loads');
        const button=page.locator('#sova-moods .sova-night-toggle');
        await button.waitFor({state:'visible',timeout:20000});
        const section=page.locator('#sova-moods');
        const header=page.locator('#sova-moods .sova-people-head');
        assert.equal(await button.getAttribute('aria-pressed'),'false','starts in cobalt mode');
        const before=await header.evaluate(el=>getComputedStyle(el).backgroundColor);
        await button.click();
        assert.equal(await button.getAttribute('aria-pressed'),'true','night button responds');
        const after=await header.evaluate(el=>getComputedStyle(el).backgroundColor);
        assert.notEqual(before,after,'night mode actually changes color');
        assert.ok(await section.evaluate(el=>el.classList.contains('sova-night')),'state is scoped to SOVA');
        assert.ok(await header.evaluate(el=>{const r=el.getBoundingClientRect();return r.width>250&&r.right<=innerWidth+6;}),'hero chapter stays within mobile viewport');
        const es=page.locator('.language-switch button').filter({hasText:/^ES$/i}).first();
        if(await es.count()){
          await es.click();
          await page.waitForFunction(()=>document.querySelector('.sova-night-toggle')?.textContent?.includes('Escuchar'),null,{timeout:8000});
          assert.equal(await button.getAttribute('aria-pressed'),'true','language does not reset user's mode');
        }
        assert.deepEqual(errors,[],browserType.name()+' no JavaScript errors');
        console.log('PASS',browserType.name(),motion,'SOVA night edit at 390px');
        await page.close();
      }
    }finally{await browser.close();}
  }
}
