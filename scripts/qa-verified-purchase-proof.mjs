import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const client=fs.readFileSync("public/assets/tle-purchase-proof.js","utf8");
const server=fs.readFileSync("supabase/functions/tle-public-purchase-proof/index.ts","utf8");
const css=fs.readFileSync("public/assets/tle-purchase-proof.css","utf8");
const root=fs.readFileSync("src/routes/__root.tsx","utf8");

assert.match(root,/tle-purchase-proof\.css/);
assert.match(root,/tle-purchase-proof\.js/);
assert.match(server,/payment_status","eq\.paid"/);
assert.match(server,/payment_provider","eq\.stripe"/);
assert.match(server,/\^cs_live_/);
assert.match(server,/Date\.now\(\)-7\*86400000/);
assert.match(server,/return respond\(\{show:false\}/);
assert.doesNotMatch(server,/response\(\{[^\n]*customer_email|body\.customer_email/);
assert.match(css,/prefers-reduced-motion/);
assert.match(css,/safe-area-inset-bottom/);

function makeNode(tag="div"){
 const attrs={},listeners={};
 const classes=new Set();
 return {
  tag,attrs,listeners,children:[],textContent:"",className:"",removed:false,
  classList:{add(value){classes.add(value)},remove(value){classes.delete(value)},contains(value){return classes.has(value)}},
  setAttribute(k,v){attrs[k]=String(v)},
  append(...nodes){this.children.push(...nodes)},
  appendChild(node){this.children.push(node);return node},
  addEventListener(k,fn){listeners[k]=fn},
  remove(){this.removed=true}
 };
}
async function scenario({path="/",response={show:true,kind:"booking"},status=200,language="en",blocked=false,stored=false}={}){
 const elements=[],timers=[],storage=new Map(stored?[["tle_verified_purchase_notice_shown_v1","yes"]]:[]);
 const body=makeNode("body");body.classList.contains=(n)=>blocked&&n==="tle-jessy-open";
 body.appendChild=e=>{elements.push(e);return e};
 const doc={
  readyState:"complete",visibilityState:"visible",body,
  createElement:makeNode,
  querySelector:()=>null,
  addEventListener:()=>{}
 };
 const window={
  setTimeout(fn,time){timers.push({fn,time});return timers.length},
  clearTimeout(){},requestAnimationFrame(fn){fn()}
 };
 let fetches=0;
 const scope={
  window,document:doc,location:{pathname:path},sessionStorage:{
   getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)
  },AbortController,fetch:async(_url,options)=>{
   fetches++;
   assert.equal(options.method,"GET");
   return {ok:status===200,status,json:async()=>response};
  }
 };
 vm.runInNewContext(client,scope,{timeout:1000});
 await new Promise(resolve=>setImmediate(resolve));
 const fire=time=>{
  const index=timers.findIndex(t=>t.time===time);
  if(index!==-1)timers.splice(index,1)[0].fn();
 };
 fire(7500);
 const popup=elements[0];
 return {popup,fetches,fire,storage,elements};
}
let ok=await scenario();
assert.equal(ok.fetches,1);
assert.ok(ok.popup,"Verified purchase should create popup");
assert.match(ok.popup.children[1].children[0].textContent,/recently purchased Booking Automation/);
assert.equal(ok.popup.children[1].children[1].textContent,"Verified recent purchase · The Launch Era");
assert.equal(ok.popup.attrs.role,"status");
assert.equal(ok.storage.get("tle_verified_purchase_notice_shown_v1"),"yes");
ok.fire(4000);ok.fire(300);assert.equal(ok.popup.removed,true);
const spanish=await scenario({path:"/es/",response:{show:true,kind:"booking_bundle"},language:"es"});
assert.match(spanish.popup.children[1].children[0].textContent,/compró recientemente Booking \+ AI/);
for(const response of [{show:false},{show:true,kind:"fake"},{},null]){
 const result=await scenario({response});assert.equal(result.popup,undefined,"No popup unless explicitly verified");
}
for(const path of ["/service-checkout/","/command-center/","/lead-private-preview.html","/booking-demo/","/client-review/"]){
 const result=await scenario({path});assert.equal(result.fetches,0);assert.equal(result.popup,undefined);
}
assert.equal((await scenario({blocked:true})).popup,undefined,"No popup over open chat");
assert.equal((await scenario({stored:true})).fetches,0,"At most once per tab session");
assert.equal((await scenario({status:503})).popup,undefined,"Fail closed on unavailable provider");
console.log("Verified purchase notice: EN/ES, privacy, failure, route, timing, dismissal, chat safety checks passed");
