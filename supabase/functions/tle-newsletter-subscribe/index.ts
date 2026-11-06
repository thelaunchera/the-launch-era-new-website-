import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const ALLOWED=new Set(["https://thelaunchera.com","https://www.thelaunchera.com","https://thelaunchera.github.io"]);
const ORIGIN_DEFAULT="https://thelaunchera.com";
const API=Deno.env.get("SUPABASE_URL")||"";
function secret(){let v={};try{v=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}")}catch{}return (v as Record<string,string>).default||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||""}
const KEY=secret();
function cors(origin:string,contentType="application/json; charset=utf-8"){return {"Content-Type":contentType,"Cache-Control":"no-store","Access-Control-Allow-Origin":ALLOWED.has(origin)?origin:ORIGIN_DEFAULT,"Access-Control-Allow-Methods":"POST,GET,OPTIONS","Access-Control-Allow-Headers":"content-type","Vary":"Origin","X-Content-Type-Options":"nosniff"}}
const json=(origin:string,status:number,body:object)=>new Response(JSON.stringify(body),{status,headers:cors(origin)});
const base64url=(data:Uint8Array)=>btoa(String.fromCharCode(...data)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
function from64url(encoded:string){const s=encoded.replace(/-/g,"+").replace(/_/g,"/");return Uint8Array.from(atob(s+"=".repeat((4-s.length%4)%4)),c=>c.charCodeAt(0))}
function validEmail(x:string){return x.length<=254&&/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(x)}
async function hmacKey(){return crypto.subtle.importKey("raw",new TextEncoder().encode(KEY),{name:"HMAC",hash:"SHA-256"},false,["sign","verify"])}
async function signedToken(email:string){
 const body=base64url(new TextEncoder().encode(email));
 const sig=await crypto.subtle.sign("HMAC",await hmacKey(),new TextEncoder().encode("tle-newsletter-unsubscribe-v1:"+body));
 return body+"."+base64url(new Uint8Array(sig))
}
async function emailFromToken(token:string){
 const parts=token.split(".");
 if(parts.length!==2||parts[0].length>400||parts[1].length>120)return "";
 try {
  const valid=await crypto.subtle.verify("HMAC",await hmacKey(),from64url(parts[1]),new TextEncoder().encode("tle-newsletter-unsubscribe-v1:"+parts[0]));
  if(!valid)return "";
  const email=new TextDecoder().decode(from64url(parts[0]));
  return validEmail(email)&&email===email.toLowerCase()?email:"";
 }catch{return ""}
}
function page(message:string,email:string,token:string,success=false){
 const escaped=email.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
 const action="?unsubscribe="+encodeURIComponent(token);
 return '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>The Launch Era · Email preferences</title></head><body style="margin:0;background:#FAF8F3;color:#191919;font-family:Arial,Helvetica,sans-serif"><main style="max-width:480px;margin:8vh auto;padding:28px;background:#FFFEFB;border:1px solid #DEE5E6;border-radius:18px"><p style="font-size:12px;letter-spacing:2px;color:#48718b">THE LAUNCH ERA</p><h1 style="font:normal 34px/1.2 Georgia,serif">Email preferences</h1><p style="font-size:15px;line-height:1.7">'+message+'</p><p style="font-size:14px;overflow-wrap:anywhere;color:#52616a">'+escaped+'</p>'+(success?"":'<form method="post" action="'+action+'"><button type="submit" style="background:#191919;color:#fff;padding:15px 22px;border:0;border-radius:10px;font-size:15px;cursor:pointer">Confirm unsubscribe</button></form>')+'<p style="font-size:12px;margin-top:28px"><a href="https://thelaunchera.com/" style="color:#426c85">The Launch Era</a></p></main></body></html>';
}
const db=(path:string,method="GET",body?:object,prefer?:string)=>fetch(API+"/rest/v1/"+path,{method,headers:{"apikey":KEY,"Authorization":"Bearer "+KEY,"Content-Type":"application/json",...(prefer?{"Prefer":prefer}:{})},...(body?{body:JSON.stringify(body)}:{})});
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:ALLOWED.has(origin)?204:403,headers:cors(origin)});
 if(!API||!KEY)return json(origin,503,{ok:false});
 const input=new URL(req.url);
 const unsub=input.searchParams.get("unsubscribe");
 if(unsub!==null&&(req.method==="GET"||req.method==="POST")){
  const email=await emailFromToken(unsub);
  if(!email)return new Response("This unsubscribe link is invalid.",{status:400,headers:cors(origin,"text/plain; charset=utf-8")});
  if(req.method==="GET")return new Response(page("Confirm below to stop receiving The Launch Era newsletter.",email,unsub),{status:200,headers:cors(origin,"text/html; charset=utf-8")});
  const r=await db("tle_newsletter_subscribers?email=eq."+encodeURIComponent(email),"PATCH",{status:"unsubscribed",updated_at:new Date().toISOString()},"return=minimal");
  if(!r.ok)return new Response(page("We could not change your preference. Please try again.",email,unsub),{status:503,headers:cors(origin,"text/html; charset=utf-8")});
  return new Response(page("You are unsubscribed. No further newsletters will be sent unless you subscribe again.",email,unsub,true),{status:200,headers:cors(origin,"text/html; charset=utf-8")});
 }
 if(req.method!=="POST")return json(origin,405,{ok:false});
 if(origin&&!ALLOWED.has(origin))return json(origin,403,{ok:false});
 let data:any;try{data=await req.json()}catch{return json(origin,400,{ok:false})}
 const email=typeof data?.email==="string"?data.email.trim().toLowerCase():"";
 const now=Date.now(),started=Number(data?.started_at);
 if(data?.consent!==true||!validEmail(email))return json(origin,400,{ok:false});
 if(typeof data.company_web==="string"&&data.company_web.trim())return json(origin,200,{ok:true});
 if(!Number.isFinite(started)||now-started<800||now-started>86400000)return json(origin,429,{ok:false});
 const lang=data.language==="es"?"es":"en",at=new Date().toISOString();
 try{
  const created=await db("tle_newsletter_subscribers?on_conflict=email","POST",{email,language:lang,status:"subscribed",consent_source:"site_footer",consent_at:at,updated_at:at},"resolution=ignore-duplicates,return=minimal");
  if(!created.ok)return json(origin,503,{ok:false});
  // A fresh affirmative opt-in may reactivate a previously unsubscribed address; never opt in via another product's form.
  const rejoin=await db("tle_newsletter_subscribers?email=eq."+encodeURIComponent(email)+"&status=eq.unsubscribed","PATCH",{status:"subscribed",language:lang,consent_source:"site_footer",consent_at:at,updated_at:at},"return=minimal");
  if(!rejoin.ok)return json(origin,503,{ok:false});
  const cutoff=encodeURIComponent(new Date(Date.now()-15*60*1000).toISOString());
  const filter="tle_newsletter_subscribers?email=eq."+encodeURIComponent(email)+"&status=eq.subscribed&welcome_sent_at=is.null&or=(welcome_claimed_at.is.null,welcome_claimed_at.lt."+cutoff+")&select=id,email";
  const claimed=await db(filter,"PATCH",{welcome_claimed_at:at},"return=representation");
  if(!claimed.ok){console.error("newsletter claim failed",claimed.status);return json(origin,200,{ok:true})}
  const rows=await claimed.json().catch(()=>[]);
  if(!Array.isArray(rows)||rows.length===0)return json(origin,200,{ok:true});
  const row=rows[0],route=await db("tle_private_mail_hooks?kind=eq.newsletter&select=endpoint");
  const hooks=route.ok?await route.json().catch(()=>[]):[];
  const endpoint=Array.isArray(hooks)?hooks[0]?.endpoint:"";
  if(!endpoint)throw Error("Newsletter delivery is not configured");
  const token=await signedToken(email);
  const unsubscribe_url=API+"/functions/v1/tle-newsletter-subscribe?unsubscribe="+encodeURIComponent(token);
  let accepted=false;
  try{
   const delivery=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event_type:"newsletter_welcome",email,language:lang,template_id:lang==="es"?"3070853d-8093-49b0-a629-2ae993558853":"5f885033-54c8-493e-bf58-73c7ae99a32b",event_key:"newsletter-"+row.id,unsubscribe_url,is_test:false}),signal:AbortSignal.timeout(10000)});
   const output=await delivery.json().catch(()=>({}));
   accepted=delivery.ok&&output.ok===true&&typeof output.resend_id==="string"&&!!output.resend_id;
  }catch(e){console.error("newsletter delivery unavailable",String(e).slice(0,90))}
  if(accepted){
   const confirm=await db("tle_newsletter_subscribers?email=eq."+encodeURIComponent(email)+"&status=eq.subscribed","PATCH",{welcome_sent_at:new Date().toISOString(),welcome_claimed_at:null},"return=minimal");
   if(!confirm.ok)console.error("newsletter delivery marker unavailable",confirm.status);
  }else{
   await db("tle_newsletter_subscribers?email=eq."+encodeURIComponent(email)+"&welcome_sent_at=is.null","PATCH",{welcome_claimed_at:null},"return=minimal");
  }
  return json(origin,200,{ok:true});
 }catch(e){console.error("newsletter signup",String(e).slice(0,95));return json(origin,503,{ok:false})}
});
