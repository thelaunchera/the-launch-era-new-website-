/**
 * Safe production smoke: verifies unauthenticated/invalid-origin requests are denied.
 * Sends no credentials, customer data or mutations. It cannot replace signed-in E2E QA.
 */
import assert from "node:assert/strict";

const base="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/";
const checks=[
 ["tle-ai-team",{action:"list"}],
 ["tle-ai-team",{action:"team_brief",language:"es"}],
 ["tle-ai-team",{action:"capability_manifest"}],
 ["tle-ai-team",{action:"run_agent",agent_key:"sales"}],
 ["tle-jessy-owner",{message:"Check my priorities",language:"en"}],
 ["tle-jessy-owner",{action:"team_brief",language:"es"}],
 ["tle-jessy-owner",{action:"client_readiness",language:"en"}]
];
async function attempt(fn,body,headers={}){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),12000);
 try {
  const r=await fetch(base+fn,{method:"POST",headers:{"Content-Type":"application/json",...headers},body:JSON.stringify(body),signal:controller.signal});
  const text=await r.text();
  assert.ok(text.length<10000,"Unexpected excessive unauthenticated response");
  return {status:r.status,body:text,allowOrigin:r.headers.get("access-control-allow-origin")};
 } finally {clearTimeout(timeout)}
}
for(const [fn,body] of checks){
 for(const scenario of [
  {name:"anonymous",headers:{}},
  {name:"spoofed origin",headers:{Origin:"https://untrusted.invalid"}},
  {name:"invalid bearer",headers:{Origin:"https://thelaunchera.com",Authorization:"Bearer invalid-fixture-token"}}
 ]){
  const r=await attempt(fn,body,scenario.headers);
  assert.ok([401,403].includes(r.status),fn+" "+scenario.name+" must deny access: HTTP "+r.status);
  assert.doesNotMatch(r.body,/\b(?:business_name|owner_email|client_name|access_token|service_role_key)\b/i,
    "Private field must not be emitted for denied request");
  assert.notEqual(r.allowOrigin,"https://untrusted.invalid","untrusted origin must not be allowed via CORS");
  console.log("PASS",fn,body.action||"message",scenario.name,"HTTP",r.status);
 }
}
console.log("PASS — anonymous/invalid-owner and untrusted-origin smoke checks. Signed-in tenant E2E is still required.");
