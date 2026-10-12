import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
const source=readFileSync('supabase/functions/tle-ai-booking-demo/index.ts','utf8');
const helpers=source.slice(source.indexOf('function bookingDraft('),source.indexOf('function localDate('));
const context={clean:(x,max=400)=>String(x??'').replace(/[<>\u0000-\u001f]/g,' ').trim().slice(0,max)};
vm.createContext(context);vm.runInContext(stripTypeScriptTypes(helpers),context);
for(const lang of ['en','es']){
 const answer=context.serviceQuestion(lang==='es'?'¿Qué servicios ofrecen?':'What services do you offer?','Standard cleaning, move-out cleaning',lang);
 assert(answer.includes('Standard cleaning'));assert(!answer.includes('Palm Beach'));
 const unknown=context.serviceQuestion(lang==='es'?'¿Qué incluye?':'What is included?', 'Standard cleaning',lang);
 assert(!/oven|horno|supplies|productos/i.test(unknown));
 assert.equal(context.serviceQuestion('3 bedrooms and 2 bathrooms','Standard cleaning',lang),'');
 const draft=context.bookingDraft({category:'commercial',service:'commercial',commercial_space_type:'Restaurant',frequency:'weekly'});
 const summary=context.requestSummary(draft,lang);assert(summary.missing.includes(lang==='es'?'tamaño aproximado':'approximate size'));assert.equal(summary.status,'draft');
}
const app=readFileSync('public/command-center/assets/command-center-app.js','utf8');
const briefCode=app.slice(app.indexOf('function buyerAssistantBrief('),app.indexOf('function buyerOpenRequest('));
for(const es of [false,true]){
 const ctx={buyerEs:()=>es,buyerText:(en,sp)=>es?sp:en,buyerRequestNext:()=>es?'Revisa la respuesta':'Review the reply'};vm.createContext(ctx);vm.runInContext(briefCode,ctx);
 const brief=ctx.buyerAssistantBrief({service_name:'Deep cleaning',customer_email:'test@example.invalid',raw_payload:{managed_reply_received:true}});
 assert(brief.need.includes('Deep cleaning'));assert(brief.response.includes(es?'respondió':'replied'));assert(brief.missing.includes(es?'lugar':'location'));
 assert.equal(ctx.buyerAssistantBrief({service_name:'Vehicle detailing',customer_phone:'example',service_address:'Example',raw_payload:{vehicle_type:'SUV'}}).need,'Vehicle detailing · SUV');
}
console.log('PASS service questions, unknown scope, commercial missing details, EN/ES request brief, reply handoff and industry isolation');
