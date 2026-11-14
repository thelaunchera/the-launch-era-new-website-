/* Knockout Deli Admin Panel — isolated, browser-only concept. No API, email, order or payment calls. */
(function () {
"use strict";
const KEY="tle-knockout-admin-demo-v1";
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const fmt=(v)=>Number.isFinite(Number(v))?"$"+Number(v).toFixed(2).replace(/\.00$/,""):"Price to confirm";
const esc=(v)=>String(v==null?"":v).replace(/[&<>"']/g,(x)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
const urlImage=(v)=>{
  if(typeof v!=="string"||!v)return "";
  if(/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(v))return v;
  if(v.startsWith("./assets/"))return "../assets/"+v.slice(9);
  if(v.startsWith("../assets/")&&/^[\w\-./]+$/.test(v))return v;
  try{let u=new URL(v,location.href);return (u.protocol==="https:"||u.protocol==="http:")?u.href:"";}catch{return "";}
};
const price=(p)=>Math.max(0,Number(p.price)||0);
let source=[],state={},view="dashboard",editPhoto=null,searchTerm="",filterCategory="";
const navLabels=[
 ["dashboard","01","Overview"],["menu","02","Menu"],["locations","03","Location"],["events","04","Events"],
 ["offers","05","Offers"],["alerts","06","Alerts"],["requests","07","Requests"],["content","08","Content"],["preview","09","Preview"]
];
const headings={
 dashboard:["THE KNOCKOUT WORKSPACE","THE TRUCK, ALL IN ONE PLACE.","Everything you need to keep your menu, locations, events and customers up to date."],
 menu:["MENU MANAGEMENT","EVERY ITEM. EVERY PRICE.","Edit real menu items, product photos, availability and discounts. Changes remain in this interactive preview."],
 locations:["WHERE TO FIND US","NEXT STOP? UPDATE IT HERE.","Choose your truck's location, hours and featured photo. Prepare a subscriber alert when plans change."],
 events:["EVENTS & CATERING","MAKE THE NEXT EVENT COUNT.","Create a new appearance, choose its website photo and decide when it appears in the preview."],
 offers:["PROMOTIONS","MAKE AN OFFER.","Create a featured website banner and apply one promotional percentage to selected menu items."],
 alerts:["SUBSCRIBER COMMUNICATIONS","KEEP YOUR PEOPLE IN THE LOOP.","Preview opt-in emails for a new location, upcoming event or promotion. Demo alerts are never sent."],
 requests:["ORDERS & INQUIRIES","EVERY REQUEST, ONE PLACE.","This concept illustrates how requests will be managed. There are no real orders, messages or payments."],
 content:["INSTAGRAM CONTENT","A CONSISTENT SOCIAL PRESENCE.","Organize owner-approved social drafts. Managed publishing is part of the monthly service, not connected in this preview."],
 preview:["CUSTOMER EXPERIENCE","SEE WHAT YOUR CUSTOMERS SEE.","Watch prices, photos, event details and current location change in the mock website preview."]
};
function defaults(items){return {
 products:items.map(p=>Object.assign({},p,{discount:0})),
 location:{name:"Next stop to be announced",address:"",date:"",hours:"",photo:"../assets/knockout-live-music.webp",published:false},
 events:[],offer:{enabled:false,title:"",description:"",discount:0,productId:"all"},alerts:[],social:[],
 managedBy:"owner",updatedAt:null
};}
function load(items){
 source=items;
 const fresh=defaults(items);
 try{
   const saved=JSON.parse(localStorage.getItem(KEY)||"null");
   if(saved&&Array.isArray(saved.products)&&saved.products.length&&saved.products.every(x=>x&&typeof x.id==="string")){
     const valid=new Set(items.map(x=>x.id));
     const base=new Map(items.map(x=>[x.id,x]));
     fresh.products=saved.products.filter(x=>valid.has(x.id)||x.id.startsWith("custom-")).map(x=>Object.assign({},base.get(x.id)||{},x));
     for(const p of items)if(!fresh.products.some(x=>x.id===p.id))fresh.products.push(Object.assign({},p,{discount:0}));
     for(const key of ["location","events","offer","alerts","social","managedBy","updatedAt"])if(saved[key]!==undefined)fresh[key]=saved[key];
   }
 }catch(error){console.warn("Knockout preview storage unavailable",error);}
 if(!Array.isArray(fresh.events))fresh.events=[];
 if(!Array.isArray(fresh.alerts))fresh.alerts=[];
 if(!Array.isArray(fresh.social))fresh.social=[];
 state=fresh;
}
function persist(){
 state.updatedAt=new Date().toISOString();
 try{localStorage.setItem(KEY,JSON.stringify(state));return true;}
 catch(error){toast("Changes are visible now, but browser storage is full. Try smaller photos.");return false;}
}
let toastTimeout=0;
function toast(message){
 const node=$("#toast");node.textContent=message;node.classList.add("show");
 clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>node.classList.remove("show"),4000);
}
function closeModal(){editPhoto=null;$("#modal-backdrop").hidden=true;$("#modal-content").replaceChildren();}
function modal(title,content){
 $("#modal-title").textContent=title;$("#modal-content").innerHTML=content;
 $("#modal-backdrop").hidden=false;
 $(".modal").scrollTop=0;
 const first=$("#modal-content input:not([type=hidden]),#modal-content textarea,#modal-content select");
 if(first)first.focus({preventScroll:true});
}
function img(src,alt,cls="card-photo"){
 const safe=urlImage(src);
 if(!safe)return '<div class="no-photo">PHOTO NOT ADDED YET</div>';
 return '<img class="'+esc(cls)+'" src="'+esc(safe)+'" alt="'+esc(alt)+'" loading="lazy">';
}
function activeOfferDiscount(p){
 const o=state.offer||{};
 return o.enabled&&(o.productId==="all"||o.productId===p.id)?Math.max(0,Math.min(90,Number(o.discount)||0)):0;
}
function effectiveDiscount(p){return Math.max(Number(p.discount)||0,activeOfferDiscount(p));}
function salePrice(p){return Math.max(0,price(p)*(1-effectiveDiscount(p)/100));}
function moneyMarkup(p){let d=effectiveDiscount(p);return d?'<strong class="product-price">'+fmt(salePrice(p))+'</strong> <del class="soft-text">'+fmt(price(p))+'</del> <span class="red-chip">'+d+'% OFF</span>':'<strong class="product-price">'+fmt(p.price)+'</strong>';}
function countAvailable(){return state.products.filter(x=>x.available).length;}
function section(title,subtitle,action){
 return '<div class="section-title"><div><h2>'+esc(title)+'</h2>'+(subtitle?'<p>'+esc(subtitle)+'</p>':'')+'</div>'+(action||"")+'</div>';
}
function quick(viewName,title,desc){
 return '<button class="quick" type="button" data-view="'+viewName+'"><span class="label">MANAGE</span><strong>'+esc(title)+'</strong><small>'+esc(desc)+'</small></button>';
}
function renderDashboard(){
 const next=state.events.filter(x=>x.published).sort((a,b)=>(a.date||"").localeCompare(b.date||""))[0];
 return '<div class="grid cols-4">'+
 '<div class="panel metric"><small>Menu items</small><strong>'+state.products.length+'</strong></div>'+
 '<div class="panel metric"><small>Available now</small><strong>'+countAvailable()+'</strong></div>'+
 '<div class="panel metric"><small>Active offers</small><strong>'+(state.products.filter(x=>Number(x.discount)>0).length+(state.offer.enabled?1:0))+'</strong></div>'+
 '<div class="panel metric"><small>Subscriber alerts sent</small><strong>0</strong></div></div>'+
 section("Quick updates","Change the parts of your website that need attention most.")+
 '<div class="grid cols-3">'+quick("menu","Change menu prices","Edit items, photo and availability.")+quick("locations","Update truck stop","Location, time and website photo.")+quick("events","Create an event","Image, date, details and visibility.")+'</div>'+
 section("Today's snapshot","Everything here is for demonstration only.")+
 '<div class="split"><article class="panel">'+img(state.location.photo,"Featured truck stop","card-photo feature-photo")+
 '<p class="label" style="margin-top:17px">CURRENT LOCATION</p><h3 class="display-title">'+esc(state.location.name)+'</h3><p class="soft-text">'+esc(state.location.address||"Add a location address")+'</p><span class="'+(state.location.published?"red-chip":"muted-chip")+'">'+(state.location.published?"Visible in preview":"Hidden on website preview")+'</span>'+
 '<div class="action-row" style="margin-top:17px"><button class="btn primary" data-view="locations">Edit location</button><button class="btn secondary" data-view="alerts">Prepare an alert</button></div></article>'+
 '<article class="panel">'+img(next?next.photo:"../assets/knockout-community.webp","Upcoming event concept","card-photo feature-photo")+
 '<p class="label" style="margin-top:17px">NEXT EVENT</p><h3 class="display-title">'+esc(next?next.title:"Your next event goes here")+'</h3><p class="soft-text">'+esc(next?([next.date,next.venue].filter(Boolean).join(" · ")):"Choose a location, event photo and date when ready.")+'</p><button class="btn secondary" data-view="events">Manage event photos</button></article></div>'+
 '<p class="status">Saved locally in this browser. No live website, subscriber list or checkout integration.</p>';
}
function productCard(p){
 const d=effectiveDiscount(p);
 return '<article class="product" data-product-card data-search="'+esc((p.name+" "+p.category+" "+p.description).toLowerCase())+'" data-category="'+esc(p.category)+'">'+
 img(p.image,p.name,"product-photo")+
 '<div class="product-body"><span class="label">'+esc(p.category)+'</span><h3>'+esc(p.name)+'</h3><p>'+esc(p.description||"")+'</p>'+
 '<div class="product-meta"><span>'+ (d?'<strong class="product-price">'+fmt(salePrice(p))+'</strong> <del class="soft-text">'+fmt(p.price)+'</del>':'<strong class="product-price">'+fmt(p.price)+'</strong>')+'</span><span class="'+(p.available?"muted-chip":"red-chip")+'">'+(p.available?"Available":"Sold out")+'</span></div>'+
 '<div class="action-row"><button class="btn secondary sm" type="button" data-edit-product="'+esc(p.id)+'">Edit price / photo</button>'+(d?'<span class="red-chip">'+d+'% OFF</span>':'')+'</div></div></article>';
}
function renderMenu(){
 const cats=[...new Set(state.products.map(x=>x.category))];
 return '<div class="notice"><strong>Original menu pricing</strong>These items reflect the supplied Knockout Deli printed menu. Changes below affect this browser preview, not the published website.</div>'+
 section("All menu items",state.products.length+" items · "+countAvailable()+" available",'<button class="btn primary" data-new-product>Add menu item</button>')+
 '<div class="toolbar"><input id="menu-search" class="search" type="search" aria-label="Search menu" placeholder="Search by item or category" value="'+esc(searchTerm)+'">'+
 '<select id="menu-category" class="select" aria-label="Filter category"><option value="">All categories</option>'+cats.map(c=>'<option value="'+esc(c)+'" '+(filterCategory===c?"selected":"")+'>'+esc(c)+'</option>').join("")+'</select></div>'+
 '<div id="menu-cards" class="product-grid">'+state.products.map(productCard).join("")+'</div><p class="status" id="menu-filter-status" role="status"></p>';
}
function filterMenu(){
 let total=0;const q=searchTerm.toLowerCase().trim();
 $$("[data-product-card]").forEach(node=>{
   const show=(!q||node.dataset.search.includes(q))&&(!filterCategory||node.dataset.category===filterCategory);
   node.hidden=!show;if(show)total++;
 });
 const status=$("#menu-filter-status");if(status)status.textContent=total+" matching menu items";
}
function renderLocation(){
 const l=state.location;
 return '<div class="split"><section class="panel"><p class="label">LIVE LOCATION EDITOR</p><h2 class="display-title">Where is the truck?</h2>'+
 '<form id="location-form" class="form-grid">'+
 field("Stop / venue name","name",l.name,true)+field("Address / map description","address",l.address,true)+
 field("Date","date",l.date,false,"date")+field("Hours (e.g. 11 AM – 3 PM)","hours",l.hours,false)+
 '<div class="field full"><label for="loc-photo">Website location / event photo URL</label><input id="loc-photo" name="photo" type="text" value="'+esc(l.photo||"")+'" placeholder="https://... or upload below"></div>'+
 '<div class="field full"><label for="loc-upload">Replace featured website photo</label><input id="loc-upload" type="file" accept="image/*" data-photo-upload="location" aria-describedby="loc-upload-help"><small class="soft-text" id="loc-upload-help">The image is resized and kept in this browser preview only.</small></div>'+
 '<label class="check field full"><input name="published" type="checkbox" '+(l.published?"checked":"")+'>Show this stop on the website preview</label>'+
 '<div class="action-row field full"><button class="btn primary" type="submit">Save location</button><button type="button" class="btn secondary" data-notify-location>Prepare location notification</button></div></form></section>'+
 '<section class="panel"><p class="label">CURRENT WEBSITE IMAGE</p>'+img(l.photo,"Current truck location photo","card-photo feature-photo")+
 '<h3 class="display-title">'+esc(l.name)+'</h3><p class="soft-text">'+esc(l.address||"Add the address here")+' '+esc(l.hours||"")+'</p>'+
 '<span class="'+(l.published?"red-chip":"muted-chip")+'">'+(l.published?"Website preview visible":"Not displayed yet")+'</span>'+
 '<div class="divider"></div><p class="soft-text">When this is connected to the actual website, approved changes will update the current location section. Sending subscriber notifications will require an opted-in mailing list and an activated service.</p></section></div>';
}
function field(label,name,value,full,type){
 return '<div class="field'+(full?" full":"")+'"><label for="fld-'+esc(name)+'">'+esc(label)+'</label><input id="fld-'+esc(name)+'" name="'+esc(name)+'" type="'+esc(type||"text")+'" value="'+esc(value||"")+'" '+(name==="name"?"required":"")+'></div>';
}
function renderEvents(){
 return section("Upcoming appearances","Create an event, give it its own website photo and set visibility.",'<button class="btn primary" type="button" data-new-event>Add an event</button>')+
 (state.events.length?'<div class="grid">'+state.events.map(e=>'<article class="event-card">'+img(e.photo,"Photo for "+e.title,"card-photo")+
 '<div><span class="label">'+esc(e.date||"DATE NOT SET")+'</span><h3>'+esc(e.title)+'</h3><p class="soft-text">'+esc([e.venue,e.address,e.time].filter(Boolean).join(" · "))+'</p>'+
 '<span class="'+(e.published?"red-chip":"muted-chip")+'">'+(e.published?"Visible on preview":"Draft only")+'</span>'+
 '<div class="action-row" style="margin-top:15px"><button class="btn secondary sm" data-edit-event="'+esc(e.id)+'">Edit event &amp; photo</button><button class="btn danger sm" data-delete-event="'+esc(e.id)+'">Delete draft</button></div></div></article>').join("")+'</div>':
 '<div class="empty"><h3>Ready for the next event.</h3>Add a date, location and image whenever Knockout books its next stop. No imaginary events have been published.</div>')+
 section("Featured event image","This photo is used in the website preview when the event is visible.")+
 '<div class="panel">'+img(state.events.find(x=>x.published)?.photo||"../assets/knockout-community.webp","Example event website photo","card-photo feature-photo")+'</div>';
}
function renderOffers(){
 const o=state.offer;
 return '<div class="split"><section class="panel"><p class="label">PROMOTIONAL BANNER</p><h2 class="display-title">A reason to stop by.</h2>'+
 '<form id="offer-form" class="form-grid">'+
 field("Promo headline","title",o.title,true)+
 '<div class="field full"><label for="offer-description">Short offer details</label><textarea id="offer-description" name="description">'+esc(o.description||"")+'</textarea></div>'+
 '<div class="field"><label for="offer-discount">Discount (%)</label><input id="offer-discount" type="number" name="discount" min="0" max="90" step="1" value="'+(Number(o.discount)||0)+'"></div>'+
 '<div class="field"><label for="offer-product">Apply to</label><select id="offer-product" name="productId"><option value="all">All menu items</option>'+state.products.map(p=>'<option value="'+esc(p.id)+'" '+(o.productId===p.id?"selected":"")+'>'+esc(p.name)+'</option>').join("")+'</select></div>'+
 '<label class="check field full"><input name="enabled" type="checkbox" '+(o.enabled?"checked":"")+'>Show discount in the customer preview</label>'+
 '<div class="field full action-row"><button class="btn primary">Save promotion</button><button type="button" data-view="alerts" class="btn secondary">Prepare promo alert</button></div></form></section>'+
 '<section class="panel"><p class="label">BANNER PREVIEW</p><div style="background:#C7262D;color:#fff;padding:25px;border-radius:13px;margin:10px 0">'+
 '<p style="font-size:10px;letter-spacing:.14em">KNOCKOUT DELI / OFFERS</p><h3 style="font:800 37px/1 Barlow Condensed,sans-serif;margin:10px 0">'+esc(o.title||"YOUR NEXT SPECIAL.")+'</h3><p style="font-size:13px">'+esc(o.description||"Add an offer to preview it here.")+'</p>'+
 (o.discount?'<strong>'+esc(o.discount)+'% OFF</strong>':'')+'</div><span class="'+(o.enabled?"red-chip":"muted-chip")+'">'+(o.enabled?"Visible in preview":"Draft / hidden")+'</span><p class="soft-text">An item's own discount and the promotion do not stack. The larger discount is shown.</p></section></div>';
}
function defaultAlert(type){
 const e=state.events.filter(x=>x.published)[0],l=state.location,o=state.offer;
 if(type==="event")return {subject:"Knockout Deli is heading to "+(e?.venue||"a new event"),body:"Find us at "+(e?.venue||"our upcoming event")+". "+[e?.date,e?.time,e?.address].filter(Boolean).join(" · ")+". Come hungry!"};
 if(type==="offer")return {subject:o.title||"A new Knockout special",body:(o.description||"A new offer is on the menu.")+(o.discount?" "+o.discount+"% off selected items.":"")};
 return {subject:"Find Knockout Deli at "+(l.name||"our next stop"),body:"Our next truck stop: "+(l.name||"to be announced")+". "+[l.address,l.date,l.hours].filter(Boolean).join(" · ")+". See you there!"};
}
function renderAlerts(){
 const draft=state.alertDraft||{type:"location",subject:defaultAlert("location").subject,body:defaultAlert("location").body};
 return '<div class="notice"><strong>Preview mode, no messages are sent.</strong>Actual email or SMS announcements would require subscriber consent, a secure sending provider, and owner approval. Saving below only adds an example to the demo history.</div>'+
 '<div class="split"><section class="panel"><p class="label">MESSAGE COMPOSER</p><h2 class="display-title">Tell them where to go.</h2>'+
 '<form id="alert-form" class="form-grid"><div class="field full"><label for="alert-kind">Alert type</label><select id="alert-kind" name="type"><option value="location" '+(draft.type==="location"?"selected":"")+'>New location</option><option value="event" '+(draft.type==="event"?"selected":"")+'>Upcoming event</option><option value="offer" '+(draft.type==="offer"?"selected":"")+'>New promotion</option></select></div>'+
 field("Email subject","subject",draft.subject,true)+
 '<div class="field full"><label for="alert-body">Message preview</label><textarea id="alert-body" name="body" maxlength="700" required>'+esc(draft.body||"")+'</textarea></div>'+
 '<div class="field full"><label for="alert-target">Audience</label><select id="alert-target" name="audience"><option value="opt-in">Customers who opted in (future integration)</option></select></div>'+
 '<div class="field full action-row"><button class="btn primary" type="submit">Save preview alert</button></div></form></section>'+
 '<section class="panel"><p class="label">EMAIL PREVIEW</p><div style="border:1px solid #e5dad3;border-radius:15px;overflow:hidden;margin-top:11px"><div style="background:#191919;color:#fff;padding:21px;font:800 25px Barlow Condensed,sans-serif">KNOCKOUT DELI</div><div style="padding:19px"><small class="soft-text">To: opted-in subscribers (not connected)</small><h3 id="email-preview-subject" style="font:800 25px Barlow Condensed,sans-serif;margin:13px 0">'+esc(draft.subject)+'</h3><p class="soft-text" id="email-preview-body">'+esc(draft.body)+'</p><span class="muted-chip">Preview · Not sent</span></div></div></section></div>'+
 section("Demo alert history","These entries were saved in this browser and never delivered.")+
 (state.alerts.length?state.alerts.map(a=>'<div class="list-row"><div><strong>'+esc(a.subject)+'</strong><small>'+esc(a.type)+" · "+esc(a.createdAt||"")+'</small></div><span class="muted-chip">NOT SENT</span></div>').join(""):'<div class="empty">No preview alerts saved yet.</div>');
}
function renderRequests(){
 return '<div class="grid cols-3">'+
 '<div class="panel metric"><small>Real orders</small><strong>—</strong></div>'+
 '<div class="panel metric"><small>Live inquiries</small><strong>—</strong></div>'+
 '<div class="panel metric"><small>Square payments</small><strong>—</strong></div></div>'+
 section("Request management","Where customer orders and event inquiries would appear once activated.")+
 '<div class="grid cols-2"><div class="panel"><span class="label">PICKUP ORDERS</span><h3 class="display-title">Review incoming pickup orders.</h3><p class="soft-text">A future connected panel will show item details, payment status and owner approval. No order is created here and no payment is collected.</p><span class="muted-chip">Demo · no orders</span></div>'+
 '<div class="panel"><span class="label">EVENT & CATERING INQUIRIES</span><h3 class="display-title">Follow up with every inquiry.</h3><p class="soft-text">The $120 plan would automatically acknowledge receipt only. Knockout handles the reply. The $200 plan adds approved follow-ups managed through the agreed automation.</p><span class="muted-chip">Demo · no live inquiries</span></div></div>';
}
function renderContent(){
 return '<div class="notice"><strong>Included with the managed monthly plan</strong>The Launch Era can maintain this Admin Panel, the menu and website, and prepare up to 20 scheduled Instagram posts per month, subject to approval. No social posts are published from this demo.</div>'+
 section("Content planner","Organize an Instagram draft for Knockout.",'<button type="button" data-new-social class="btn primary">Add content draft</button>')+
 (state.social.length?state.social.map(p=>'<div class="list-row"><div><strong>'+esc(p.title)+'</strong><small>'+esc(p.date||"Date not set")+' · '+esc(p.caption||"")+'</small></div><span class="muted-chip">DRAFT</span></div>').join(""):'<div class="empty">Your first social content draft can be created here.</div>')+
 section("Plan comparison","Business owners keep their own Admin Panel access in both packages.")+
 '<div class="grid cols-2"><div class="panel"><span class="label">$120 / ONE-TIME</span><h3 class="display-title">Owner-managed</h3><p class="soft-text">Knockout changes prices, photos, availability, events and locations using the Admin Panel. Inquiry receipt is automated; replies are manual.</p></div>'+
 '<div class="panel"><span class="label">$200 / MONTH</span><h3 class="display-title">Managed for you</h3><p class="soft-text">Everything in the first package, plus The Launch Era manages the Admin Panel and agreed social content, email workflows and updates.</p></div></div>';
}
function renderPreview(){
 const products=state.products.filter(p=>p.available).slice(0,8),published=state.events.filter(e=>e.published).slice(0,2),l=state.location,o=state.offer;
 let phone='<div class="phone"><div class="phone-hero">'+img(l.published?l.photo:"../assets/knockout-live-music.webp","Knockout Deli website hero","card-photo")+'<div class="phone-mark">NEW YORK DELI.<br>ON WHEELS.</div></div>';
 if(o.enabled&&o.title)phone+='<div class="phone-offer">'+esc(o.title)+(o.description?" · "+esc(o.description):"")+'</div>';
 if(l.published)phone+='<div class="phone-location"><strong>NEXT TRUCK STOP</strong><br>'+esc(l.name)+'<br>'+esc([l.address,l.date,l.hours].filter(Boolean).join(" · "))+'</div>';
 phone+='<div class="phone-inside"><p class="label">OUR MENU / FAVORITES</p><div class="phone-items">'+products.map(p=>'<div class="phone-item">'+(p.image?img(p.image,p.name,"product-photo"):'<div class="no-photo">PHOTO PENDING</div>')+'<div><strong>'+esc(p.name)+'</strong><span>'+fmt(salePrice(p))+'</span></div></div>').join("")+'</div></div>';
 for(const e of published)phone+='<div class="phone-event">'+img(e.photo,"Event: "+e.title,"card-photo")+'<strong style="display:block;margin-top:10px">'+esc(e.title)+'</strong><span>'+esc([e.venue,e.date,e.time].filter(Boolean).join(" · "))+'</span></div>';
 phone+='<div class="phone-footer">KNOCKOUT DELI · WEBSITE MOCKUP / PREVIEW ONLY</div></div>';
 return '<div class="grid preview-grid"><section class="panel"><p class="label">THE CUSTOMER VIEW</p><h2 class="display-title">Changes, without guessing.</h2><p class="soft-text">The mock website on the right reflects changes you made in the Admin Panel. Nothing has been pushed to the real Knockout website.</p><div class="action-row" style="margin:19px 0"><button class="btn secondary" data-view="menu">Edit menu</button><button class="btn secondary" data-view="locations">Edit location</button><button class="btn secondary" data-view="events">Edit event</button></div><div class="notice"><strong>Integration needed for live publishing</strong>Customer-facing updates and real subscriber emails require secure backend, authorization and approved publishing workflows.</div></section><section class="panel">'+phone+'</section></div>';
}
const renderers={dashboard:renderDashboard,menu:renderMenu,locations:renderLocation,events:renderEvents,offers:renderOffers,alerts:renderAlerts,requests:renderRequests,content:renderContent,preview:renderPreview};
function setView(next){
 if(!renderers[next])return;
 view=next;
 const h=headings[next];
 $("#crumb").textContent="KNOCKOUT DELI / "+next.toUpperCase();
 $("#eyebrow").textContent=h[0];$("#page-title").textContent=h[1];$("#page-description").textContent=h[2];
 $("#view-root").innerHTML=renderers[next]();
 $$("[data-view]").forEach(n=>{if(n.classList.contains("nav-btn")){if(n.dataset.view===next)n.setAttribute("aria-current","page");else n.removeAttribute("aria-current");}});
 if(next==="menu")filterMenu();
 window.scrollTo({top:0,behavior:"instant"});
}
function drawNav(){
 const mobile=$("#mobile-nav");
 for(const [name,num,label] of navLabels.filter((x)=>["dashboard","menu","locations","events"].includes(x[0]))){
  const b=el("button","nav-btn");b.type="button";b.dataset.view=name;b.append(el("span","",num),document.createTextNode(label));mobile.append(b);
 }
}
function productEditor(id){
 const p=state.products.find(x=>x.id===id)||{id:"",name:"",price:0,description:"",category:"Ringside Favorites",available:true,discount:0,image:""};
 editPhoto=null;
 const cats=[...new Set(state.products.map(x=>x.category)), "Breakfast","Main Event","Ringside Favorites","Take Home","Beverages"];
 const unique=[...new Set(cats)];
 modal(id?"Edit "+p.name:"Add menu item",
 '<form id="product-form" class="form-grid"><input type="hidden" name="id" value="'+esc(p.id)+'">'+
 field("Product name","name",p.name,true)+
 '<div class="field"><label>Price ($)<input type="number" name="price" required min="0" max="500" step=".01" value="'+esc(p.price??"")+'"></label></div>'+
 '<div class="field"><label>Discount (%)<input type="number" name="discount" min="0" max="90" step="1" value="'+(Number(p.discount)||0)+'"></label></div>'+
 '<div class="field full"><label>Category<select name="category">'+unique.map(c=>'<option '+(p.category===c?"selected":"")+' value="'+esc(c)+'">'+esc(c)+'</option>').join("")+'</select></label></div>'+
 '<div class="field full"><label>Description<textarea name="description">'+esc(p.description||"")+'</textarea></label></div>'+
 '<div class="field full"><label>Product photo URL<input type="text" name="image" value="'+esc(p.image||"")+'" placeholder="https://... or upload an image"></label></div>'+
 '<div class="field full"><label>Replace product photo<input type="file" accept="image/*" data-photo-upload="product" aria-label="Upload a product photo"></label><small class="soft-text">Upload a real product photo. It stays in your browser during this demo.</small></div>'+
 '<div class="field full" id="editor-photo-preview">'+img(p.image,p.name,"card-photo")+'</div>'+
 '<label class="check field full"><input type="checkbox" name="available" '+(p.available?"checked":"")+'>Available for customers</label>'+
 '<div class="field full action-row"><button class="btn primary" type="submit">Save menu item</button><button class="btn secondary" type="button" data-close-modal>Cancel</button></div></form>');
}
function eventEditor(id){
 const p=state.events.find(x=>x.id===id)||{id:"",title:"",venue:"",address:"",date:"",time:"",description:"",photo:"../assets/knockout-community.webp",published:false};
 editPhoto=null;
 modal(id?"Edit event":"Add an event",
 '<form id="event-form" class="form-grid"><input type="hidden" name="id" value="'+esc(p.id)+'">'+
 field("Event name","title",p.title,true)+field("Venue / location","venue",p.venue,true)+
 field("Street address","address",p.address,true)+field("Date","date",p.date,false,"date")+field("Hours","time",p.time,false)+
 '<div class="field full"><label>Event details<textarea name="description">'+esc(p.description||"")+'</textarea></label></div>'+
 '<div class="field full"><label>Website event photo URL<input type="text" name="photo" value="'+esc(p.photo||"")+'"></label></div>'+
 '<div class="field full"><label>Upload new event photo<input type="file" accept="image/*" data-photo-upload="event" aria-label="Upload event photo"></label></div>'+
 '<div class="field full" id="editor-photo-preview">'+img(p.photo,p.title||"Event preview","card-photo")+'</div>'+
 '<label class="check field full"><input type="checkbox" name="published" '+(p.published?"checked":"")+'>Show event on the website preview</label>'+
 '<div class="field full action-row"><button class="btn primary" type="submit">Save event</button><button type="button" class="btn secondary" data-close-modal>Cancel</button></div></form>');
}
function socialEditor(){
 modal("Create content draft",
 '<form id="social-form" class="form-grid">'+field("Post title","title","",true)+field("Planned date","date","",true,"date")+
 '<div class="field full"><label>Caption draft<textarea name="caption" maxlength="1200"></textarea></label></div>'+
 '<div class="field full action-row"><button type="submit" class="btn primary">Save content draft</button><button type="button" data-close-modal class="btn secondary">Cancel</button></div></form>');
}
function updatePhotoPreview(value){
 const slot=$("#editor-photo-preview");if(!slot)return;
 slot.innerHTML=img(value,"New photo preview","card-photo");
}
function newId(prefix){return prefix+"-"+Math.random().toString(36).slice(2,10);}
async function uploadImage(input){
 const file=input.files&&input.files[0];if(!file)return;
 if(!file.type.startsWith("image/")){toast("Choose a JPG, PNG or WebP image.");return;}
 if(file.size>8*1024*1024){toast("Use an image smaller than 8 MB.");return;}
 try{
   const image=new Image();const objectUrl=URL.createObjectURL(file);
   await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=objectUrl;});
   const max=850,ratio=Math.min(1,max/Math.max(image.width,image.height));
   const canvas=document.createElement("canvas");
   canvas.width=Math.max(1,Math.round(image.width*ratio));canvas.height=Math.max(1,Math.round(image.height*ratio));
   canvas.getContext("2d").drawImage(image,0,0,canvas.width,canvas.height);
   URL.revokeObjectURL(objectUrl);
   const value=canvas.toDataURL("image/jpeg",.74);
   editPhoto={type:input.dataset.photoUpload,value};
   if(input.dataset.photoUpload==="location"){
    const f=$("#location-form");if(f){f.elements.photo.value="";img(location.href,value);}
    const imgNode=$("#view-root .panel img");
    if(imgNode&&imgNode.tagName==="IMG")imgNode.src=value;
   }else updatePhotoPreview(value);
   toast("Photo ready. Save to keep it in the preview.");
 }catch(err){toast("This image could not be opened.");}
}
function submitForm(form){
 const d=new FormData(form),id=String(d.get("id")||"");
 if(form.id==="product-form"){
  const name=String(d.get("name")||"").trim(),cost=Number(d.get("price"));
  if(!name||!Number.isFinite(cost)||cost<0){toast("Enter a valid name and price.");return;}
  let p=state.products.find(x=>x.id===id);
  if(!p){p={id:newId("custom"),nameEs:name,descriptionEs:"",categoryEs:"",available:true};state.products.push(p);}
  p.name=name;p.price=cost;p.category=String(d.get("category")||"Ringside Favorites");p.description=String(d.get("description")||"").trim();
  p.discount=Math.max(0,Math.min(90,Number(d.get("discount"))||0));p.available=d.get("available")==="on";
  const selected=editPhoto?.type==="product"?editPhoto.value:String(d.get("image")||"").trim();
  if(selected&&!urlImage(selected)){toast("Photo must be an image upload or HTTP(S) link.");return;}
  p.image=selected||null;persist();closeModal();setView("menu");toast("Menu item saved in demo.");
 }else if(form.id==="event-form"){
  const title=String(d.get("title")||"").trim();if(!title){toast("Enter an event name.");return;}
  let e=state.events.find(x=>x.id===id);if(!e){e={id:newId("event")};state.events.push(e);}
  for(const key of ["venue","address","date","time","description"])e[key]=String(d.get(key)||"").trim();
  e.title=title;e.published=d.get("published")==="on";
  const photo=editPhoto?.type==="event"?editPhoto.value:String(d.get("photo")||"").trim();
  if(photo&&!urlImage(photo)){toast("Use a valid event photo URL or upload.");return;}
  e.photo=photo||null;persist();closeModal();setView("events");toast("Event saved in demo.");
 }else if(form.id==="location-form"){
  const name=String(d.get("name")||"").trim();if(!name){toast("Add a location name.");return;}
  for(const key of ["name","address","date","hours"])state.location[key]=String(d.get(key)||"").trim();
  state.location.published=d.get("published")==="on";
  const photo=editPhoto?.type==="location"?editPhoto.value:String(d.get("photo")||"").trim();
  if(photo&&!urlImage(photo)){toast("Use a valid location photo URL or upload.");return;}
  state.location.photo=photo||null;editPhoto=null;persist();setView("locations");toast("Location saved in demo. No messages sent.");
 }else if(form.id==="offer-form"){
  const o=state.offer;for(const k of ["title","description","productId"])o[k]=String(d.get(k)||"").trim();
  o.discount=Math.max(0,Math.min(90,Number(d.get("discount"))||0));o.enabled=d.get("enabled")==="on";
  persist();setView("offers");toast("Promotion saved in demo.");
 }else if(form.id==="alert-form"){
  const type=String(d.get("type")||"location"),subject=String(d.get("subject")||"").trim(),body=String(d.get("body")||"").trim();
  if(!subject||!body){toast("Subject and message are required.");return;}
  state.alerts.unshift({id:newId("alert"),type,subject,body,createdAt:new Date().toLocaleString("en-US")});
  state.alertDraft={type,subject,body};persist();setView("alerts");toast("Alert preview saved. Nothing was sent.");
 }else if(form.id==="social-form"){
  const title=String(d.get("title")||"").trim();if(!title){toast("Add a post title.");return;}
  state.social.unshift({id:newId("post"),title,date:String(d.get("date")||""),caption:String(d.get("caption")||"")});
  persist();closeModal();setView("content");toast("Social content draft saved.");
 }
}
function handleClick(event){
 const target=event.target.closest("button,[data-view]");if(!target)return;
 if(target.matches("[data-view]")){setView(target.dataset.view);return;}
 if(target.hasAttribute("data-close-modal")||target.id==="modal-close"){closeModal();return;}
 if(target.hasAttribute("data-edit-product")){productEditor(target.dataset.editProduct);return;}
 if(target.hasAttribute("data-new-product")){productEditor("");return;}
 if(target.hasAttribute("data-new-event")){eventEditor("");return;}
 if(target.hasAttribute("data-edit-event")){eventEditor(target.dataset.editEvent);return;}
 if(target.hasAttribute("data-delete-event")){
  if(!confirm("Remove this event from the demo?"))return;
  state.events=state.events.filter(x=>x.id!==target.dataset.deleteEvent);persist();setView("events");toast("Event removed from demo.");return;
 }
 if(target.hasAttribute("data-new-social")){socialEditor();return;}
 if(target.hasAttribute("data-notify-location")){
  const d=defaultAlert("location");state.alertDraft={type:"location",subject:d.subject,body:d.body};setView("alerts");return;
 }
}
function handleInput(event){
 const t=event.target;
 if(t.id==="menu-search"){searchTerm=t.value;filterMenu();}
 if(t.id==="menu-category"){filterCategory=t.value;filterMenu();}
 if(t.id==="alert-kind"){
  const d=defaultAlert(t.value),f=$("#alert-form");
  if(f){f.elements.subject.value=d.subject;f.elements.body.value=d.body;}
  const subj=$("#email-preview-subject"),body=$("#email-preview-body");
  if(subj)subj.textContent=d.subject;if(body)body.textContent=d.body;
 }
 if(t.closest("#alert-form")&&["subject","body"].includes(t.name)){
  const node=$("#email-preview-"+(t.name==="subject"?"subject":"body"));if(node)node.textContent=t.value;
 }
}
document.addEventListener("click",handleClick);
document.addEventListener("submit",(e)=>{if(e.target.id&&["product-form","event-form","location-form","offer-form","alert-form","social-form"].includes(e.target.id)){e.preventDefault();submitForm(e.target);}});
document.addEventListener("change",(e)=>{if(e.target.matches("[data-photo-upload]"))void uploadImage(e.target);else handleInput(e);});
document.addEventListener("input",handleInput);
document.addEventListener("keydown",(e)=>{if(e.key==="Escape"&&!$("#modal-backdrop").hidden)closeModal();});
$("#modal-backdrop").addEventListener("click",(e)=>{if(e.target.id==="modal-backdrop")closeModal();});
drawNav();
fetch("./menu-catalog.json",{cache:"no-store"}).then(async(response)=>{
 if(!response.ok)throw Error("Official menu data unavailable");
 const items=await response.json();
 if(!Array.isArray(items)||items.length<25)throw Error("Official menu is incomplete");
 load(items);setView("dashboard");
}).catch((error)=>{
 $("#view-root").innerHTML='<div class="empty"><h3>Menu data unavailable.</h3>The Admin Panel needs the approved Knockout Deli catalog to load. No changes were made. <br><small>'+esc(error.message)+'</small></div>';
});
})();