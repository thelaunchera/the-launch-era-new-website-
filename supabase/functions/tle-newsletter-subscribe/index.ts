import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const allowed = ["https://thelaunchera.com","https://www.thelaunchera.com","https://thelaunchera.github.io"];
Deno.serve(async(req: Request)=>{
 const origin=req.headers.get("origin")||"";
 const headers={
  "Content-Type":"application/json","Cache-Control":"no-store",
  "Access-Control-Allow-Origin":allowed.includes(origin)?origin:allowed[0],
  "Access-Control-Allow-Methods":"POST, OPTIONS",
  "Access-Control-Allow-Headers":"Content-Type","Vary":"Origin"
 };
 const out=(status:number,ok:boolean)=>new Response(JSON.stringify({ok}),{status,headers});
 if(req.method==="OPTIONS")return new Response(null,{status:allowed.includes(origin)?204:403,headers});
 if(req.method!=="POST")return out(405,false);
 if(origin&&!allowed.includes(origin))return out(403,false);
 let data;
 try{data=await req.json()}catch{return out(400,false)}
 const email=typeof data?.email==="string"?data.email.trim().toLowerCase():"";
 if(data?.consent!==true||email.length>254||!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(email))return out(400,false);
 if(typeof data?.company_web==="string"&&data.company_web.trim())return out(200,true);
 if(!Number.isFinite(Number(data.started_at))||Date.now()-Number(data.started_at)<800)return out(429,false);
 const url=Deno.env.get("SUPABASE_URL");
 const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!key)return out(503,false);
 try{
  const result=await fetch(url+"/rest/v1/tle_newsletter_subscribers?on_conflict=email",{
    method:"POST",
    headers:{"Content-Type":"application/json","apikey":key,"Authorization":"Bearer "+key,"Prefer":"resolution=merge-duplicates,return=minimal"},
    body:JSON.stringify({email,language:data.language==="es"?"es":"en",status:"subscribed",consent_source:"site_footer",consent_at:new Date().toISOString(),updated_at:new Date().toISOString()})
  });
  if(!result.ok){console.error("newsletter write error",result.status);return out(503,false)}
  return out(200,true);
 }catch{ return out(503,false) }
});