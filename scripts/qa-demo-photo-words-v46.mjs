/** Ensure legacy personalized preview remains private; never bypass auth to inspect client photographs. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {chromium} from 'playwright';
const source=readFileSync('public/lead-private-preview.html','utf8');
assert(source.includes('auth')||source.includes('key')||source.includes('token'),'Private preview access gate must remain');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,width] of [['en',360],['es',390],['es',768],['en',820],['en',1024],['es',1440]]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const writes=[];page.on('request',r=>{if(['POST','PUT','PATCH','DELETE'].includes(r.method()))writes.push(r.url())});
  const result=await page.goto(base+'/lead-private-preview.html?lang='+lang,{waitUntil:'domcontentloaded'});
  assert(result?.ok(),'Private preview entry must serve an access gate');
  assert.equal(await page.locator('html.tle-v46-photo-words-ready').count(),0,'Private client images cannot render to anonymous visitors');
  await page.goto(base+'/lead-private-preview.html?key=synthetic-isolation-check&lang='+lang,{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('html.tle-v46-photo-words-ready').count(),0,'A fake key must not expose personalized content');
  assert.deepEqual(writes,[],'No customer writes permitted in read-only preview QA');
  await page.close();
  console.log('PASS private preview gating '+lang+' '+width);
 }
}finally{await browser.close()}
