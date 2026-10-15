import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.57.0";
const URL=Deno.env.get("SUPABASE_URL")||"",SECRET=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const ORIGINS=new Set(["https://thelaunchera.com","https://www.thelaunchera.com","https://thelaunchera.github.io"]);
const events=new Set(["opened","lead_start","lead_saved","demo_open","demo_close","demo_lead_saved","diagnostic","comparison","pricing","recommendation","client_help","language_switch","answered"]);
const services=new Set(["general","booking","cleaning-app","website","va","ai-booking","ai-followup","ai-business"]);
const intents=new Set(["general","demo","client_help","comparison","pricing","followups","operations","bookings"]);
const headers=(origin:string)=>({"Content-Type":"application/json","Cache-Control":"no-store","Vary":"Origin","Access-Control-Allow-Origin":ORIGINS.has(origin)?origin:"https://thelaunchera.com","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"content-type,authorization"});
const respond=(body:unknown,status:number,origin:string)=>new Response(JSON.stringify(body),{status,headers:headers(origin)});
const json=(x:unknown)=>typeof x==="string"?x:"";
Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(origin)});
 if(!ORIGINS.has(origin))return respond({error:"Not allowed"},403,origin);
 if(!URL||!SECRET)return respond({error:"Not configured"},503,origin);
 const db=createClient(URL,SECRET,{auth:{persistSession:false,autoRefreshToken:false}});
 if(req.method==="GET"){
  const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
  if(!token)return respond({error:"Owner authentication required"},401,origin);
  const {data:{user},error}=await db.auth.getUser(token);
  if(error||!user)return respond({error:"Owner authentication required"},401,origin);
  const {data:admin,error:ae}=await db.from("platform_admins").select("user_id").eq("user_id",user.id).maybeSingle();
  if(ae||!admin)return respond({error:"Owner only"},403,origin);
  const from=new Date(Date.now()-14*86400000).toISOString();
  const {data:rows,error:re}=await db.from("tle_jessie_metrics").select("event_type,service,intent,language,created_at").gte("created_at",from).order("created_at",{ascending:false}).limit(10000);
  if(re)return respond({error:"Insights temporarily unavailable"},503,origin);
  const summary={total:(rows||[]).length,events:{} as Record<string,number>,services:{} as Record<string,number>,intents:{} as Record<string,number>,languages:{} as Record<string,number>,days:{} as Record<string,number>};
  for(const row of rows||[]){
   summary.events[row.event_type]=(summary.events[row.event_type]||0)+1;
   summary.services[row.service]=(summary.services[row.service]||0)+1;
   summary.intents[row.intent]=(summary.intents[row.intent]||0)+1;
   summary.languages[row.language]=(summary.languages[row.language]||0)+1;
   const day=String(row.created_at).slice(0,10);summary.days[day]=(summary.days[day]||0)+1;
  }
  return respond({ok:true,window_days:14,anonymous:true,summary},200,origin);
 }
 if(req.method!=="POST")return respond({error:"Method not allowed"},405,origin);
 if(Number(req.headers.get("content-length")||0)>350)return respond({error:"Too large"},413,origin);
 const body=await req.json().catch(()=>null);
 const event=json(body?.event),service=json(body?.service),intent=json(body?.intent),language=json(body?.language);
 if(!events.has(event)||!services.has(service)||!intents.has(intent)||!["en","es"].includes(language))return respond({error:"Invalid event"},400,origin);
 // Purely anonymous aggregated counters; abuse throttled without recording identifiers.
 try{
  const ip=(req.headers.get("cf-connecting-ip")||req.headers.get("x-forwarded-for")||"anonymous").slice(0,100);
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(ip));
  const hashed=[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,"0")).join("");
  const hour=new Date();hour.setUTCMinutes(0,0,0);
  const r=await fetch(URL+"/rest/v1/rpc/tle_ai_demo_consume",{method:"POST",headers:{apikey:SECRET,Authorization:"Bearer "+SECRET,"Content-Type":"application/json"},body:JSON.stringify({p_key:"jessie-metrics:"+hashed,p_window:hour.toISOString(),p_limit:120}),signal:AbortSignal.timeout(3500)});
  if(!r.ok||(await r.json())!==true)return respond({ok:false},429,origin);
 }catch{return respond({ok:false},503,origin)}
 const {error:insertError}=await db.from("tle_jessie_metrics").insert({event_type:event,service,intent,language});
 return insertError?respond({ok:false},503,origin):respond({ok:true},200,origin);
});
