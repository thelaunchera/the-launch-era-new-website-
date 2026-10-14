import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const allowedOrigins=new Set(["https://thelaunchera.com","https://www.thelaunchera.com","http://localhost:5173","http://127.0.0.1:5173"]);
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const json=(data:unknown,status=200,origin="")=>new Response(JSON.stringify(data),{status,headers:{
  "Content-Type":"application/json","Cache-Control":"no-store",
  "Access-Control-Allow-Origin":allowedOrigins.has(origin)?origin:"https://thelaunchera.com",
  "Access-Control-Allow-Methods":"POST, OPTIONS",
  "Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info",
  "Vary":"Origin"
}});
const clean=(v:unknown,max=240)=>String(v??"").trim().replace(/[\u0000-\u001f<>]/g,"").slice(0,max);
const url=(value:unknown)=>{
  try{const u=new URL(String(value??"").trim());if(u.protocol!=="https:"||u.username||u.password||u.href.length>850)return "";return u.href;}
  catch{return ""}
};
const fields={headline_en:125,headline_es:125,description_en:360,description_es:360,
  offer_en:140,offer_es:140,terms_en:240,terms_es:240,cta_en:70,cta_es:70};
const defaults={enabled:false,headline_en:"",headline_es:"",description_en:"",description_es:"",
  offer_en:"",offer_es:"",terms_en:"",terms_es:"",cta_en:"",cta_es:"",
  image_url:"",starts_at:null,ends_at:null,updated_at:null};
