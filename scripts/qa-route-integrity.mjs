/**
 * The Launch Era: non-destructive release gate for static local links + live pages + consent CORS.
 * Usage: node scripts/qa-route-integrity.mjs --static | --live
 */
import {existsSync,readdirSync,readFileSync,statSync} from 'node:fs';
import {join,extname,posix} from 'node:path';
const root=process.cwd(),pub=join(root,'public');
const site=(process.env.TLE_QA_URL||'https://thelaunchera.com').replace(/\/$/,'');
const domain=new URL(site).hostname,errors=[],warnings=[];
const routes=['/','/es/','/solutions/','/how-it-works/','/help/','/booking-lead-automation/','/cleaning-web-app/','/virtual-assistant/','/website-automation/','/free-cleaning-lead-guide/','/es/booking-lead-automation/','/es/cleaning-web-app/','/es/virtual-assistant/','/es/website-automation/','/es/free-cleaning-lead-guide/'];
const known=new Set(routes.map(x=>x==='/'?'/':x.replace(/\/$/,'')));
function walk(folder){if(!existsSync(folder))return [];return readdirSync(folder,{withFileTypes:true}).flatMap(x=>{const f=join(folder,x.name);return x.isDirectory()?walk(f):x.isFile()?[f]:[]})}
function existsRoute(pathname){
 const path=posix.normalize('/'+pathname.replace(/^\/+/,'')).replace(/\/$/,'')||'/';
 if(known.has(path))return true;
 const f=join(pub,path.slice(1));
 return (existsSync(f)&&statSync(f).isFile())||existsSync(join(f,'index.html'))||existsSync(f+'.html');
}
function staticChecks(){
 if(!existsSync(pub))throw Error('Run this script from the website repository root');
 const pages=walk(pub).filter(f=>extname(f)==='.html');
 let valid=0,checked=0;
 for(const file of pages){
  const data=readFileSync(file,'utf8'),relative=file.slice(pub.length).replaceAll('\\','/');
  const base=site+(relative.endsWith('index.html')?relative.slice(0,-10):relative);
  if(!data.trim())errors.push('Empty HTML: '+relative);
  for(const match of data.matchAll(/\b(href|src|action)\s*=\s*(["'])(.*?)\2/gs)){
   const raw=match[3].replace(/&amp;/g,'&').trim();
   if(!raw||raw.startsWith('#')||/^(mailto:|tel:|data:|blob:|javascript:)/i.test(raw)||raw.includes('$'+'{')||raw.includes('{{')||raw.includes("'+")||raw.includes("+'"))continue;
   let target;try{target=new URL(raw,base)}catch{warnings.push('Invalid URI: '+relative+' '+raw);continue}
   if(target.hostname!==domain)continue;
   checked++;
   if(existsRoute(target.pathname))valid++;
   else errors.push('Missing local route/asset: '+relative+' '+match[1]+'='+raw+' -> '+target.pathname);
  }
 }
 for(const f of ['public/command-center/index.html','public/command-center/access.html','public/auth-recovery.html','public/booking-demo/index.html','public/lead-private-preview.html','public/client-review/index.html','public/cb-depot/privacy/index.html','public/cb-depot/terms/index.html','public/404.html','skills/the-launch-era-qa/SKILL.md','skills/the-launch-era-qa/ROUTE_MAP.md','skills/the-launch-era-qa/INCIDENT_LOG.md'])if(!existsSync(join(root,f)))errors.push('Missing required file: '+f);
 if(!readFileSync(join(pub,'command-center/access.html'),'utf8').includes('/auth-recovery.html'))errors.push('Reset must go to /auth-recovery.html');
 if(!readFileSync(join(pub,'auth-recovery.html'),'utf8').includes('/command-center/'))errors.push('Reset must return to the Command Center');
 // Public contact and onboarding must never advertise TLE office hours as customer support hours.
 const publicIntakes=[
  ['public/booking-flow-intake/index.html','You can submit this form anytime.'],
  ['public/es/booking-flow-intake/index.html','Puedes enviar este formulario cuando quieras.'],
  ['public/intake/automation/index.html','You can submit this form anytime.'],
  ['public/es/intake/automation/index.html','Puedes enviar este formulario cuando quieras.'],
  ['public/intake/va/index.html','You can submit this form anytime.'],
  ['public/es/intake/va/index.html','Puedes enviar este formulario cuando quieras.'],
  ['public/ai-booking-assistant/onboarding/index.html','You can complete this form anytime.']
 ];
 for(const [file,expected] of publicIntakes){
  const content=readFileSync(join(root,file),'utf8');
  if(!content.includes(expected)) errors.push('Public intake missing anytime submission guidance: '+file);
  if(/Production hours:|Horario de producción:|After-hours submissions start|After-hours setups begin|Fuera del horario laboral, comenzamos|Fuera de horario, comenzamos/i.test(content))errors.push('Public intake still displays TLE office hours: '+file);
 }
 const sharedFooter=readFileSync(join(root,'src/components/site-shell.tsx'),'utf8');
 if(!sharedFooter.includes('footer-contact')||!sharedFooter.includes('footer-links')||!sharedFooter.includes("'/help'")||sharedFooter.includes('footer-hours')||sharedFooter.includes('Get in Touch')||sharedFooter.includes('Get in touch'))errors.push('Website footer must show anytime guidance and one accessible Contact destination, without duplicate Get in Touch');
 const publicFaq=readFileSync(join(root,'src/components/service-faq.tsx'),'utf8');
 if(/Mon–Fri 8:30 AM|Horario: lunes a viernes de 8:30 AM/.test(publicFaq))errors.push('General FAQ repeats the full TLE office timetable');
 console.log('[TLE STATIC] '+pages.length+' HTML pages; '+valid+'/'+checked+' local links resolved');
}
const critical=[
 ['/','Launch Era'],['/es/','Launch Era'],['/solutions/','Solutions'],['/how-it-works/','steps'],
 ['/help/','business'],['/booking-lead-automation/','Booking'],['/booking-demo/','Booking'],
 ['/ai-booking-assistant/','AI'],['/es/ai-booking-assistant/','IA'],
 ['/booking-bundle/','Booking'],['/whatsapp-ai-agent/','WhatsApp'],
 ['/command-center/','Command Center'],['/command-center/access','Command Center'],
 ['/auth-recovery.html','password'],['/auth-recovery','password'],
 ['/lead-private-preview.html','Booking'],['/lead-demo-tracker.html','Demo'],
 ['/client-review/','Launch Era'],['/client-legal/','policies'],
 ['/booking-flow-intake/','Booking'],['/es/booking-flow-intake/','Booking'],
 ['/booking-flow-payment-success/','Payment'],['/service-checkout/','checkout'],
 ['/demos/claudia/','Claudia'],['/demos/angela-so-fresh-clean-queen/','Angela'],
 ['/command-center/lead-insights.html','Lead Insights'],
 ['/command-center/buyer-account-preview.html','Buyer Account Preview'],
 ['/cleaning-app/','Cleaning Web App'],
 ['/cb-depot/privacy/','CB Depot'],['/cb-depot/terms/','CB Depot'],
 ['/privacy.html','Privacy'],['/terms.html','Terms']];
async function safeFetch(url,init={}){
 const c=new AbortController(),t=setTimeout(()=>c.abort(),14000);
 try{return await fetch(url,{...init,signal:c.signal,headers:{'User-Agent':'TLE-ReadOnly-QA',...init.headers}})}
 finally{clearTimeout(t)}
}
async function liveChecks(){
 let passed=0;
 for(const [path,marker] of critical){
  try{
   const r=await safeFetch(site+path),body=await r.text(),title=(body.match(/<title[^>]*>([^<]*)<\/title>/i)||[])[1]||'';
   if(!r.ok||!body.trim()||/\b404\b|page not found/i.test(title)||!body.toLowerCase().includes(marker.toLowerCase())||new URL(r.url).hostname!==domain)errors.push(path+' bad response: HTTP '+r.status+', title='+title+', final='+r.url);
   else passed++;
  }catch(e){errors.push(path+' '+String(e.message||e))}
 }
 try{
  const missing=await safeFetch(site+'/__tle_route_qa_missing_page_20261012');
  const fallback=await missing.text();
  if(missing.status!==404 || !fallback.includes('We couldn’t find that page.') || !fallback.includes('/command-center/'))errors.push('Missing-route fallback is blank, misrouted or lacks recovery links');
 }catch(e){errors.push('Missing-route fallback '+String(e.message||e))}
 // Safe invalid-UUID consent call: no actual lead is changed or authorized.
 const endpoint='https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-crm-interest?lead=invalid';
 const origin='https://the-launch-era-interest-confirmation-odqbiw.v2.appdeploy.ai';
 try{
  const options=await safeFetch(endpoint,{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'POST'}});
  if(!options.ok||options.headers.get('access-control-allow-origin')!==origin)errors.push('Interest OPTIONS missing CORS or returned bad status');
  const invalid=await safeFetch(endpoint,{method:'POST',headers:{Origin:origin}}),body=await invalid.text();
  if(invalid.status!==400||!body.trim()||invalid.headers.get('access-control-allow-origin')!==origin)errors.push('Interest error response lacks safe CORS + HTML error body');
 }catch(e){errors.push('Interest CORS check: '+String(e.message||e))}
 console.log('[TLE LIVE] '+passed+'/'+critical.length+' read-only pages passed');
}
if(process.argv.includes('--live'))await liveChecks();else staticChecks();
if(warnings.length)console.warn('Warnings:\n'+warnings.slice(0,30).join('\n'));
if(errors.length){console.error('[TLE QA FAILED] '+errors.length+' issue(s):\n'+errors.slice(0,100).join('\n'));process.exitCode=1}
else console.log('[TLE QA PASSED]');
