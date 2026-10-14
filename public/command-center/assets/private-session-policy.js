/* The Launch Era | 12-hour private Command Center UI sign-in window.
 * Refreshing a Supabase access token MUST NOT extend this window.
 * This is a browser reauthentication guard, not a replacement for server JWT/RLS policy.
 */
(function(global){
 "use strict";
 const WINDOW_MS=12*60*60*1000;
 const STORAGE_KEY="tle_cc_last_password_signin_v1";
 let timer=null,dbRef=null,expiredHandler=null,checking=false,listeners=false;
 function decodeSessionId(token){
  try{
   const payload=String(token||"").split(".")[1];
   if(!payload)return "";
   const padded=payload.replace(/-/g,"+").replace(/_/g,"/").padEnd(Math.ceil(payload.length/4)*4,"=");
   const jwt=JSON.parse(atob(padded));
   return typeof jwt.session_id==="string"?jwt.session_id.slice(0,128):"";
  }catch{return ""}
 }
 function saved(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"null")}catch{return null}
 }
 function store(value){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(value))}catch{}
 }
 function clear(){
  if(timer){clearTimeout(timer);timer=null}
  try{localStorage.removeItem(STORAGE_KEY)}catch{}
 }
 function inspect(user,session,now=Date.now()){
  const uid=String(user?.id||session?.user?.id||"");
  if(!uid||!session?.access_token)return {valid:false,expired:false,reason:"missing_session"};
  const loginStamp=Date.parse(String(user?.last_sign_in_at||session?.user?.last_sign_in_at||""));
  const serverLogin=Number.isFinite(loginStamp)&&loginStamp>946684800000&&loginStamp<=now+300000?loginStamp:null;
  const sid=decodeSessionId(session.access_token)||"login:"+String(serverLogin||uid);
  const previous=saved();
  const matching=previous&&previous.uid===uid&&previous.sid===sid&&Number.isFinite(previous.startedAt);
  // Server-recorded sign-in time is authoritative where available. Local timestamp
  // anchors browsers without that claim, and is never renewed on TOKEN_REFRESHED.
  const startedAt=matching?Math.min(previous.startedAt,serverLogin??previous.startedAt):serverLogin??now;
  if(!matching||previous.startedAt!==startedAt)store({uid,sid,startedAt});
  const elapsed=Math.max(0,now-startedAt);
  return {valid:true,expired:elapsed>=WINDOW_MS,expiresAt:startedAt+WINDOW_MS,remaining:Math.max(0,WINDOW_MS-elapsed)};
 }
 async function expire(db,onExpired){
  if(checking)return false;
  checking=true;
  clear();
  try{
   const response=await db.auth.signOut({scope:"local"});
   if(response?.error)throw response.error;
  }catch{
   // Fail closed in this browser if remote sign-out is temporarily unavailable.
   try{localStorage.removeItem("tle-crm-auth")}catch{}
  }
  try{(onExpired||expiredHandler)?.()}catch{}
  checking=false;
  return false;
 }
 async function guard(db,user,onExpired){
  if(!db?.auth||!user?.id)return false;
  dbRef=db;expiredHandler=onExpired||expiredHandler;
  const {data,error}=await db.auth.getSession();
  if(error||!data?.session)return false;
  const outcome=inspect(user,data.session);
  if(!outcome.valid)return false;
  if(outcome.expired)return expire(db,onExpired);
  if(timer)clearTimeout(timer);
  timer=setTimeout(async()=>{
   try{
    const u=await db.auth.getUser();
    if(u.data?.user)await guard(db,u.data.user,expiredHandler);
   }catch{}
  },Math.max(50,Math.min(outcome.remaining+50,2147483647)));
  if(!listeners){
   listeners=true;
   document.addEventListener("visibilitychange",async()=>{
    if(document.visibilityState!=="visible"||!dbRef||checking)return;
    try{
     const {data}=await dbRef.auth.getUser();
     if(data?.user)await guard(dbRef,data.user,expiredHandler);
    }catch{}
   });
   global.addEventListener("storage",e=>{
    if(e.key!==STORAGE_KEY||!dbRef||checking)return;
    void dbRef.auth.getUser().then(({data})=>data?.user&&guard(dbRef,data.user,expiredHandler)).catch(()=>{});
   });
  }
  return true;
 }
 global.TLEPrivateSessionPolicy=Object.freeze({guard,inspect,clear,WINDOW_MS,STORAGE_KEY});
})(window);
