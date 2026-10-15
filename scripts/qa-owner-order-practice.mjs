import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const practice=readFileSync('public/command-center/order-practice/index.html','utf8');
const cc=readFileSync('public/command-center/index.html','utf8');
assert(practice.includes('<html lang="es">'),'Practice must be friendly to the owner in Spanish');
assert(practice.includes('name="viewport"')&&practice.includes('@media(max-width:560px)'),'Phone layout required');
assert(practice.includes('content="noindex,nofollow,noarchive"'),'Practice must not be indexed');
assert(cc.includes('id="ownerPracticeOrder" href="./order-practice/"'),'Practice must be reachable from Owner Order Control');
assert(cc.indexOf('id="ownerPracticeOrder"')>cc.indexOf('id="ownerOrderControl"'),'Practice entry must be inside owner-only order section');
for(const id of ['product','language','mainTitle','intro','flag','progress','bar','step','checks','warning','feedback','prev','next','finish'])
 assert(practice.includes('id="'+id+'"'),'Missing practice control '+id);
for(const phrase of ['Pago recibido','Intake y detalles del negocio','Pruebas reales de QA','Entrega final y soporte','AI Assistant purchase','Delivery and billing','No se guardan','No se guarda','Sin pagos','no crea compras']){
 assert(practice.toLowerCase().includes(phrase.toLowerCase()),'Missing owner practice behavior/copy '+phrase);
}
assert(practice.includes('const history={booking:{},ai:{}}'),'Practice must separate scenarios');
assert(practice.includes("const active=()=>"),'Separate sample flow per product');
assert(practice.includes("root.querySelectorAll('input')"),'Progress should depend on actual checkbox state');
const js=[...practice.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');
assert(js.trim().length>5000);
new Function(js);
assert(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|WebSocket|Stripe\(/i.test(js),'Practice must not call providers or retain customer data');
assert(!/<form\b/i.test(practice),'Practice must not submit live orders');
console.log('PASS No-cost EN/ES booking and AI practice: isolated, mobile, interactive, no payment or outbound calls.');
