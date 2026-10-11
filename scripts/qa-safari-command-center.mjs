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
 const nav=await page.goto(url,{waitUntil:'domcontentloaded',timeout:24000}).catch(e=>{console.log('NAVIGATION_ERROR',String(e.message));return null;});
 console.log('STATUS',nav?.status());
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
} finally {await browser.close();}