const released=(a:any)=>!!(a&&a.payment_status==="paid"&&a.status==="active"&&a.intake_completed_at&&a.booking_page_url&&a.crm_workspace_id&&a.delivery_sent_at);
function parseDate(value:unknown){
  if(value===null||value===undefined||value==="")return null;
  if(typeof value!=="string"||value.length>45||!(/^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(value)))throw Error("Invalid promotion schedule.");
  const ms=Date.parse(value);
  if(!Number.isFinite(ms))throw Error("Invalid promotion schedule.");
  return new Date(ms).toISOString();
}
function validate(raw:any){
  if(!raw||typeof raw!=="object"||Array.isArray(raw))throw Error("Missing welcome settings.");
  if(typeof raw.enabled!=="boolean")throw Error("Choose whether to publish the welcome message.");
  const result:any={enabled:raw.enabled};
  for(const [field,max] of Object.entries(fields)){
    if(raw[field]!==undefined&&typeof raw[field]!=="string")throw Error("Invalid welcome text.");
    result[field]=clean(raw[field],max as number);
  }
  result.image_url=raw.image_url?url(raw.image_url):"";
  if(raw.image_url&&!result.image_url)throw Error("Please use a secure HTTPS image URL.");
  result.starts_at=parseDate(raw.starts_at);
  result.ends_at=parseDate(raw.ends_at);
  if(result.starts_at&&result.ends_at&&result.starts_at>=result.ends_at)throw Error("End date must be after start date.");
  if(result.enabled&&!result.headline_en&&!result.headline_es&&!result.offer_en&&!result.offer_es)throw Error("Add a headline or promotion before enabling.");
  if((result.offer_en&&!result.terms_en)||(result.offer_es&&!result.terms_es))throw Error("Add promotion terms in the same language as the offer.");
  return result;
}
function hasPasswordSession(token:string){
  try{const segment=token.split(".")[1];const jwt=JSON.parse(atob(segment.replace(/-/g,"+").replace(/_/g,"/")));
    return Array.isArray(jwt.amr)&&jwt.amr.some((entry:any)=>entry?.method==="password");
  }catch{return false}
}
Deno.serve(async(req)=>{
  const origin=req.headers.get("Origin")||"";
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:{
    "Access-Control-Allow-Origin":allowedOrigins.has(origin)?origin:"https://thelaunchera.com",
    "Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info","Vary":"Origin"
  }});
  if(req.method!=="POST")return json({error:"Method not allowed"},405,origin);
  if(origin&&!allowedOrigins.has(origin))return json({error:"Origin not allowed"},403,origin);
  let body:any;
  try{body=await req.json()}catch{return json({error:"Invalid JSON"},400,origin)}
  if(!body||typeof body!=="object")return json({error:"Invalid request"},400,origin);
  const action=clean(body.action,30);
  const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{autoRefreshToken:false,persistSession:false}});
  try{
    if(action==="public"){
      const key=clean(body.booking_key,85);
      if(!uuid.test(key))return json({error:"Invalid Booking Page"},400,origin);
      const {data:a,error:ae}=await admin.from("tle_booking_flow_accounts")
        .select("id,payment_status,status,intake_completed_at,booking_page_url,crm_workspace_id,delivery_sent_at")
        .eq("booking_public_key",key).maybeSingle();
      if(ae||!released(a))return json({welcome:null},200,origin);
      const {data:setting,error:se}=await admin.from("tle_booking_smart_welcome")
        .select("enabled,headline_en,headline_es,description_en,description_es,offer_en,offer_es,terms_en,terms_es,cta_en,cta_es,image_url,starts_at,ends_at,updated_at")
        .eq("account_id",a.id).maybeSingle();
      if(se||!setting?.enabled)return json({welcome:null},200,origin);
      const now=Date.now();
      if((setting.starts_at&&new Date(setting.starts_at).getTime()>now)||(setting.ends_at&&new Date(setting.ends_at).getTime()<=now))return json({welcome:null},200,origin);
      return json({welcome:setting},200,origin);
    }
    if(action!=="get"&&action!=="save")return json({error:"Unknown action"},400,origin);
    const token=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"").trim();
    if(!token)return json({error:"Sign in required"},401,origin);
    const {data:{user},error:ue}=await admin.auth.getUser(token);
    if(ue||!user?.id||!user.email||!user.email_confirmed_at)return json({error:"Verified login required"},401,origin);
    const workspaceId=clean(body.workspace_id,85);
    if(!uuid.test(workspaceId))return json({error:"Workspace required"},400,origin);
    const {data:ws,error:we}=await admin.from("tle_crm_workspaces")
      .select("id,created_by,is_internal,password_login_required,password_setup_completed_at")
      .eq("id",workspaceId).eq("created_by",user.id).maybeSingle();
    if(we||!ws)return json({error:"Workspace access denied"},403,origin);
    if(!ws.is_internal&&ws.password_login_required===true&&(!ws.password_setup_completed_at||!hasPasswordSession(token)))return json({error:"Password login required"},403,origin);
    const requestedBuyerId=clean(body.owner_account_id,85);
    if(requestedBuyerId&&(!ws.is_internal||!uuid.test(requestedBuyerId)))return json({error:"Owner-only editing"},403,origin);
    const q=admin.from("tle_booking_flow_accounts")
      .select("id,business_name,owner_email,payment_status,status,intake_completed_at,booking_page_url,crm_workspace_id,delivery_sent_at");
    const {data:account,error:ae}=requestedBuyerId
      ?await q.eq("id",requestedBuyerId).maybeSingle()
      :await q.eq("crm_workspace_id",ws.id).maybeSingle();
    if(ae||!released(account))return json({error:"Booking Page is not delivered"},403,origin);
    if(!ws.is_internal&&(account.crm_workspace_id!==ws.id||String(account.owner_email||"").toLowerCase()!==String(user.email).toLowerCase()))return json({error:"Account access denied"},403,origin);
    if(action==="get"){
      const {data:existing,error:ge}=await admin.from("tle_booking_smart_welcome")
        .select("enabled,headline_en,headline_es,description_en,description_es,offer_en,offer_es,terms_en,terms_es,cta_en,cta_es,image_url,starts_at,ends_at,updated_at")
        .eq("account_id",account.id).maybeSingle();
      if(ge)return json({error:"Could not load settings"},500,origin);
      return json({welcome:{...defaults,...existing},business_name:account.business_name},200,origin);
    }
    const config=validate(body.config);
    const {data:created,error:se}=await admin.from("tle_booking_smart_welcome")
      .upsert({...config,account_id:account.id,updated_at:new Date().toISOString(),updated_by:user.id},{onConflict:"account_id"})
      .select("updated_at").single();
    if(se)return json({error:"Could not save welcome settings"},500,origin);
    return json({ok:true,enabled:config.enabled,updated_at:created.updated_at},200,origin);
  }catch(error){
    return json({error:error instanceof Error?error.message:"Request failed"},400,origin);
  }
});