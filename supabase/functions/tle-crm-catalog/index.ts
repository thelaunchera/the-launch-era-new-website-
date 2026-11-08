import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.57.0";

/* Tenant-scoped universal catalog, separate from private owner CRM sales data.
 * Published read returns only deliberately public catalog details.
 * No payments, analytics, bookings, customer messages or SMS are generated.
 */
const allow=new Set(["https://thelaunchera.com","https://www.thelaunchera.com","http://localhost:5173"]);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const clean=(v:unknown,max=150)=>String(v??"").trim().replace(/[\u0000-\u001f<>]/g,"").slice(0,max);
const cors=(origin:string)=>({
  "Access-Control-Allow-Origin":allow.has(origin)?origin:"https://thelaunchera.com",
  "Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods":"POST, OPTIONS",
  "Vary":"Origin",
  "Cache-Control":"no-store",
  "Content-Type":"application/json; charset=utf-8"
});
const respond=(data:unknown,status:number,origin:string)=>new Response(JSON.stringify(data),{status,headers:cors(origin)});
const emailVerified=(u:any)=>Boolean(u?.id&&u?.email&&u?.email_confirmed_at);
const passwordJwt=(token:string)=>{
 try{const s=token.split(".")[1];const j=JSON.parse(atob(s.replace(/-/g,"+").replace(/_/g,"/")));return Array.isArray(j.amr)&&j.amr.some((v:any)=>v?.method==="password");}catch{return false}
};
const validImage=(raw:unknown)=>{
 const v=clean(raw,550);if(!v)return "";
 try{
  const url=new URL(v);
  if(url.protocol!=="https:"||url.username||url.password||!url.hostname.includes("."))throw Error("bad");
  if(/^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(url.hostname))throw Error("bad");
  return url.href;
 }catch{throw Error("Image must be an HTTPS image URL")}
};
function normalizeItems(value:unknown){
 if(!Array.isArray(value)||value.length>75)throw Error("Use no more than 75 catalog items");
 const seen=new Set<string>();
 return value.map((p:any)=>{
  const name=clean(p?.name,90),category=clean(p?.category,45)||"General";
  const desc=clean(p?.description,240);
  const price=Number(p?.price);
  const discount=Number(p?.discount_percent??0);
  if(!name||!Number.isFinite(price)||price<0||price>100000||!Number.isInteger(discount)||discount<0||discount>90)throw Error("Please review product names, prices and discounts");
  const id=uuid.test(String(p?.id))?String(p.id):crypto.randomUUID();
  if(seen.has(id))throw Error("Duplicate item");seen.add(id);
  return {id,name,category,description:desc,price:Math.round(price*100)/100,discount_percent:discount,available:p?.available!==false,image_url:validImage(p?.image_url)};
 });
}
Deno.serve(async(request:Request)=>{
 const origin=request.headers.get("Origin")||"";
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors(origin)});
 if(request.method!=="POST")return respond({error:"Method not allowed"},405,origin);
 if(origin&&!allow.has(origin))return respond({error:"Origin not allowed"},403,origin);
 try{
  const b=await request.json();const action=clean(b?.action,24);
  const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
  if(action==="public"){
   const key=clean(b?.public_key,90);
   if(!uuid.test(key))return respond({error:"Invalid catalog link"},400,origin);
   const {data:c,error:ce}=await admin.from("tle_crm_catalogs").select("workspace_id,mode,currency,items,updated_at").eq("public_key",key).eq("published",true).maybeSingle();
   if(ce||!c)return respond({error:"Catalog not published"},404,origin);
   const {data:ws}=await admin.from("tle_crm_workspaces").select("name,is_internal").eq("id",c.workspace_id).maybeSingle();
   if(!ws||ws.is_internal)return respond({error:"Catalog not published"},404,origin);
   return respond({ok:true,name:clean(ws.name,110),mode:c.mode,currency:c.currency,items:(c.items||[]).filter((i:any)=>i?.available===true),updated_at:c.updated_at},200,origin);
  }
  if(action!=="get"&&action!=="save")return respond({error:"Unknown action"},400,origin);
  const token=(request.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"").trim();
  if(!token)return respond({error:"Sign in required"},401,origin);
  const {data:{user},error:ue}=await admin.auth.getUser(token);
  if(ue||!emailVerified(user))return respond({error:"Verified sign-in required"},401,origin);
  const id=clean(b?.workspace_id,90);
  if(!uuid.test(id))return respond({error:"Invalid workspace"},400,origin);
  const {data:ws,error:we}=await admin.from("tle_crm_workspaces").select("id,name,created_by,is_internal,password_login_required,password_setup_completed_at").eq("id",id).eq("created_by",user!.id).maybeSingle();
  if(we||!ws||ws.is_internal)return respond({error:"Not authorized for this business"},403,origin);
  if(ws.password_login_required===true&&(!ws.password_setup_completed_at||!passwordJwt(token)))return respond({error:"Password sign-in required for buyer workspace"},403,origin);
  const query=admin.from("tle_crm_catalogs").select("workspace_id,mode,currency,items,published,public_key,updated_at").eq("workspace_id",id);
  if(action==="get"){
   const {data:c,error:e}=await query.maybeSingle();
   if(e)return respond({error:"Could not load catalog"},500,origin);
   return respond({ok:true,business_name:clean(ws.name,110),mode:c?.mode||"services",currency:c?.currency||"USD",items:c?.items||[],published:c?.published===true,public_key:c?.published?c.public_key:null,updated_at:c?.updated_at||null},200,origin);
  }
  const mode=["menu","products","services"].includes(b?.mode)?b.mode:"";
  if(!mode)return respond({error:"Choose your business catalog format"},400,origin);
  const currency=["USD","CAD"].includes(b?.currency)?b.currency:"USD";
  const items=normalizeItems(b?.items);
  const published=b?.published===true;
  if(published&&!items.some((i:any)=>i.available))return respond({error:"At least one item must be available to publish"},400,origin);
  const {data:updated,error:e}=await admin.from("tle_crm_catalogs").upsert({workspace_id:id,mode,currency,items,published,updated_by:user!.id,updated_at:new Date().toISOString()},{onConflict:"workspace_id"}).select("updated_at,public_key,published").single();
  if(e||!updated)return respond({error:"Could not save catalog"},500,origin);
  return respond({ok:true,updated_at:updated.updated_at,published:updated.published,public_key:updated.published?updated.public_key:null},200,origin);
 }catch(error){
  return respond({error:error instanceof Error?clean(error.message,200):"Request failed"},400,origin);
 }
});