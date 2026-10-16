import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Public, privacy-preserving social proof. Read-only. No names, emails,
// business data, session IDs, amounts, timestamps or exact sales counts leave the server.
const allowedOrigins=new Set(["https://thelaunchera.com","https://www.thelaunchera.com"]);
const base=Deno.env.get("SUPABASE_URL")||"";
const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
function headers(origin:string){
  return {
    "Content-Type":"application/json; charset=utf-8",
    "Access-Control-Allow-Origin":allowedOrigins.has(origin)?origin:"https://thelaunchera.com",
    "Access-Control-Allow-Methods":"GET, OPTIONS",
    "Access-Control-Allow-Headers":"content-type",
    "Cache-Control":"public, max-age=60, s-maxage=60",
    "Referrer-Policy":"no-referrer",
    "X-Content-Type-Options":"nosniff",
    "Vary":"Origin"
  };
}
function respond(body:unknown, status:number, origin:string) {
  return new Response(JSON.stringify(body),{status,headers:headers(origin)});
}
Deno.serve(async request=>{
  const origin=request.headers.get("origin")||"";
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers:headers(origin)});
  if(request.method!=="GET")return respond({show:false},405,origin);
  if(origin&&!allowedOrigins.has(origin))return respond({show:false},403,origin);
  if(!base||!serviceKey)return respond({show:false},503,origin);
  try{
    const since=new Date(Date.now()-7*86400000).toISOString();
    const url=new URL(base+"/rest/v1/tle_booking_flow_accounts");
    url.searchParams.set("select","product_code,ai_addon_offer,stripe_session_id");
    url.searchParams.set("payment_status","eq.paid");
    url.searchParams.set("payment_provider","eq.stripe");
    url.searchParams.set("payment_paid_at","gte."+since);
    url.searchParams.set("order","payment_paid_at.desc");
    url.searchParams.set("limit","30");
    const result=await fetch(url,{
      headers:{"apikey":serviceKey,"Authorization":"Bearer "+serviceKey},
      signal:AbortSignal.timeout(5000)
    });
    if(!result.ok)return respond({show:false},503,origin);
    const rows=await result.json();
    if(!Array.isArray(rows))return respond({show:false},503,origin);
    // These payment rows are recorded only after an actual, verified live
    // Stripe Checkout session. Never infer purchases from visits, forms,
    // checkout clicks, simulations, paid-looking URLs or Cleaning App payments.
    const paid=rows.find(row=>
      row?.product_code==="booking_flow_setup"&&
      typeof row.stripe_session_id==="string"&&
      /^cs_live_[A-Za-z0-9_]+$/.test(row.stripe_session_id));
    if(!paid)return respond({show:false},200,origin);
    const bundled=["ai-booking","ai-followup","ai-business"].includes(paid.ai_addon_offer);
    return respond({show:true,kind:bundled?"booking_bundle":"booking"},200,origin);
  }catch{
    return respond({show:false},503,origin);
  }
});
