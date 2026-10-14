/**
 * Private Jessy bridge for standalone OWNER screens (Lead Insights / Buyer Preview).
 * This module is loaded ONLY after the original page has verified the owner's account.
 * The server independently checks the Supabase JWT and platform_admins on every request.
 */
export async function mountOwnerJessy({db,workspaceId,page}={}){
 const contexts=new Set(["lead-insights","buyer-preview","ai-team"]);
 if(!contexts.has(page)||!db||!workspaceId||window.__tleOwnerJessyInstalled)return false;
 const {data:{user},error}=await db.auth.getUser();
 if(error||!user)return false;
 const {data:owner,error:ownerError}=await db.from("tle_crm_workspaces")
  .select("id,created_by,is_internal").eq("id",workspaceId).eq("created_by",user.id).eq("is_internal",true).maybeSingle();
 if(ownerError||!owner)return false;

 const endpoint="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-jessy-owner";
 const apikey="sb_publishable_0TueitFYiRF3rAEMLMT8-w_FvbvY0rB";
 let active=true;
 async function post(body){
  if(!active||document.getElementById("app")?.classList.contains("hidden"))throw Error("Owner sign-in required");
  const {data:{session},error:sessionError}=await db.auth.getSession();
  if(sessionError||!session?.access_token||session.user?.id!==user.id)throw Error("Owner session expired");
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),14000);
  try{
   const response=await fetch(endpoint,{method:"POST",headers:{
     "Content-Type":"application/json",apikey,Authorization:"Bearer "+session.access_token
    },body:JSON.stringify(body),signal:controller.signal});
   const result=await response.json().catch(()=>({}));
   if(!response.ok||result?.ok!==true)throw Error(result?.error||"Jessy is temporarily unavailable");
   return result;
  }finally{clearTimeout(timeout)}
 }
 // Server checks platform_admins and the internal workspace, not merely a client-side role flag.
 try{await post({action:"whatsapp_get"})}catch{return false}
 if(document.getElementById("app")?.classList.contains("hidden"))return false;

 window.TLEOwnerJessyGateway=Object.freeze({
  standalone:true,
  ready(){return active&&!document.getElementById("app")?.classList.contains("hidden")&&document.body.classList.contains("crm-owner-view")},
  context(){return {section:page,label:page==="ai-team"?"AI Team":page==="lead-insights"?"Lead Insights":"Buyer Command Center Preview"}},
  async ask(input){
    if(!this.ready())throw Error("Owner access required");
    return post({message:String(input?.message||"").slice(0,340),language:input?.language==="es"?"es":"en",
       history:Array.isArray(input?.history)?input.history.slice(-4):[],page_context:page});
  },
  async whatsappAlertPrefs(action,values={}){
    if(!this.ready())throw Error("Owner access required");
    if(!["whatsapp_get","whatsapp_save","whatsapp_disable"].includes(action))throw Error("Unsupported settings action");
    return post({action,...values});
  },
  openNotifications(){return this.navigate("notifications")},
  navigate(target){
    if(!this.ready())return false;
    const allowed=new Set(["owner-pages","owner-calendar","leads","calendar","clients","inbox","emails","settings","owner-support","owner-help","notifications"]);
    if(!allowed.has(target))return false;
    try{sessionStorage.setItem("tle-owner-pending-section",target)}catch{}
    window.location.assign("./index.html");
    return true;
  }
 });
 document.body.dataset.languageWorkspace=workspaceId;
 document.body.classList.add("crm-owner-view");
 const refresh=()=>window.dispatchEvent(new Event("tle-crm-ready"));
 db.auth.onAuthStateChange((event,session)=>{
  if(event==="SIGNED_OUT"||event==="USER_DELETED"||(session?.user?.id&&session.user.id!==user.id)){
   active=false;
   document.body.classList.remove("crm-owner-view");
   refresh();
  }
 });
 const script=document.createElement("script");
 script.src="./assets/jessy-owner.js?v=20261014-unified-team";
 script.defer=true;script.dataset.ownerJessyStandalone=page;
 document.body.appendChild(script);
 return true;
}