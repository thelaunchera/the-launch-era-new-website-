/* Universal buyer catalog: authenticated real data, no real orders or SMS. */
const API="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-crm-catalog";
const SUPABASE_URL="https://bowacxhmjvrqixtwaikv.supabase.co";
const SUPABASE_KEY="sb_publishable_0TueitFYiRF3rAEMLMT8-w_FvbvY0rB";
const $=id=>document.getElementById(id);
const escapeHtml=text=>String(text??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uuid=()=>crypto.randomUUID();
let db=null,workspace=null,workspaces=[],items=[],mode="services",currency="USD",published=false,publicKey=null,dirty=false,editing=null,busy=false,selectedCategory="",search="";
const formatPrice=n=>new Intl.NumberFormat("en-US",{style:"currency",currency}).format(Number(n)||0);
const salePrice=i=>(Number(i.price)||0)*(1-(Number(i.discount_percent)||0)/100);
const typeText={menu:"DIGITAL MENU",products:"PRODUCT CATALOG",services:"SERVICES & REQUESTS"};
const textId=id=>String(id||"");
function feedback(message){$("save-status").textContent=message}
function notice(msg){
 const t=$("toast");t.textContent=msg;t.hidden=false;
 setTimeout(()=>{if(t.textContent===msg)t.hidden=true},3300);
}
function failGate(title,copy){
 $("gate-title").textContent=title;$("gate-copy").textContent=copy;
 $("gate").hidden=false;$("workspace-ui").hidden=true;
}
function markDirty(){
 dirty=true;feedback("Unsaved changes. Select Save catalog to keep your updates.");
 render();
}
async function catalogCall(action,payload={}){
 const {data:{session},error}=await db.auth.getSession();
 if(error||!session?.access_token)throw Error("Please sign in to Admin Panel again.");
 const ctrl=new AbortController(),t=setTimeout(()=>ctrl.abort(),18000);
 try{
  const res=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":"Bearer "+session.access_token},body:JSON.stringify({action,workspace_id:workspace.id,...payload}),signal:ctrl.signal});
  const result=await res.json().catch(()=>({}));
  if(!res.ok||result.error)throw Error(result.error||"Request failed");
  return result;
 }finally{clearTimeout(t)}
}
function clearState(){
 items=[];mode="services";currency="USD";published=false;publicKey=null;dirty=false;
 $("mode").value=mode;$("currency").value=currency;$("publish").checked=false;
}
async function loadWorkspace(id){
 if(busy)return;
 if(dirty&&!confirm("Leave this business? Your unsaved edits will be discarded.")){$("workspace").value=workspace?.id||"";return}
 workspace=workspaces.find(w=>w.id===id);if(!workspace)return;
 busy=true;clearState();feedback("Loading your catalog...");
 try{
  const result=await catalogCall("get");
  mode=result.mode||"services";currency=result.currency||"USD";items=Array.isArray(result.items)?result.items:[];
  published=result.published===true;publicKey=result.public_key||null;
  $("mode").value=mode;$("currency").value=currency;$("publish").checked=published;
  dirty=false;feedback(result.updated_at?"Catalog loaded. Changes sync to this business only.":"Your private catalog is ready. Add your first item.");
 }catch(error){feedback(error.message||"Could not load your catalog.");notice("Could not verify this catalog.");}
 finally{busy=false;render();}
}
function currentFilter(){return items.filter(i=>(!selectedCategory||i.category===selectedCategory)&&(!search||(i.name+" "+i.category).toLowerCase().includes(search)))}
function render(){
 if(!workspace)return;
 $("preview-business").textContent=workspace.name||"Your Business";
 $("preview-type").textContent=typeText[mode]||typeText.services;
 $("catalog-title").textContent=mode==="menu"?"Your digital menu":mode==="products"?"Your product catalog":"Your services";
 $("stat-items").textContent=items.length;
 $("stat-offers").textContent=items.filter(i=>i.available&&Number(i.discount_percent)>0).length;
 $("stat-available").textContent=items.filter(i=>i.available).length;
 const categories=[...new Set(items.map(i=>i.category||"General"))].sort((a,b)=>a.localeCompare(b));
 const filter=$("category-filter");
 filter.innerHTML='<option value="">All categories</option>'+categories.map(c=>'<option value="'+escapeHtml(c)+'">'+escapeHtml(c)+'</option>').join("");
 filter.value=categories.includes(selectedCategory)?selectedCategory:"";
 if(!categories.includes(selectedCategory))selectedCategory="";
 const visible=currentFilter();
 $("empty").hidden=visible.length>0;
 $("empty").textContent=items.length?"No matching products or services. Change the filter.":"No items yet. Add your first product or import an existing text-based menu PDF.";
 $("items").innerHTML=visible.map(i=>{
  const image=i.image_url?'<img class="item-photo" loading="lazy" alt="" src="'+escapeHtml(i.image_url)+'">':'<div class="item-photo item-placeholder">TLE</div>';
  return '<article class="item">'+image+'<div class="item-content"><strong>'+escapeHtml(i.name)+'</strong><small>'+escapeHtml(i.category)+' · '+(i.available?"Available":"Unavailable")+'</small><span class="item-price">'+formatPrice(salePrice(i))+(Number(i.discount_percent)>0?'<del>'+formatPrice(i.price)+'</del>':'')+'</span> '+(Number(i.discount_percent)>0?'<span class="pill">'+Number(i.discount_percent)+'% OFF</span>':'')+(!i.available?'<span class="pill unavailable">Unavailable</span>':'')+'</div><div><button type="button" data-command="edit" data-id="'+escapeHtml(i.id)+'">Edit</button><button type="button" data-command="toggle" data-id="'+escapeHtml(i.id)+'" aria-label="'+(i.available?"Mark "+escapeHtml(i.name)+" unavailable":"Make "+escapeHtml(i.name)+" available")+'">'+(i.available?"Sold out":"Restore")+'</button></div></article>'
 }).join("");
 const preview=items.filter(i=>i.available);
 $("preview-items").innerHTML=preview.length?preview.map(i=>{
  const image=i.image_url?'<img src="'+escapeHtml(i.image_url)+'" alt="" loading="lazy">':'';
  return '<article class="preview-product">'+image+'<div class="text"><strong>'+escapeHtml(i.name)+'</strong><small>'+escapeHtml(i.category)+'</small><b>'+formatPrice(salePrice(i))+'</b>'+(Number(i.discount_percent)>0?'<del>'+formatPrice(i.price)+'</del>':'')+'</div></article>';
 }).join(""):'<p class="empty" style="grid-column:1/-1">Your available items will appear here.</p>';
 const ready=Boolean(publicKey&&published&&!dirty);
 $("public-link-area").hidden=!ready;
 if(ready){
  const link="https://thelaunchera.com/business-catalog/?key="+encodeURIComponent(publicKey);
  $("public-url").value=link;$("open-link").href=link;
 }
}
const buildEmpty=()=>({id:uuid(),name:"",category:mode==="menu"?"Menu":"General",description:"",price:0,discount_percent:0,available:true,image_url:""});
function fillForm(i){
 $("item-name").value=i.name||"";$("item-category").value=i.category||"General";
 $("item-desc").value=i.description||"";$("item-price").value=i.price??0;
 $("item-discount").value=i.discount_percent??0;$("item-image").value=i.image_url||"";
 $("item-available").checked=i.available!==false;previewPrice();
}
function previewPrice(){
 const p=Math.max(0,Number($("item-price").value)||0);
 const d=Math.max(0,Number($("item-discount").value)||0);
 $("price-preview").textContent="Customer price: "+formatPrice(p*(1-d/100))+(d>0?" ("+d+"% off "+formatPrice(p)+")":"");
}
function openEditor(id=null){
 if(busy)return;
 editing=id;const i=id?items.find(v=>v.id===id):buildEmpty();if(!i)return;
 $("dialog-title").textContent=id?"Edit "+i.name:"Add a new item";
 $("delete-item").hidden=!id;fillForm(i);$("item-dialog").showModal();
}
function normalizeImage(raw){
 if(!raw)return "";
 const u=new URL(raw);
 if(u.protocol!=="https:"||u.username||u.password||!u.hostname.includes("."))throw Error("Image must use an HTTPS URL");
 return u.href;
}
function saveItem(event){
 event.preventDefault();
 const name=$("item-name").value.trim().slice(0,90),category=$("item-category").value.trim().slice(0,45)||"General";
 const price=Number($("item-price").value),discount=Number($("item-discount").value||0);
 if(!name||!Number.isFinite(price)||price<0||price>100000||!Number.isInteger(discount)||discount<0||discount>90){notice("Please review item name, price and discount.");return}
 let image="";
 try{image=normalizeImage($("item-image").value.trim())}catch(error){notice(error.message);return}
 const item={id:editing||uuid(),name,category,description:$("item-desc").value.trim().slice(0,240),price:Math.round(price*100)/100,discount_percent:discount,available:$("item-available").checked,image_url:image};
 if(editing){items=items.map(v=>v.id===editing?item:v)}
 else{if(items.length>=75){notice("Maximum 75 items");return}items.push(item)}
 $("item-dialog").close();editing=null;markDirty();notice("Item updated. Save catalog to keep changes.");
}
async function saveCatalog(){
 if(busy)return;
 if($("publish").checked&&!items.some(i=>i.available)){notice("At least one available item is needed to publish.");return}
 busy=true;$("save").disabled=true;feedback("Saving your catalog securely...");
 try{
  const result=await catalogCall("save",{mode,currency,items,published:$("publish").checked});
  dirty=false;published=result.published===true;publicKey=result.public_key||null;
  feedback("Saved for "+workspace.name+". "+(published?"Public catalog is available to share.":"Your catalog remains private."));
  notice("Catalog saved successfully");
 }catch(error){feedback("Not saved: "+(error.message||"Please try again"));notice("Could not save this catalog.")}
 finally{busy=false;$("save").disabled=false;render()}
}
async function importPdf(file){
 if(!file)return;
 if(file.size>8*1024*1024){notice("Choose a PDF smaller than 8 MB.");return}
 if(!/\.pdf$/i.test(file.name)&&file.type!=="application/pdf"){notice("Choose a PDF menu.");return}
 $("pdf").disabled=true;feedback("Reading menu text locally on this device...");
 try{
  const lib=await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs");
  lib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";
  const pdf=await lib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
  const candidates=[];
  for(let n=1;n<=Math.min(pdf.numPages,10);n++){
   const page=await pdf.getPage(n);
   const text=await page.getTextContent();
   const lines=new Map();
   for(const entry of text.items){
    const s=String(entry.str||"").trim();if(!s)continue;
    const y=Math.round(entry.transform?.[5]||0),x=Number(entry.transform?.[4])||0;
    if(!lines.has(y))lines.set(y,[]);
    lines.get(y).push({x,s});
   }
   for(const [,parts] of [...lines.entries()].sort((a,b)=>b[0]-a[0])){
    const line=parts.sort((a,b)=>a.x-b.x).map(x=>x.s).join(" ").replace(/\s+/g," ").trim();
    const match=line.match(/^(.{3,90}?)\s+(?:[$]\s*)?(\d{1,4}(?:[.,]\d{2}))(?:\s*(?:USD|CAD))?$/i);
    if(!match)continue;
    const name=match[1].replace(/[-–—·.\s]+$/,"").trim();
    const price=Number(match[2].replace(",","."));
    if(name.length<3||!Number.isFinite(price)||price<=0||price>5000||/^(total|subtotal|tax|phone|hours|address|page|copyright)/i.test(name))continue;
    candidates.push({id:uuid(),name:name.slice(0,90),category:"Imported from PDF",description:"",price,discount_percent:0,available:true,image_url:""});
   }
  }
  const existing=new Set(items.map(x=>x.name.toLowerCase()));
  const added=[];
  for(const p of candidates){
   if(items.length+added.length>=75||added.length>=30)break;
   if(existing.has(p.name.toLowerCase()))continue;
   existing.add(p.name.toLowerCase());added.push(p);
  }
  if(!added.length){feedback("No selectable menu lines with prices were detected. Scanned or designed PDFs may need manual entry.");notice("Nothing imported — you can add items manually.");return}
  items.push(...added);markDirty();
  notice("Imported "+added.length+" item suggestions. Review names and prices before publishing.");
  feedback("Imported "+added.length+" PDF suggestions on this device. Review each item and Save catalog when ready.");
 }catch(error){feedback("PDF import unavailable. Add items manually or try a text-based PDF.");notice("Could not read this menu PDF.");console.warn("PDF import error",error)}
 finally{$("pdf").value="";$("pdf").disabled=false}
}
function bind(){
 $("add-item").addEventListener("click",()=>openEditor());
 $("close-dialog").addEventListener("click",()=>$("item-dialog").close());
 $("cancel-item").addEventListener("click",()=>$("item-dialog").close());
 $("item-form").addEventListener("submit",saveItem);
 $("delete-item").addEventListener("click",()=>{if(!editing)return;if(!confirm("Delete this item from your catalog draft?"))return;items=items.filter(i=>i.id!==editing);$("item-dialog").close();editing=null;markDirty()});
 ["item-price","item-discount"].forEach(id=>$(id).addEventListener("input",previewPrice));
 $("items").addEventListener("click",event=>{
  const target=event.target.closest("button[data-command]");if(!target)return;
  const id=textId(target.dataset.id);
  if(target.dataset.command==="edit")openEditor(id);
  else if(target.dataset.command==="toggle"){
   const row=items.find(i=>i.id===id);if(!row)return;
   row.available=!row.available;markDirty();notice(row.available?"Item available":"Item marked unavailable. Save changes.");
  }
 });
 $("search").addEventListener("input",e=>{search=e.target.value.toLowerCase().trim();render()});
 $("category-filter").addEventListener("change",e=>{selectedCategory=e.target.value;render()});
 $("mode").addEventListener("change",e=>{mode=e.target.value;markDirty()});
 $("currency").addEventListener("change",e=>{currency=e.target.value;markDirty()});
 $("publish").addEventListener("change",()=>markDirty());
 $("save").addEventListener("click",saveCatalog);
 $("pdf").addEventListener("change",e=>importPdf(e.target.files?.[0]));
 $("workspace").addEventListener("change",e=>loadWorkspace(e.target.value));
 $("copy-link").addEventListener("click",async()=>{if(!publicKey||!published||dirty)return;try{await navigator.clipboard.writeText($("public-url").value);notice("Public link copied")}catch{const field=$("public-url");field.select();notice("Select and copy your catalog link")}});
 addEventListener("beforeunload",event=>{if(dirty){event.preventDefault();event.returnValue=""}});
}
async function start(){
 try{
  const sdk=await import("https://esm.sh/@supabase/supabase-js@2.57.0");
  db=sdk.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:"tle-crm-auth"}});
  const {data:{session},error}=await db.auth.getSession();
  if(error||!session?.access_token){failGate("Sign in to manage your catalog.","Open your private Admin Panel and sign in with your business account.");return}
  const {data:{user},error:userError}=await db.auth.getUser();
  if(userError||!user?.id){failGate("Please verify your session.","Sign in again through Admin Panel.");return}
  const {data:rows,error:workError}=await db.from("tle_crm_workspaces").select("id,name,is_internal,created_by,business_category").eq("created_by",user.id).eq("is_internal",false).limit(20);
  if(workError||!rows?.length){failGate("Your business workspace isn't active yet.","After your website is delivered, The Launch Era will activate your private Admin Panel. Contact support if you already have a delivered website.");return}
  workspaces=rows;
  $("workspace").innerHTML=rows.map(w=>'<option value="'+escapeHtml(w.id)+'">'+escapeHtml(w.name||"Your Business")+'</option>').join("");
  bind();$("gate").hidden=true;$("workspace-ui").hidden=false;
  await loadWorkspace(rows[0].id);
 }catch(error){console.warn("Catalog startup",error);failGate("Catalog unavailable.","We could not verify your workspace. Return to Admin Panel and try again.")}
}
start();
