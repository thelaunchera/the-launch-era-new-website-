/**
 * TLE bilingual Owner Center and demo library static regression.
 * Run: node scripts/qa-owner-bilingual.mjs
 * No network requests, production writes, actual bookings or payments.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Script,createContext} from "node:vm";

const read=p=>readFileSync(p,"utf8");
const lib=read("public/demos/index.html");
const owner=read("public/demos/owner-center/index.html");
const english=read("public/website-for-your-business/index.html");
const spanish=read("public/es/website-for-your-business/index.html");
const locale=read("public/assets/tle-demo-locale-20261108.js");
const dictionary=new Script(locale,{filename:"tle-demo-locale-20261108.js"});

const context=search=>{
 const env={window:{},location:{search,href:"https://thelaunchera.com/demos/?demo=golden-grid&returnTo=%2Fes%2Fwebsite-for-your-business%2F"+search},URL,URLSearchParams};
 createContext(env);dictionary.runInContext(env);
 return env.window.TLELocale;
};
const es=context("&lang=es"),en=context("&lang=en");
assert.equal(es.isEs,true);
assert.equal(en.isEs,false);
for(const [src,expected] of [
 ["Menu items","Productos del menú"],
 ["Services + Booking","Services + Booking"], // UI has uppercase label, see next assertion
 ["SERVICES + BOOKING","SERVICIOS Y RESERVAS"],
 ["Save changes","Guardar cambios"],
 ["Reset demo","Restablecer demo"],
 ["Edit item","Editar producto"],
 ["Discount (%)","Descuento (%)"],
 ["Orders","Pedidos"],
 ["Bookings","Reservas"],
 ["Available","Disponible"],
 ["No items currently available.","No hay productos disponibles por ahora."],
 ["Explore demo","Explorar demo"],
 ["OWNER CENTER / INTERACTIVE DEMO","PANEL DEL PROPIETARIO / DEMOSTRACIÓN INTERACTIVA"],
 ["The Golden Classic","El clásico Golden"],
 ["Standard Home Cleaning","Limpieza residencial estándar"],
 ["20% OFF","20 % de descuento"]
])assert.equal(es.tr(src),expected,src);
assert.equal(en.tr("Guardar cambios"),"Save changes");
assert.equal(en.tr("Limpieza profunda"),"Deep Cleaning");
assert.equal(en.tr("Disponible"),"Available");

assert.match(english,/SEE HOW IT WORKS/);
assert.match(spanish,/MIRA CÓMO FUNCIONA/);
assert.equal((spanish.match(/<section class="owner-experience"/g)||[]).length,1);
assert.match(spanish,/href="\/demos\/\?demo=golden-grid&amp;lang=es&amp;returnTo=/);
assert.match(spanish,/class="owner-experience-cta"[^>]*>Probar un demo interactivo<\/a>/);
assert.ok((spanish.match(/href="\/demos\/\?demo=[^"]+lang=es/g)||[]).length>=7,"Spanish homepage demo links must carry locale");
assert.match(spanish,/\.owner-experience-layout/);

assert.match(lib,/src="\/assets\/tle-demo-locale-20261108\.js"/);
assert.match(owner,/src="\/assets\/tle-demo-locale-20261108\.js"/);
assert.match(lib,/TLELocale\?\.init\("library"\)/);
assert.match(owner,/TLELocale\?\.init\("owner"\)/);
assert.match(owner,/TLELocale\?\.apply\(\$\("#catalog-list"\)\)/);
assert.match(owner,/TLELocale\?\.apply\(\$\("#small-preview"\)\)/);
assert.match(owner,/TLELocale\?\.apply\(\$\("#requests-list"\)\)/);
assert.match(owner,/\?demo="\+encodeURIComponent\(current\)/,"Return must preserve selected demo");
assert.ok(owner.includes('"&lang=es"')&&(owner.includes('window.TLELocale?.isEs')||owner.includes('new URLSearchParams(location.search).get("lang")==="es"')),"Owner return must preserve Spanish language");
assert.match(owner,/localStorage\.setItem\(key\(\),JSON\.stringify\(items\)\)/);
assert.doesNotMatch(owner,/\bfetch\s*\(/);

const cards=[...lib.matchAll(/<article\b[^>]*data-brand="([^"]+)"[^>]*>[\s\S]*?<\/article>/g)];
const linked=new Map();
for(const [,slug] of cards){
 const card=cards.find(v=>v[1]===slug)?.[0]||"";
 const matches=[...card.matchAll(/class="owner-view"\s+href="([^"]+)"/g)];
 assert.ok(matches.length<=1,"Duplicate owner links: "+slug);
 if(matches.length)linked.set(slug,matches[0][1]);
}
assert.equal(cards.length,19,"Existing portfolio demos plus Nail Room, Sneekiefs and FRESKA must be preserved");
assert.equal(linked.size,13,"Existing owner demo count must be preserved");
const themes=[...owner.matchAll(/^ "([a-z0-9-]+)":\{name:/gm)].map(x=>x[1]);
assert.deepEqual([...linked.keys()].sort(),themes.sort(),"No owner brand can go missing");
for(const [slug,href] of linked)assert.equal(href,"/demos/owner-center/?demo="+slug,"Canonically mapped brand "+slug);

assert.match(lib,/approvedOwnerReturnRoutes/);
assert.match(owner,/allowedOwnerReturnTo/);
assert.match(lib,/ownerReturnRouteForDemo/);
assert.match(owner,/safeOwnerEntryReturnTo/);
console.log("PASS: bilingual menus and services, 13 owners, 19 demos, 7 Spanish homepage demos, locale return paths and no live API.");
