import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const ui=readFileSync("public/command-center/assets/ai-team.js","utf8");
const start=ui.indexOf("window.TLEAIOpsGateway=Object.freeze({");
const end=ui.indexOf('\\n$("lang").addEventListener',start);
assert.ok(start>=0);
const boundary=end>=0?end:ui.indexOf('$("lang").addEventListener',start);
assert.ok(boundary>start);
const code=ui.slice(start,boundary)+";window.TLEAIOpsGateway;";
const calls=[];
let refreshed=0,scrolled=0;
const context={
 window:{},
 document:{getElementById(id){
   if(id==="app")return {classList:{contains:()=>false}};
   if(id==="outputs-section")return {scrollIntoView:()=>scrolled++};
 }},
 verified:true,
 agents:[{key:"qa"},{key:"sales"}],
 language:"es",
 refresh:async()=>{refreshed++},
 api:async payload=>{
   calls.push(payload);
   if(payload.action==="create")return {task:{id:"sample-id",agent_key:payload.agent_key}};
   if(payload.action==="compose_output")return {output:{status:"draft",content:"Uns ent review draft"}};
   throw Error("Unexpected API call");
 }
};
const gateway=vm.runInNewContext(code,context);
await gateway.create("qa","Jessie, crea una tarea para QA revisar los enlaces del demo");
await gateway.draft("sales","Jessie, prepara un borrador de email para mis leads");
assert.deepEqual(calls.map(x=>x.action),["create","create","compose_output"]);
assert.equal(calls[0].agent_key,"qa");
assert.equal(calls[1].agent_key,"sales");
assert.equal(calls[2].id,"sample-id");
assert.equal(scrolled,1);
assert.equal(refreshed,3);
context.verified=false;
await assert.rejects(gateway.create("qa","Test"),/Owner AI Team access required/);
assert.equal(calls.length,3);
console.log("PASS authenticated gateway request sequence and unauthorized denial");
