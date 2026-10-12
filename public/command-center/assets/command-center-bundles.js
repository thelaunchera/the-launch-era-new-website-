(()=>{"use strict";
const panel=document.getElementById("tleBundleOwnerPanel");if(!panel)return;
const url="https://bowacxhmjvrqixtwaikv.supabase.co";
const key="sb_publishable_0TueitFYiRF3rAEMLMT8-w_FvbvY0rB";
let client=null,ownerLoaded=false,busy=false;
const $=id=>document.getElementById(id);
const es=()=>{try{return localStorage.getItem("tle_crm_language")==="es"}catch{return false}};
const say=(en,esText)=>es()?esText:en;
const names={"ai-booking":"AI Booking Assistant","ai-followup":"AI Follow-Up Assistant","ai-business":"AI Business Assistant (Booking + Follow-Up)"};
function node(tag,text){const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);return e}
const cents=(n)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(n||0)/100);
function status(msg){$("tleBundleOfferStatus").textContent=msg}
function initClient(){if(!client){if(!window.supabase?.createClient)throw Error("Session unavailable");client=window.supabase.createClient(url,key,{auth:{storageKey:"tle-crm-auth",persistSession:true,autoRefreshToken:false,detectSessionInUrl:false}})}return client}
async function query(fn,args){
 const db=initClient();const session=await db.auth.getSession();
 if(!session.data?.session?.access_token)throw Error("Sign in needed");
 const r=await db.rpc(fn,args||{});if(r.error)throw r.error;return r.data;
}
function renderOrders(orders){
 const root=$("tleBundleOwnerOrders");root.replaceChildren();
 if(!orders?.length){root.append(node("p",say("No paid combined purchases yet. New packages will appear here.","Todavía no hay compras conjuntas. Aquí aparecerán los nuevos paquetes.")));return}
 for(const a of orders){
  const card=node("div");card.style.cssText="background:#fff;border:1px solid #dce4ea;border-radius:16px;padding:15px;min-width:0;display:grid;gap:7px";
  const heading=node("strong",a.business_name||say("Business name pending","Nombre del negocio pendiente"));heading.style.cssText="font-size:15px;overflow-wrap:anywhere";
  const email=node("p",a.owner_email||"");email.style.cssText="font-size:12px;overflow-wrap:anywhere;color:#586b7c;margin:0";
  const plan=node("p","Booking Automation + Command Center + "+(names[a.bundle_ai]||"AI Assistant"));plan.style.cssText="font-size:13px;font-weight:700;color:#195b83;background:#e9f3fb;padding:9px 10px;border-radius:10px;margin:0";
  const paid=node("p",say("Paid today: ","Pagó en la activación: ")+cents(a.amount_paid_cents));paid.style.cssText="margin:0;font-weight:700;font-size:13px";
  const progress=node("p",say("Booking intake: ","Formulario Booking: ")+(a.intake_done?"✓":"○")+"  ·  AI: "+(a.ai_status||"pending"));progress.style.cssText="font-size:12px;color:#526775;margin:0";
  const actions=node("div");actions.style.cssText="display:flex;flex-wrap:wrap;gap:8px";
  const openBooking=node("button",say("Manage Booking","Gestionar Booking"));openBooking.type="button";openBooking.className="secondary";openBooking.onclick=()=>{$("ownerPagesNav")?.click()};
  const openAi=node("button",say("View AI delivery","Ver entrega AI"));openAi.type="button";openAi.className="secondary";openAi.onclick=()=>{$("ownerAiDeliveryPanel")?.scrollIntoView({behavior:"smooth",block:"start"})};
  actions.append(openBooking,openAi);card.append(heading,email,plan,paid,progress,actions);root.append(card);
 }
}
async function refresh(){
 if(busy)return;busy=true;$("tleBundleOwnerRefresh").disabled=true;
 try{
  const cfg=await query("tle_owner_bundle_promotion",{});
  panel.classList.remove("hidden");$("tleBundleDiscountToggle").checked=cfg.enabled===true;
  $("tleBundleDiscountToggle").disabled=false;$("tleBundleDiscountSave").disabled=false;
  status(cfg.enabled?say("40% activation promotion is ON. Normal AI monthly prices are unchanged.","Descuento del 40% en activación ACTIVO. Las mensualidades normales no cambian."):say("Promotion is OFF. Combined purchases use standard setup prices.","Promoción DESACTIVADA. La compra conjunta usa precios normales."));
  const orders=await query("tle_owner_bundle_queue",{});renderOrders(orders);
 }catch(e){status(say("Could not load owner settings. Refresh your Command Center.","No se pudo cargar la configuración. Actualiza tu Command Center."));}
 finally{busy=false;$("tleBundleOwnerRefresh").disabled=false}
}
$("tleBundleOwnerRefresh").onclick=refresh;
$("tleBundleDiscountSave").onclick=async()=>{
 if(busy)return;busy=true;$("tleBundleDiscountSave").disabled=true;
 try{
  const desired=$("tleBundleDiscountToggle").checked;
  const result=await query("tle_owner_bundle_promotion",{p_enabled:desired});
  status(result.enabled?say("✓ 40% discount saved for combined activations only.","✓ Descuento del 40% guardado solo para activaciones conjuntas."):say("✓ Promotion turned off. Existing purchases are unchanged.","✓ Promoción desactivada. Las compras anteriores no cambian."));
 }catch(e){status(say("Unable to save. Your previous offer setting remains unchanged.","No se pudo guardar. La configuración anterior no ha cambiado."))}
 finally{busy=false;$("tleBundleDiscountSave").disabled=false}
};
function sync(){
 const owner=document.body.classList.contains("crm-owner-view");
 panel.classList.toggle("hidden",!owner);
 if(owner&&!ownerLoaded){ownerLoaded=true;void refresh()}
 if(!owner)ownerLoaded=false;
}
new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:["class"]});
window.addEventListener("tle-crm-ready",sync);window.addEventListener("pageshow",sync);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",sync,{once:true});else sync();
})();