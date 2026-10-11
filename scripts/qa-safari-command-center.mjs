import { webkit } from 'playwright';
const browser=await webkit.launch({headless:true});
const page=await browser.newPage({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1'});
const errors=[];
page.on('pageerror',e=>errors.push('JS: '+String(e.message).slice(0,300)));
page.on('requestfailed',r=>errors.push('NETWORK: '+r.url().slice(0,150)+' '+r.failure()?.errorText));
page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+': '+r.url().slice(0,150));});
try{
 const url='https://thelaunchera.com/command-center/?app=tle&qa=safari-lightweight-v32';
 console.log('OPEN',url);
 const nav=await page.goto(url,{waitUntil:'commit',timeout:45000}).catch(e=>{console.log('NAVIGATION_ERROR',String(e.message));return null;});
 console.log('STATUS',nav?.status());
 if(nav?.status()===200)await page.locator('#authForm').waitFor({state:'attached',timeout:45000});
 await page.waitForTimeout(3000);
 const state=await page.evaluate(()=>{
  const f=document.querySelector('#authForm'),cover=document.querySelector('#tleLoading');
  const visible=x=>!!x && getComputedStyle(x).display!=='none' && getComputedStyle(x).visibility!=='hidden';
  return {title:document.title,readyState:document.readyState,htmlSize:document.documentElement.outerHTML.length,hasForm:!!f,formVisible:visible(f),sdk:!!window.supabase?.createClient,loading:visible(cover)&&!cover.classList.contains('tle-loading-hide'),loadingText:cover?.innerText?.slice(0,300),hasFallback:!!document.querySelector('#tleBootRecoveryActions')};
 });
 console.log('STATE',JSON.stringify(state));
 console.log('ERRORS',JSON.stringify(errors.slice(0,15)));
 const picker=page.locator('#crmLanguageSelect');
 if(await picker.count()){
  await picker.selectOption('es',{timeout:4500});
  await page.waitForTimeout(500);
  const labels=await page.evaluate(()=>({lang:document.documentElement.lang,login:document.querySelector('#signin')?.textContent?.trim(),picker:document.querySelector('#crmLanguageSelect')?.value}));
  console.log('LANGUAGE_SWITCH',JSON.stringify(labels));
  if(labels.picker!=='es')throw Error('Language selection did not complete');
 }

 await page.screenshot({path:'qa-safari-main.png'});
 if(!nav||nav.status()!==200||!state.hasForm||!state.sdk)throw Error('Safari cannot parse sign-in or load local auth');
 if(state.loading&&!state.hasFallback)throw Error('Safari retains blocking splash without recovery');
 if(errors.some(x=>x.startsWith('JS:')))throw Error('Page JavaScript uncaught exceptions; see logs');
 console.log('PASS: official Command Center loads safely in WebKit');

 // A mocked buyer review prevents real email, billing, or approval actions.
 // Check that the customer's saved language and review link survive Safari refresh.
 const review=await browser.newPage({viewport:{width:390,height:844}});
 const reviewErrors=[];
 review.on('pageerror',e=>reviewErrors.push(String(e.message)));
 await review.route('**/functions/v1/tle-client-review',async route=>{
  if(route.request().method()==='OPTIONS'){
   await route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'content-type','access-control-allow-methods':'POST,OPTIONS'}});
   return;
  }
  const payload=route.request().postDataJSON();
  if(payload.action!=='ai_status'){await route.fulfill({status:403,body:'{"error":"QA does not submit buyer decisions"}'});return}
  await route.fulfill({status:200,headers:{'content-type':'application/json','access-control-allow-origin':'*'},body:JSON.stringify({ok:true,status:'pending_review',delivered:false,business_name:'QA Sample Company',revisions_remaining:2,revisions_limit:2,language:'es',preview_url:'https://example.com/preview'})});
 });
 const reviewUrl='https://thelaunchera.com/client-review/?token='+('a'.repeat(64));
 const reviewResponse=await review.goto(reviewUrl,{waitUntil:'domcontentloaded',timeout:45000});
 if(reviewResponse?.status()!==200)throw Error('Private AI review page unavailable in mobile Safari');
 await review.waitForFunction(()=>document.querySelector('#change')?.textContent?.includes('Solicitar cambios'),{timeout:12000});
 const snapshot=await review.evaluate(()=>({language:document.documentElement.lang,approve:document.getElementById('approve')?.textContent,change:document.getElementById('change')?.textContent,business:document.getElementById('business')?.textContent,tokenInUrl:new URL(location.href).searchParams.has('token')}));
 if(snapshot.language!=='es'||!snapshot.approve?.includes('Aprobar')||!snapshot.change?.includes('Solicitar cambios')||snapshot.tokenInUrl)throw Error('Private review localization/security mismatch '+JSON.stringify(snapshot));
 await review.reload({waitUntil:'domcontentloaded',timeout:45000});
 await review.waitForFunction(()=>document.querySelector('#change')?.textContent?.includes('Solicitar cambios'),{timeout:12000});
 const restored=await review.evaluate(()=>({language:document.documentElement.lang,tokenStored:!!sessionStorage.getItem('tle_ai_private_review_token'),status:document.getElementById('message')?.textContent}));
 if(restored.language!=='es'||!restored.tokenStored||!restored.status?.includes('Prueba'))throw Error('Private review lost language or same-tab access after reload '+JSON.stringify(restored));
 if(reviewErrors.length)throw Error('AI private review Safari JS errors: '+reviewErrors.join(' | '));
 await review.screenshot({path:'qa-safari-ai-review-es.png'});
 console.log('PASS: private AI review language and refresh recovery in mobile Safari');

} finally {await browser.close();}
