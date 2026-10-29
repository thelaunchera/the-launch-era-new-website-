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
  const sla=node("p",say("Production estimate: 4 business days after the paid intake is complete and production approved.","Producción estimada: 4 días hábiles desde la aprobación del intake pagado y completo."));sla.style.cssText="font-size:12px;color:#27495c;margin:0";
  const safe=node("p",say("Agency checklist: verify services and actual prices → prepare Booking + AI → test desktop/mobile, email and quote approvals → client review → deliver. AI monthly support begins after the first 30 days from delivery.","Lista agencia: verificar servicios y precios reales → preparar Booking + AI → probar móvil/escritorio, correos y aprobación de cotizaciones → revisión del cliente → entregar. El soporte mensual de IA comienza tras 30 días desde la entrega."));safe.style.cssText="font-size:12px;line-height:1.55;color:#526775;margin:0";
  const actions=node("div");actions.style.cssText="display:flex;flex-wrap:wrap;gap:8px";
  const openBooking=node("button",say("Manage Booking","Gestionar Booking"));openBooking.type="button";openBooking.className="secondary";openBooking.onclick=()=>{$("ownerPagesNav")?.click()};
  const openAi=node("button",say("View AI delivery","Ver entrega AI"));openAi.type="button";openAi.className="secondary";openAi.onclick=()=>{$("ownerAiDeliveryPanel")?.scrollIntoView({behavior:"smooth",block:"start"})};
  actions.append(openBooking,openAi);card.append(heading,email,plan,paid,progress,sla,safe,actions);root.append(card);
 }
}
async function refresh(){
 if(busy)return;busy=true;$("tleBundleOwnerRefresh").disabled=true;
 try{
  const cfg=await query("tle_owner_bundle_promotion",{});
  panel.classList.remove("hidden");
  status(cfg.enabled?say("Old 40% promotion is still active in production. Disable it before release.","La antigua promoción del 40% sigue activa. Desactívala antes de publicar."):say("Clear one-time setup prices active. Existing customer orders are unchanged.","Precios de activación claros y sin descuento. Las compras existentes no cambian."));
  const orders=await query("tle_owner_bundle_queue",{});renderOrders(orders);
 }catch(e){status(say("Could not load owner settings. Refresh your Command Center.","No se pudo cargar la configuración. Actualiza tu Command Center."));}
 finally{busy=false;$("tleBundleOwnerRefresh").disabled=false}
}
$("tleBundleOwnerRefresh").onclick=refresh;
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