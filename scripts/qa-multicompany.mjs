import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const app=readFileSync('public/command-center/assets/command-center-app.js','utf8');
const cbExperience=readFileSync('public/assets/cb-depot-experience.js','utf8');
assert(cbExperience.includes('trim().toLowerCase()!=="cb depot")return;'),'CB Depot artwork must remain exclusive to its business');
const booking=readFileSync('public/assets/booking-template-live.js','utf8');
const html=readFileSync('public/command-center/index.html','utf8');
const defaults=app.slice(app.indexOf('function buyerSetDefaultMessage(){'),app.indexOf('function buyerManualLeads(){'));
for(const language of ['en','es'])for(const category of ['cleaning','detailing','other'])for(const action of ['reply','declined','booked','reviewing']){
 const elements=new Map();const $=id=>{if(!elements.has(id))elements.set(id,{value:id==='buyerRequestAction'?action:'',classList:{toggle(){}}});return elements.get(id)};
 const name='Fixture '+category;
 const ctx={$ ,workspace:{name},buyerSelectedRequest:{status:'new',preferred_language:language,customer_name:'Alex',service_name:'Fixture service'},isDetailingWorkspace:()=>category==='detailing',isOtherServiceWorkspace:()=>category==='other'};
 vm.createContext(ctx);vm.runInContext(defaults,ctx);ctx.buyerSetDefaultMessage();const text=$('buyerRequestMessage').value;
 assert(!text.includes('CB Depot'),category+' borrowed CB Depot identity');assert(text.endsWith(name));
 if(category==='detailing'&&action==='reply')assert(text.includes('contact'+(language==='es'?'ar a ':'ing ')+name));
}
const identity=booking.match(/function isVehicleBusiness\(\)\{[^\n]+\}/)?.[0];assert(identity);
for(const [model,expected] of [[{business_name:'Fixture Auto',business_category:'detailing'},true],[{business_name:'Auto Office',business_category:'other'},false],[{business_name:'CB Depot'},true],[{business_name:'Fixture Cleaning',business_category:'cleaning'},false]]){
 const ctx={session:{model},clean:x=>String(x||'')};vm.createContext(ctx);vm.runInContext(identity,ctx);assert.equal(ctx.isVehicleBusiness(),expected);
}
assert(!app.includes('/CB Depot|detail|auto/i.test(name)'),'Business names must not choose a sector');
assert(app.includes("$('cbDetailingTop')?.classList.toggle('hidden',!cbDepot)"),'CB hero is account-specific');
assert(!/<img class="pa-logo"[^>]+cb-depot/.test(html),'Other accounts must not load CB Depot activation branding');
assert(!booking.includes('workers.dev'),'Official preview must communicate with official origin');
assert(booking.includes('event.source!==window.parent'),'Preview must verify parent window');
assert(!app.includes("config:builderPreviewData},'*')"),'Private config must target a specific origin');
assert(app.includes('send.disabled=!activationReady||accessDelivered||!!a.already_queued'),'Completed delivery disables duplicate activation');
const filterLine=booking.split('\n').find(line=>line.includes('session.validSlots=(model.slots||[]).filter'));
assert(filterLine);const slotCheck={session:{},model:{slots:['09:00','09:15','09:30','09:45','23:59','24:00','09:60','9:15','bad']}};vm.createContext(slotCheck);vm.runInContext(filterLine,slotCheck);assert.deepEqual(Array.from(slotCheck.session.validSlots),['09:00','09:15','09:30','09:45','23:59']);
const slotRx=/^(?:[01]\d|2[0-3]):(?:[0-5]\d)$/;
for(const value of ['09:00','09:15','09:30','09:45','23:59'])assert(slotRx.test(value));
for(const value of ['24:00','09:60','9:15','bad'])assert(!slotRx.test(value));
assert(booking.includes('(?:[0-5]\\d)$'),'Backend-authorized minute slots must remain supported');
console.log('PASS multi-company identity, EN/ES messages, industry routing, private preview origin, activation guard and minute slots');
