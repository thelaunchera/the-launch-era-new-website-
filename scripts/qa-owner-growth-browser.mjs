import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const pw=await import(process.env.TLE_PLAYWRIGHT_MODULE||'playwright');
const root=resolve(process.env.TLE_GROWTH_PUBLIC_ROOT||'public');
const server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://local').pathname);const filename=resolve(root,'.'+path);if(!filename.startsWith(root+'/'))throw Error('path');const bytes=await readFile(filename);res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.zip':'application/zip'})[extname(filename)]||'application/octet-stream'});res.end(bytes)}catch{res.writeHead(404);res.end('Not found')}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const L='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const snapshot={ok:true,due:1,checked_at:'2026-10-20T15:30:00Z',coverage:{lead_limit:500,event_limit:1500},capabilities:{},watches:[],records:[],leads:[{id:L,business:'Synthetic Cleaning <img onerror="window.injected=true">',stage:'Contacted',followup:'2026-10-20',history:[{event_type:'email_delivered',created_at:'2026-10-19T16:00:00Z'}],research_url:'https://example.com/',language:'en'}]};
const finding={source_url:'https://example.com/',checked_at:'2026-10-20T15:30:00Z',title:'Synthetic source',observations:[{key:'booking_or_quote_link',observed:false}],scope:'One HTML response',limitation:'Not a booking test'};
const supabaseStub=`window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{access_token:'fixture-only'}}}),onAuthStateChange:cb=>{window.__fixtureAuthChange=cb}}})};`;
const failures=[];let cases=0;
try{
 for(const engineName of (process.env.TLE_GROWTH_ENGINES||'chromium,webkit').split(',')){
  const browser=await pw[engineName].launch({headless:true});
  try{
   for(const width of [360,390,820,1024,1440])for(const lang of ['en','es']){
    const page=await browser.newPage({viewport:{width,height:900},acceptDownloads:true});const errors=[],calls=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/vendor/supabase-js-v2.57.0.umd.js',r=>r.fulfill({contentType:'text/javascript',body:supabaseStub}));
    await page.route('https://fonts.googleapis.com/**',r=>r.abort());
    await page.route('https://fonts.gstatic.com/**',r=>r.abort());
    await page.route('https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-owner-growth',async r=>{
      const b=r.request().postDataJSON();calls.push(b);let data=snapshot;
      if(b.action==='research')data={ok:true,record:{title:'Synthetic source',created_at:snapshot.checked_at,kind:'research',data:finding}};
      if(b.action==='set_followup')data={ok:true,record:{kind:'followup'}};
      if(b.action==='demo_brief')data={ok:true,record:{data:{business:snapshot.leads[0].business,language:lang,area:'Example City',services:['Standard cleaning','Office cleaning']}}};
      if(b.action==='report')data={ok:true,record:{data:{generated_at:snapshot.checked_at,due:1,active_leads:1,coverage:snapshot.coverage,evidence:[],scope:'Synthetic QA only'}}};
      await r.fulfill({contentType:'application/json',body:JSON.stringify(data)});
    });
    await page.addInitScript(l=>localStorage.setItem('tle_crm_owner_language',l),lang);
    await page.goto(origin+'/command-center/sales-tools.html');await page.locator('#app').waitFor({state:'visible'});
    assert.equal(await page.evaluate(()=>window.injected===true),false);
    await page.selectOption('#leadSelect',L);
    await page.fill('#nextDate','2099-01-01');await page.fill('#nextNote','Synthetic review');await page.locator('#followupForm button').click();await page.waitForFunction(()=>document.getElementById('notice').textContent.includes('saved')||document.getElementById('notice').textContent.includes('guardada'));
    await page.locator('[data-tab="research"]').click();await page.fill('#researchUrl','https://example.com/');await page.locator('#researchForm button').click();await page.locator('#researchResult h3').waitFor();
    await page.locator('[data-tab="demos"]').click();await page.fill('#demoServices','Standard cleaning\nOffice cleaning');await page.locator('#demoForm button').click();await page.locator('#demoActions').waitFor({state:'visible'});
    const frame=page.frameLocator('#demoFrame');await frame.locator('[data-service="0"]').click();await frame.locator('#next').click();await frame.locator('#next').click();await frame.locator('#next').click();await frame.locator('#done').waitFor({state:'visible'});
    await frame.locator('#reset').click();assert.equal(await frame.locator('#date').inputValue()!=='',true);await frame.locator('#back').isHidden();
    for(const tab of ['today','research','demos','watch','documents','reports']){await page.locator(`[data-tab="${tab}"]`).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${engineName} ${width} ${lang} ${tab} overflow`)}
    const downloaded=page.waitForEvent('download');await page.locator('#makePptx').click();const file=await downloaded;assert.ok(file.suggestedFilename().endsWith('.pptx'));assert.equal(await file.failure(),null);
    await page.evaluate(()=>window.__fixtureAuthChange('SIGNED_OUT'));await page.locator('#locked').waitFor({state:'visible'});assert.equal(await page.locator('#leadList').textContent(),'');assert.equal(await page.locator('#demoFrame').getAttribute('srcdoc'),'');
    assert.equal(errors.length,0,errors.join('\n'));assert.ok(calls.every(c=>['list','set_followup','research','demo_brief','report'].includes(c.action)));cases++;await page.close();
   }
   const page=await browser.newPage();await page.route('**/vendor/supabase-js-v2.57.0.umd.js',r=>r.fulfill({contentType:'text/javascript',body:supabaseStub}));await page.route('**/functions/v1/tle-owner-growth',r=>r.fulfill({status:401,contentType:'application/json',body:'{"ok":false}'}));await page.goto(origin+'/command-center/sales-tools.html');await page.locator('#locked').waitFor({state:'visible'});assert.equal(await page.locator('#app').isHidden(),true);await page.close();
  }catch(e){failures.push(engineName+': '+e.message)}finally{await browser.close()}
 }
}finally{server.close()}
if(failures.length)throw Error(failures.join('\n'));
console.log(`PASS ${cases} responsive EN/ES browser cases: follow-up, source check, full no-send demo/reset, all tabs, editable PPTX download, sign-out clearing and unauthorized lock.`);
