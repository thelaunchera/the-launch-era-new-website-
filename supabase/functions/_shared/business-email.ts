import {createClient} from "npm:@supabase/supabase-js@2.57.0";
const esc=(v:unknown)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
export async function decorateBusinessEmail(accountId:string,business:string,content:string,es=false){
 const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!key)throw Error("Business legal configuration unavailable");
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:a,error}=await db.from("tle_booking_flow_accounts").select("id,business_name,booking_public_key").eq("id",accountId).maybeSingle();
 if(error||!a?.booking_public_key)throw Error("Business legal links unavailable");
 const lang=es?"es":"en",cb=String(a.business_name||"").trim().toLowerCase()==="cb depot";
 const privacy=cb?"https://thelaunchera.com/cb-depot/privacy/?booking_key="+encodeURIComponent(a.booking_public_key):
 "https://thelaunchera.com/client-legal/?key="+encodeURIComponent(a.booking_public_key)+"&policy=privacy&lang="+lang;
 const terms=cb?"https://thelaunchera.com/cb-depot/terms/?booking_key="+encodeURIComponent(a.booking_public_key):
 "https://thelaunchera.com/client-legal/?key="+encodeURIComponent(a.booking_public_key)+"&policy=terms&lang="+lang;
 const footer='<table role="presentation" style="width:100%;max-width:580px;margin:12px auto;border-collapse:collapse"><tr><td style="padding:14px 20px;color:#555;font:12px Arial,sans-serif;line-height:1.7;text-align:center">'+esc(business)+
 '<br><a href="'+esc(privacy)+'" style="color:#285b77">'+(es?"Privacidad":"Privacy Policy")+'</a> · <a href="'+esc(terms)+'" style="color:#285b77">'+(es?"Términos del servicio":"Service Terms")+'</a>'+
 '<br><a href="https://thelaunchera.com/" style="color:#555;font-size:11px">Powered by The Launch Era</a></td></tr></table>';
 const cleaned=content.replace(/<a\b[^>]*>\s*Powered by The Launch Era\s*<\/a>/gi,"");
 return {html:/<\/body>/i.test(cleaned)?cleaned.replace(/<\/body>/i,footer+"</body>"):cleaned+footer,
 textSuffix:"\n\n"+business+"\n"+(es?"Privacidad: ":"Privacy Policy: ")+privacy+"\n"+(es?"Términos: ":"Service Terms: ")+terms+"\nPowered by The Launch Era"};
}
export async function sendBusinessEmail(payload:any,es=false){
 const api=Deno.env.get("TLE_CRM_RESEND_API_KEY");if(!api||!payload.business_id||!payload.outbox_id)return false;
 try{
  let content=String(payload.email_html||""),unsubscribe="";
  if(payload.optional_email===true){
   const raw=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,"0")).join("");
   const hash=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(raw));const tokenHash=Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,"0")).join("");
   const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
   const {data,error}=await db.rpc("tle_booking_managed_unsubscribe_create",{p_lead_id:String(payload.outbox_id),p_hash:tokenHash});if(error||data!==true)return false;
   unsubscribe=Deno.env.get("SUPABASE_URL")+"/functions/v1/tle-booking-managed-unsubscribe?token="+raw;
   const link='<p style="text-align:center;font:12px Arial,sans-serif"><a href="'+esc(unsubscribe)+'">'+(es?"Cancelar correos opcionales":"Unsubscribe from optional emails")+'</a></p>';
   content=/<\/body>/i.test(content)?content.replace(/<\/body>/i,link+"</body>"):content+link;
  }
  const decorated=await decorateBusinessEmail(String(payload.business_id),String(payload.business_name||"Your business"),content,es);
  const recipient=String(payload.customer_email||"").trim().toLowerCase();
  const event=String(payload.event_key||payload.email_role||"")+":"+String(payload.outbox_id)+":"+recipient+":"+String(payload.email_subject||"");
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(event));
  const id=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,"0")).join("");
  const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+api,"Content-Type":"application/json","Idempotency-Key":payload.email_role?"tle-inquiry-"+String(payload.outbox_id)+"-"+String(payload.email_role):"tle-business-"+id},
   body:JSON.stringify({from:String(payload.business_name||"Your business").replace(/[\r\n<>"]/g,"").slice(0,85)+" <hello@thelaunchera.com>",
    to:[recipient],reply_to:payload.reply_to,subject:payload.email_subject,html:decorated.html,...(unsubscribe?{headers:{"List-Unsubscribe":"<"+unsubscribe+">","List-Unsubscribe-Post":"List-Unsubscribe=One-Click"}}:{})}),signal:AbortSignal.timeout(12500)});
  const result=await response.json().catch(()=>({}));return response.ok&&typeof result.id==="string";
 }catch{return false}
}
