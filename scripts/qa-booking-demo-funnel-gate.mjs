/** Fail-closed release guard: Booking Automation ONLY. Never sends an email or changes data. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=path=>fs.readFileSync(path,'utf8');
const ownerPage=read('public/command-center/index.html');
const ownerScript=read('public/command-center/assets/command-center-app.js');
const publicRequest=read('public/booking-demo/index.html');
assert.match(ownerPage,/id="ownerDemoQuickNav"/);
assert.match(ownerPage,/id="ownerDemoQuickShortcut"/);
assert.match(ownerPage,/id="ownerMasterBookingPreview" class="owner-preview-private-cta"/);
assert.match(ownerPage,/id="ownerShowLandingPreview" class="secondary">Open Booking Demo</);
assert.doesNotMatch(ownerPage,/href="\/booking-demo\/" id="ownerMasterBookingPreview"/);
assert.match(ownerScript,/document\.getElementById\('ownerShowLandingPreview'\)\.onclick=openPrivateBookingDemo/);
assert.match(ownerScript,/document\.getElementById\('ownerMasterBookingPreview'\)\.onclick=openPrivateBookingDemo/);
assert.match(ownerScript,/if\(!workspace\?\.is_internal\|\|!document\.body\.classList\.contains\('crm-owner-view'\)\)return/);
assert.match(ownerScript,/openButton\.click\(\)/);
assert.doesNotMatch(ownerScript,/frame\.src='\/booking-demo\/\?/);
assert.match(ownerScript,/frame\.srcdoc=realLayout\(\)/);

assert.match(ownerPage,/id="ownerDemoOverviewOpen"/);
assert.match(ownerScript,/ownerDemoQuickShortcut.*classList\.toggle/);
assert.match(ownerScript,/ownerDemoOverviewOpen.*onclick=openOwnerBookingDemo/);
assert.match(ownerScript,/u\.searchParams\.get\(\x27ownerDemo\x27\)/);
assert.match(ownerScript,/workspace\?\.is_internal/);
assert.match(ownerPage,/sandbox="allow-scripts"/);
assert.match(ownerScript,/action:'owner_preview'/);
assert.match(ownerScript,/db\.auth\.getSession\(\)/);
assert.match(ownerScript,/privateDemoFrame\.srcdoc=result\.html/);
assert.match(ownerPage,/id="ownerDemoQuickModalCard"/);
assert.equal((ownerPage.match(/id="ownerDemoQuickCard"/g)||[]).length,1,'Owner dashboard IDs must be unique');
assert.match(ownerPage,/id="ownerDemoQuickRetry"/);
assert.match(ownerPage,/id="ownerDemoQuickFrame"[^>]+loading="eager"/);
assert.match(ownerPage,/#ownerDemoQuickView\[hidden\]/);
assert.match(ownerPage,/#ownerDemoQuickView\{position:fixed;inset:0;z-index:120000/);
assert.match(ownerScript,/window\.__tleBootReady=true/);
assert.match(ownerScript,/if\(cover\)cover\.remove\(\)/);
assert.match(ownerScript,/privateDemoFrame\.onload=/);
assert.match(ownerScript,/privateDemoRetry\.onclick=openOwnerBookingDemo/);
assert.match(ownerScript,/!result\.html\.includes\('Residential Cleaning'\)/);
assert.match(ownerScript,/!result\.html\.includes\('Commercial Cleaning'\)/);
assert.match(ownerScript,/!result\.html\.includes\('Request a Quote'\)/);
assert.match(ownerScript,/privateDemoStatus\.hidden=true/);

assert.match(publicRequest,/acceptance_url/);
assert.match(publicRequest,/demo_request_created/);
assert.doesNotMatch(publicRequest,/data\?\.email_accepted!==true/);
const booking=read('public/booking-demo-reset.html');
const tracker=read('public/lead-demo-tracker.html');
const app=read('public/cleaning-app-demo/index.html');
const request=read('public/booking-demo/index.html');
const privatePreview=read('public/lead-private-preview.html');
const jessie=read('supabase/functions/tle-jessie-demo-lead/index.ts');
const name='tle-booking-demo-gate';
const url='https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/'+name;
for(const [label,page] of [['booking',booking],['tracker',tracker]]){
 assert.match(page,/<title>Private Booking Automation Demo/);
 assert.match(page,new RegExp(url));
 assert.match(page,/new URLSearchParams\(location.search\)/);
 assert.match(page,/action:"content"/);
 assert.match(page,/action:"verify"/);
 assert.match(page,/action:"request"/);
 assert.match(page,/sessionStorage/);
 assert.match(page,/document\.write\(response\.html\)/);
 assert.doesNotMatch(page,/<(?:section|div)[^>]+(?:id="bookingPage"|id="trackerBrand"|id="sonnyBody")/);
 assert.doesNotMatch(page,/const SERVICE_CATALOG|booking-portal-hero|tle-demo-reset-lead-magnet\.js/);
 assert.doesNotMatch(page,/funnel|embudo|lead catcher|lead capture|captaci[oó]n/i,label+" must not explain internal marketing mechanics to visitors");
 assert.match(page,/personal invitation|personal email link/,"Visitors see invitation-led language");
 assert.match(page,/invitación|enlace personal/,"Spanish visitors see natural invitation-led language");
 assert.match(page,/invitation_required/,"Access denial response stays actionable and consistent");
 const scripts=[...page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
 assert.equal(scripts.length,1,label+' should have a single gated bootstrap');
 new vm.Script(scripts[0][1],{filename:label+'-gate.js'});
}
assert(booking.includes('const PAGE="booking"'));
assert(tracker.includes('const PAGE="tracker"'));
assert(!jessie.includes('demoUrl'),'Jessie must not send an unverified private-demo direct link');
assert(jessie.includes('Confirm your interest to receive your private demo'));
assert.match(privatePreview,/location\.replace\('\/booking-demo-reset\.html'\+location\.search\+location\.hash\)/);
assert.match(privatePreview,/p\.has\('key'\)\|\|p\.get\('owner_preview'\)==='1'/);
assert.match(app,/Cleaning App \| Interactive Preview/);
assert.match(app,/Pick a section|Choose a section|sample/);
assert.match(request,/tle-personalized-demo/,'Public form still requests demos');
assert(!fs.existsSync('supabase/functions/tle-booking-demo-gate/booking-template.ts'),'Protected Booking source must not be in public repo');
assert(!fs.existsSync('supabase/functions/tle-booking-demo-gate/tracker-template.ts'),'Protected tracker source must not be in public repo');
assert(!fs.existsSync('supabase/functions/tle-booking-demo-gate/index.ts'),'Backend implementation is deployed privately in Supabase, not public GitHub');

// Simulate Owner dialog lifecycle with a fake signed-in session and mocked private
// response. No production network calls, lead changes, or emails are triggered.
const blockStart=ownerScript.indexOf("const privateDemoModal=$('ownerDemoQuickView');");
const blockEnd=ownerScript.indexOf("\nfunction premiumNavigate(target)",blockStart);
assert(blockStart>=0&&blockEnd>blockStart,'Owner preview script must remain auditable');
const ownerDialogSource=ownerScript.slice(blockStart,blockEnd);
class MockElement {
 constructor(){this.hidden=false;this.srcValue=null;this.onload=null;this.listeners={};this.isConnected=true;this.classList={contains:()=>false}}
 focus(){}
 addEventListener(name,fn){this.listeners[name]=fn}
 removeAttribute(name){if(name==='srcdoc')this.srcValue=null}
 hasAttribute(name){return name==='srcdoc'&&this.srcValue!==null}
 set srcdoc(value){this.srcValue=value;queueMicrotask(()=>this.onload?.())}
 get srcdoc(){return this.srcValue}
}
async function mockOwnerView({owner=true,authorized=true}={}){
 const ids=['ownerDemoQuickView','ownerDemoQuickFrame','ownerDemoQuickStatus','ownerDemoQuickRetry','ownerDemoQuickNav',
  'ownerDemoQuickClose','ownerDemoQuickShortcut','ownerDemoOverviewOpen','app','tleLoading'];
 const nodes=Object.fromEntries(ids.map(id=>[id,new MockElement()]));
 nodes.ownerDemoQuickView.hidden=true;
 nodes.ownerDemoQuickRetry.hidden=true;
 nodes.tleLoading.remove=()=>{nodes.tleLoading.removed=true};
 let backendCalls=0;
 const context={
  $:id=>nodes[id],
  document:{body:{classList:{contains:name=>name==='crm-owner-view'&&owner}},addEventListener:()=>{}},
  workspace:{is_internal:owner},window:{__tleBootReady:false,addEventListener:()=>{}},
  closePremiumSidebar:()=>{},db:{auth:{getSession:async()=>({data:{session:{access_token:'mock-authorized-session'}}})}},
  fetch:async(url,init)=>{
   backendCalls++;
   assert.match(url,/tle-booking-demo-gate/);
   assert.equal(JSON.parse(init.body).action,'owner_preview');
   return {ok:authorized,status:authorized?200:403,json:async()=>authorized
    ?{ok:true,html:'<!DOCTYPE html><html><body>Residential Cleaning • Commercial Cleaning • Request a Quote</body></html>'}
    :{ok:false,error:'Only the workspace owner can open this preview.'}};
  },
  URL,location:{href:'https://thelaunchera.com/command-center/',search:''},
  history:{replaceState:()=>{}},setTimeout,clearTimeout,AbortController,
  HTMLElement:MockElement
 };
 vm.runInNewContext(ownerDialogSource,context,{timeout:1000,filename:'OwnerDemoModal.js'});
 await nodes.ownerDemoQuickShortcut.onclick();
 await new Promise(resolve=>setImmediate(resolve));
 return {nodes,context,backendCalls};
}
const ownerSuccess=await mockOwnerView();
assert.equal(ownerSuccess.backendCalls,1,'One request per preview click');
assert.equal(ownerSuccess.nodes.tleLoading.removed,true,'Stale workspace loader is cleared only after a verified preview');
assert.equal(ownerSuccess.nodes.ownerDemoQuickStatus.hidden,true,'Owner dialog finishes only after iframe load');
assert.equal(ownerSuccess.nodes.ownerDemoQuickRetry.hidden,true,'Do not show retry on success');
assert.match(ownerSuccess.nodes.ownerDemoQuickFrame.srcdoc,/Residential Cleaning/,'Owner sees actual demo content');
const ownerDenied=await mockOwnerView({authorized:false});
assert.equal(ownerDenied.nodes.ownerDemoQuickFrame.srcdoc,null,'Access denial must never render protected demo');
assert.equal(ownerDenied.nodes.ownerDemoQuickRetry.hidden,false,'Errors expose a retry action');
const buyerDenied=await mockOwnerView({owner:false});
assert.equal(buyerDenied.backendCalls,0,'Buyer must not call the private Owner endpoint');
console.log('PASS: mocked Owner demo loads, splash clears, failure retries, buyer blocked');

console.log('PASS: Booking Automation only; no public raw HTML; private code verification; Jessie confirmation; buyer and Cleaning App retained.');
