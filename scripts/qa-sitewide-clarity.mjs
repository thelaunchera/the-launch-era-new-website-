/** Non-mutating guard for clear EN/ES public website copy. No network or customer data. */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=f=>readFileSync(f,"utf8");
const en=read("src/routes/booking-lead-automation.tsx");
const es=read("src/routes/es.booking-lead-automation.tsx");
const homeEn=read("src/components/editorial-sections.tsx");
const homeEs=read("src/routes/es.index.tsx");
const app=read("src/components/cleaning-app-editorial.tsx");
const siteEn=read("src/routes/website-automation.tsx");
const siteEs=read("src/routes/es.website-automation.tsx");
const vaEn=read("src/routes/virtual-assistant.tsx");
const vaEs=read("src/routes/es.virtual-assistant.tsx");
const bundle=read("public/booking-bundle/index.html");
const demo=read("public/booking-demo/index.html");
const assistantEn=read("public/ai-booking-assistant/index.html");
const assistantEs=read("public/es/ai-booking-assistant/index.html");
const waEn=read("public/whatsapp-ai-agent/index.html");
const waEs=read("public/es/whatsapp-ai-agent/index.html");
const faq=read("src/components/service-faq.tsx");
const guide=read("src/components/freebie-page.tsx");
const urls=[
["home en",homeEn,"/booking-demo/?lang=en"],
["home es",homeEs,"/booking-demo/?lang=es"],
["booking en",en,"/booking-demo/?lang=en"],
["booking es",es,"/booking-demo/?lang=es"],
["website en",siteEn,"/service-checkout/?offer=website-automation&lang=en"],
["website es",siteEs,"/service-checkout/?offer=website-automation&lang=es"],
["va en",vaEn,"/service-checkout/?offer=va&lang=en"],
["va es",vaEs,"/service-checkout/?offer=va&lang=es"],
["ai en",assistantEn,"/booking-demo/?lang=en"],
["ai es",assistantEs,"/booking-demo/?lang=es"]
];
for(const [name,source,url] of urls)assert(source.includes(url),name+" CTA missing");
for(const [name,source] of [["ai en",assistantEn],["ai es",assistantEs]])
 assert(!source.includes("lead-private-preview.html?business="),name+" must not bypass private Booking demo access");
for(const [name,source] of [["home en",homeEn],["home es",homeEs],["booking en",en],["booking es",es],["website en",siteEn],["website es",siteEs],["va en",vaEn],["va es",vaEs],["bundle",bundle],["booking request",demo],["app",app],["freebie",guide],["ai en",assistantEn],["ai es",assistantEs],["WhatsApp en",waEn],["WhatsApp es",waEs]]){
 assert(!/lead catcher|lead capture|captador de leads|embudo de ventas/ig.test(source),name+" must avoid internal sales framing");
 assert(!/@@TODO|INSERT_COPY_HERE/.test(source),name+" incomplete copy");
}
assert(en.includes("Fixed-price bookings confirm automatically only when enabled"),"Booking confirmation must remain conditional");
assert(es.includes("solo si lo activas"),"Booking confirmation Spanish condition missing");
assert(en.includes("Up to two automatic follow-ups"),"Follow-up cap missing");
assert(es.includes("Hasta dos seguimientos automáticos"),"Follow-up cap in Spanish missing");
assert(en.includes("48-hour production") && es.includes("48 horas"),"Production estimate missing");
assert(bundle.includes("4 business days") && bundle.includes("4 días hábiles"),"Bundle production terms must be retained");
assert(bundle.includes("20-minute") && bundle.includes("20 minutos"),"Optional guidance terms must be retained");
for(const price of ["$59.99","$35","$49.99","$25","$3.99","$15","$14","$19"])assert([en,es,siteEn,vaEn,app,assistantEn,assistantEs,homeEn,bundle].some(s=>s.includes(price)),"Missing pricing indicator "+price);
for(const field of ['name="name"','name="email"','name="business"','name="serviceArea"'])
 assert(demo.includes(field),"Booking request form field missing: "+field);
assert(demo.includes('id="demoForm"') && demo.includes("tle-personalized-demo"),"Booking request backend/submit must remain unchanged");
assert(assistantEn.includes("source=ai-assistant-landing") && assistantEs.includes("source=ai-assistant-landing"),"AI sample CTAs must use normal private preview request");
assert(waEn.includes("COMING SOON") && waEs.includes("COMING SOON"),"WhatsApp AI must not be advertised as launched");
assert(app.includes("30 days free") && app.includes("30 días gratis"),"Cleaning App trial terms must be present");
assert(faq.includes("48 hours") && faq.includes("48 horas"),"FAQ should preserve delivery terms");
for(const [name,source] of [["bundle",bundle],["booking form",demo]]){
 assert(source.includes("data-en") && source.includes("data-es") || name==="booking form" && source.includes("en:{") && source.includes("es:{"),name+" bilingual translations absent");
}
console.log("PASS: concise EN/ES homepage, services and demos; prices, forms, private Booking gate, and delivery terms preserved.");
