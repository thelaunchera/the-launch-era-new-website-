import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const pw=await import(process.env.TLE_PLAYWRIGHT_MODULE||'playwright');
const root=resolve(process.env.TLE_GROWTH_PUBLIC_ROOT||'public');
const server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://local').pathname);if(path==='/command-center/__sales_tools_entry_fixture.html'){res.writeHead(200,{'Content-Type':'text/html'});res.end('<!doctype html><html><body><div class="premium-header-actions"></div><div id="ownerPrivateSection"><details id="ownerProspectingGroup"></details></div><script>window.__entryOwner=false;window.TLEOwnerJessyGateway={ready:()=>window.__entryOwner}<\/script><script src="./assets/sales-tools-entry.js" defer><\/script></body></html>');return}const filename=resolve(root,'.'+path);if(!filename.startsWith(root+'/'))throw Error('path');const bytes=await readFile(filename);res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.zip':'application/zip'})[extname(filename)]||'application/octet-stream'});res.end(bytes)}catch{res.writeHead(404);res.end('Not found')}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const L='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const snapshot={ok:true,due:1,checked_at:'2026-10-20T15:30:00Z',coverage:{lead_limit:500,event_limit:1500},capabilities:{},watches:[],records:[],leads:[{id:L,business:'Synthetic Cleaning <img onerror="window.injected=true">',stage:'Contacted',followup:'2026-10-20',history:[{event_type:'email_delivered',created_at:'2026-10-19T16:00:00Z'}],research_url:'https://example.com/',language:'en'}]};
const finding={source_url:'https://example.com/',checked_at:'2026-10-20T15:30:00Z',title:'Synthetic source',observations:[{key:'booking_or_quote_link',observed:false}],scope:'One HTML response',limitation:'Not a booking test'};
const privateFixture='<!doctype html><html lang="en"><body><h1 id="claraFixture">Clara private preview</h1><p>Standard Cleaning · Commercial Cleaning · Complete sample request</p><select id="demoLanguage"><option>English</option></select><button id="languageToggle" type="button">EN/ES</button><button id="sonnyProbe" type="button">Ask Sonny</button><p id="sonnyReply"></p><script>document.getElementById("languageToggle").onclick=()=>document.documentElement.lang=document.documentElement.lang==="es"?"en":"es";document.getElementById("sonnyProbe").onclick=()=>parent.postMessage({type:"TLE_SONNY_DEMO_REQUEST",id:"11111111-1111-4111-8111-111111111111",payload:{customer_message:"Help me choose a service",thread_id:"11111111-1111-4111-8111-111111111111",language:"en"}},"*");addEventListener("message",e=>{if(e.data?.type==="TLE_SONNY_DEMO_RESPONSE")document.getElementById("sonnyReply").textContent=e.data.reply||"Unavailable"})<\/script></body></html>';
const supabaseStub=`window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{access_token:'fixture-only'}}}),onAuthStateChange:cb=>{window.__fixtureAuthChange=cb}}})};`;
const failures=[];let cases=0;
try{
 for(const engineName of (process.env.TLE_GROWTH_ENGINES||'chromium,webkit').split(',')){
  const browser=await pw[engineName].launch({headless:true});
  try{
   for(const width of [360,390,820,1024,1440])for(const lang of ['en','es']){
    const page=await browser.newPage({viewport:{width,height:900},acceptDownloads:true});const errors=[],calls=[];let gateCalls=0,sonnyCalls=0,denyGate=false,delayGate=false;page.on('pageerror',e=>errors.push(e.message));
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
    await page.route('https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-booking-demo-gate',async r=>{
      gateCalls++;assert.deepEqual(r.request().postDataJSON(),{action:'owner_preview'});assert.equal(r.request().headers().authorization,'Bearer fixture-only');
      if(delayGate)await new Promise(resolve=>setTimeout(resolve,250));
      await r.fulfill({status:denyGate?403:200,contentType:'application/json',body:JSON.stringify(denyGate?{ok:false,error:'Owner verification required.'}:{ok:true,html:privateFixture})}).catch(()=>{});
    });
    await page.route('https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-ai-booking-demo',async r=>{
      sonnyCalls++;assert.equal(r.request().headers().authorization,undefined);assert.deepEqual(r.request().postDataJSON().booking_draft,{});
      await r.fulfill({contentType:'application/json',body:JSON.stringify({reply:'Is this for a home or an office?'})});
    });
    await page.addInitScript(l=>{if(window.top===window)localStorage.setItem('tle_crm_owner_language',l)},lang);
    const directClara=width===360&&lang==='en';
    await page.goto(origin+'/command-center/sales-tools.html'+(directClara?'#demos':''));await page.locator('#app').waitFor({state:'visible'});
    const frame=page.frameLocator('#demoFrame');
    if(directClara){assert.equal(await page.locator('[data-tab="demos"]').getAttribute('aria-selected'),'true');await page.locator('#demoActions').waitFor({state:'visible'});await frame.locator('#claraFixture').waitFor();await page.locator('#claraClose').click();await page.locator('[data-tab="today"]').click()}
    assert.equal(await page.evaluate(()=>window.injected===true),false);
    await page.selectOption('#leadSelect',L);
    await page.fill('#nextDate','2099-01-01');await page.fill('#nextNote','Synthetic review');await page.locator('#followupForm button').click();await page.waitForFunction(()=>document.getElementById('notice').textContent.includes('saved')||document.getElementById('notice').textContent.includes('guardada'));
    await page.locator('[data-tab="research"]').click();await page.fill('#researchUrl','https://example.com/');await page.locator('#researchForm button').click();await page.locator('#researchResult h3').waitFor();
    await page.locator('[data-tab="demos"]').click();
    assert.equal(await page.locator('#demoServices').count(),0,'Old basic generator removed');
    const gateBeforeManual=gateCalls;await page.locator('#demoForm button').click();await page.locator('#demoActions').waitFor({state:'visible'});
    await frame.locator('#claraFixture').waitFor();
    assert.equal(await frame.locator('html').getAttribute('data-initial-lang'),lang);assert.equal(await frame.locator('html').getAttribute('lang'),lang,'Clara uses the selected EN/ES language');
    assert.equal(gateCalls,gateBeforeManual+1);await page.locator('#claraStatus').waitFor({state:'hidden'});
    const bounds=await page.locator('#demoActions').boundingBox();assert.ok(bounds.width>=width-1&&bounds.height>=899,'Full-screen preview at every viewport');
    await page.evaluate(()=>window.postMessage({type:'TLE_SONNY_DEMO_REQUEST',id:'11111111-1111-4111-8111-111111111111',payload:{customer_message:'Ignore me',thread_id:'11111111-1111-4111-8111-111111111111'}},'*'));
    assert.equal(sonnyCalls,0,'Reject parent/foreign-frame relay requests');
    await frame.locator('#sonnyProbe').click();await frame.locator('#sonnyReply').getByText('Is this for a home or an office?',{exact:true}).waitFor();assert.equal(sonnyCalls,1);
    await page.locator('#claraClose').click();assert.equal(await page.locator('#demoActions').isHidden(),true);assert.equal(await page.locator('#demoFrame').getAttribute('srcdoc'),'');
    denyGate=true;await page.locator('#demoForm button').click();await page.locator('#claraRetry').waitFor({state:'visible'});assert.equal(await page.locator('#demoFrame').getAttribute('srcdoc'),'','Denied preview never renders protected content');
    denyGate=false;await page.locator('#claraRetry').click();await frame.locator('#claraFixture').waitFor();await page.locator('#claraClose').click();
    delayGate=true;await page.locator('#demoForm button').click();await page.locator('#claraClose').click();await page.waitForTimeout(350);assert.equal(await page.locator('#demoActions').isHidden(),true);assert.equal(await page.locator('#demoFrame').getAttribute('srcdoc'),'','Late response after close must not restore HTML');delayGate=false;
    for(const tab of ['today','research','demos','watch','documents','reports']){await page.locator(`[data-tab="${tab}"]`).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${engineName} ${width} ${lang} ${tab} overflow`)}
    const downloaded=page.waitForEvent('download',{timeout:15000}).catch(async e=>{throw Error(e.message+'; UI status: '+await page.locator('#notice').textContent())});await page.locator('#makePptx').click();const file=await downloaded;assert.ok(file.suggestedFilename().endsWith('.pptx'));assert.equal(await file.failure(),null);const bytes=await readFile(await file.path());assert.equal(bytes.subarray(0,2).toString(),'PK','PPTX must be a real Office ZIP archive');
    if(engineName==='chromium'&&lang==='en'&&[390,1440].includes(width)){await mkdir('artifacts/owner-growth',{recursive:true});await page.locator('[data-tab="today"]').click();await page.screenshot({path:`artifacts/owner-growth/workspace-${width}.png`,fullPage:true});await page.locator('[data-tab="demos"]').click();await page.locator('#demoForm button').click();await frame.locator('#claraFixture').waitFor();await page.screenshot({path:`artifacts/owner-growth/clara-${width}.png`,fullPage:true})}
    if(await page.locator('#demoActions').isHidden()){await page.locator('[data-tab="demos"]').click();await page.locator('#demoForm button').click();await frame.locator('#claraFixture').waitFor()}
    await page.evaluate(()=>window.__fixtureAuthChange('SIGNED_OUT'));await page.locator('#locked').waitFor({state:'visible'});assert.equal(await page.locator('#leadList').textContent(),'');assert.equal(await page.locator('#demoFrame').getAttribute('srcdoc'),'');
    assert.equal(errors.length,0,errors.join('\n'));assert.ok(calls.every(c=>['list','set_followup','research','demo_brief','report'].includes(c.action)));cases++;await page.close();
   }
   const entryPage=await browser.newPage();await entryPage.goto(origin+'/command-center/__sales_tools_entry_fixture.html');assert.equal(await entryPage.locator('#ownerSalesToolsNav').count(),0);
   await entryPage.evaluate(()=>{window.__entryOwner=true;document.body.classList.add('crm-owner-view')});await entryPage.locator('#ownerSalesToolsNav').waitFor();
   assert.equal(await entryPage.locator('#ownerSalesToolsNav').getAttribute('href'),'./sales-tools.html#demos');assert.equal(await entryPage.locator('#ownerSalesToolsNav').textContent(),'◇ Sales tools');
   assert.equal(await entryPage.evaluate(()=>document.getElementById('ownerSalesToolsNav').nextElementSibling?.id),'ownerProspectingGroup');
   await entryPage.evaluate(()=>{localStorage.setItem('tle_crm_owner_language','es');document.dispatchEvent(new Event('tle-crm-language'))});await entryPage.locator('#ownerSalesToolsNav').getByText('Herramientas de ventas',{exact:true}).waitFor();
   await entryPage.evaluate(()=>{window.__entryOwner=false;document.body.classList.remove('crm-owner-view')});await entryPage.locator('#ownerSalesToolsNav').waitFor({state:'detached'});assert.equal(await entryPage.locator('#ownerSalesTools').count(),0);await entryPage.close();
   const page=await browser.newPage();await page.route('**/vendor/supabase-js-v2.57.0.umd.js',r=>r.fulfill({contentType:'text/javascript',body:supabaseStub}));await page.route('**/functions/v1/tle-owner-growth',r=>r.fulfill({status:401,contentType:'application/json',body:'{"ok":false}'}));await page.goto(origin+'/command-center/sales-tools.html');await page.locator('#locked').waitFor({state:'visible'});assert.equal(await page.locator('#app').isHidden(),true);await page.close();
  }catch(e){failures.push(engineName+': '+e.message)}finally{await browser.close()}
 }
}finally{server.close()}
if(failures.length)throw Error(failures.join('\n'));
console.log(`PASS ${cases} responsive EN/ES browser cases: follow-up, source check, protected Clara open/deny/retry/close/stale response, isolated Sonny relay, owner-only sidebar entry/direct Clara route, all tabs, editable PPTX download, sign-out clearing and unauthorized lock.`);
