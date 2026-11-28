// Read-only static regression checks; no network, payments, email or customer data.
// Run: node scripts/qa-pop-peel-shared-commerce.mjs
// Source-level guardrails only: browser, provider and entitlement QA remain required.
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
const paths={
  "shop": "public/pop-and-peel/index.html",
  "cards": "public/pop-and-peel/cards/index.html",
  "planners": "public/pop-and-peel/planners/index.html",
  "delivery": "public/pop-and-peel/download/index.html",
  "receive": "public/pop-and-peel/cards/receive/index.html",
  "access": "public/pop-and-peel/planners/planner-access.js",
  "renderer": "public/pop-and-peel/cards/renderer.js",
  "studio": "public/pop-peel-studio/index.html"
};
function check(s){
 const out=[];const test=(name,ok)=>out.push({name,ok:!!ok});
 const key="popPeelSelectionV1";
 for(const page of ["shop","cards","planners"])test(page+" shares the cart storage key",s[page].includes(key));
 test("checkout forwards all four product families and server quote",["singles:","packs:","cards:","planners:","expected_total:"].every(x=>s.shop.includes(x)));
 test("storefront preserves other product selections on save",s.shop.includes("if(!cardsChanged)")&&s.shop.includes("if(!plannersChanged)"));
 test("card editor retains planner selections",/planners\s*:\s*Array\.isArray/.test(s.cards));
 test("planner shop links to shared bag",s.planners.includes("bag=1"));
 test("order library supports all three delivery families",["d.stickers","d.cards","d.planners"].every(x=>s.delivery.includes(x)));
 test("order token is removed from URL fragment",s.delivery.includes("history.replaceState")&&s.delivery.includes("location.hash"));
 test("recipient link calls isolated gift endpoint",s.receive.includes("pop-peel-card-gift")&&s.receive.includes("location.hash"));
 test("paid planner path passes token to entitlement endpoint",s.access.includes("purchase_token:")&&s.access.includes("pop-peel-planner-app"));
 test("paid planner path removes fragment",s.access.includes("history.replaceState")&&s.access.includes("location.hash"));
 test("card renderer provides PNG, PDF, HTML",/window\.PopPeelCards\s*=\s*\{[^}]*\bpng\b[^}]*\bpdf\b[^}]*\bhtml\b/.test(s.renderer));
 for(const [page,source] of Object.entries(s))test(page+" has no unresolved merge markers",!/^<{7} |^={7}$|^>{7} /m.test(source));
 return out;
}
const root=new URL('../',import.meta.url);
const s=Object.fromEntries(Object.entries(paths).map(([key,path])=>[key,readFileSync(fileURLToPath(new URL(path,root)),'utf8')]));
const results=check(s);
for(const [key,source] of Object.entries(s)){
 const snippets=paths[key].endsWith('.js')?[source]:[...source.matchAll(/<script\\b([^>]*)>([\\s\\S]*?)<\\/script\\s*>/gi)].filter(m=>! /\\bsrc\\s*=/.test(m[1])&&! /\\btype\\s*=\\s*['"](?:application\\/ld\\+json|application\\/json|module)['"]/i.test(m[1])).map(m=>m[2]);
 for(const [i,code] of snippets.entries()){try{new Script(code,{filename:paths[key]+':script-'+i});results.push({name:key+' script '+i+' parses',ok:true})}catch(e){results.push({name:key+' script '+i+' parses: '+e.message,ok:false})}}
}
for(const {name,ok} of results)console.log((ok?'PASS ':'FAIL ')+name);
const failures=results.filter(x=>!x.ok).length;
console.log((results.length-failures)+'/'+results.length+' source checks passed');
if(failures)process.exitCode=1;
