import assert from "node:assert/strict";

const url="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-public-purchase-proof";
const origin="https://thelaunchera.com";
const request=(method,requestOrigin=origin)=>fetch(url,{
 method,headers:{Origin:requestOrigin},redirect:"follow",
 signal:AbortSignal.timeout(14000)
});
const get=await request("GET");
assert.equal(get.status,200,"Read-only public purchase proof should be available");
assert.equal(get.headers.get("access-control-allow-origin"),origin);
const data=await get.json();
assert.equal(typeof data.show,"boolean");
assert.deepEqual(Object.keys(data).sort(),data.show?["kind","show"]:["show"]);
if(data.show)assert(["booking","booking_bundle"].includes(data.kind));
const raw=JSON.stringify(data);
assert(!/@|cs_live_|cs_test_|stripe|customer|email|business_name|amount|timestamp|last_name|first_name/i.test(raw),"Private payment details cannot leak");
const options=await request("OPTIONS");
assert.equal(options.status,204,"CORS preflight must work");
assert.match(options.headers.get("access-control-allow-methods")||"",/GET/);
const invalid=await request("POST");
assert.equal(invalid.status,405,"Non-GET requests must not write");
const hostile=await request("GET","https://untrusted.example");
assert.equal(hostile.status,403,"Unapproved cross-origin GET must be rejected");
console.log("LIVE purchase proof: GET, anonymized data, CORS, invalid method and origin checks passed. Real eligible sale visible:",data.show);
