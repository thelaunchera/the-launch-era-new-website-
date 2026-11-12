/* Editorial website offer motion: exact same copy, checkout, hero assets and locale.
   No production payments, CRM writes or network side effects. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {Script} from 'node:vm';
const read=p=>readFileSync(p,'utf8');
const pages=[
 ['en','public/website-for-your-business/index.html'],
 ['es','public/es/website-for-your-business/index.html']
];
const cssPath='public/assets/tle-offer-editorial-motion-20261108.css';
const jsPath='public/assets/tle-offer-editorial-motion-20261108.js';
assert.ok(existsSync(cssPath)&&existsSync(jsPath),'Motion files must exist');
const css=read(cssPath),js=read(jsPath);
new Script(js,{filename:jsPath});
assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length,'Balanced CSS blocks');
assert.match(css,/prefers-reduced-motion:reduce/,'Reduced motion CSS fallback mandatory');
assert.match(js,/prefers-reduced-motion: reduce/,'Motion preferences must be checked in JS');
assert.match(js,/IntersectionObserver/,'Scroll reveals must be bounded by visibility');
assert.doesNotMatch(js,/observer\.unobserve\(/,'Continue watching sections after their first reveal');
assert.match(js,/classList\.remove\("tle-offer-visible"\)/,'Reset offscreen elements for return visits');
assert.doesNotMatch(js,/\bfetch\(|XMLHttpRequest|localStorage|sessionStorage|window\.location\s*=|\.click\(/,'No network, storage or navigation side effects');
assert.doesNotMatch(css,/@import|https?:\/\//,'Motion layer may not load external dependencies');
assert.doesNotMatch(css,/display\s*:\s*none\s*!important/,'Never hide content/CTAs');
for(const selector of ['.hero-gallery h1','.owner-admin-visual','.owner-customer-frame','.pricing .plan','.process .step','.faq details','.features .feature']){
 assert.ok(css.includes(selector),'BrewedOps-derived editorial effect missing: '+selector);
}
for(const [lang,path] of pages){
 const html=read(path);
 assert.match(html,/tle-offer-editorial-motion-20261108\.css\?v=2/,'CSS installed '+lang);
 assert.match(html,/tle-offer-editorial-motion-20261108\.js\?v=3/,'JS installed '+lang);
 assert.match(html,/class="hero hero-gallery" id="inicio"/,'Original hero preserved');
 const gallerySlugs=[...html.matchAll(/class="hero-gallery-card"[^>]*data-demo="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(gallerySlugs.length,14,'Fourteen approved demo photos including Nail Room, FRESKA and Sneekiefs must survive');
 assert.equal(new Set(gallerySlugs).size,14,'No duplicated demo card');
 assert.ok(gallerySlugs.includes('nail-room'),'Nail Room must remain in the public hero');
 assert.equal(gallerySlugs[gallerySlugs.indexOf('soluna-yoga')+1],'sneekiefs','Sneekiefs follows SOLUNA Yoga');
 assert.equal((html.match(/class="plan" id="website-(?:basic|plus)"/g)||[]).length,2,'Only the two approved plans');
 assert.equal((html.match(/class="step"/g)||[]).length,4,'Four genuine service steps');
 assert.match(html,/id="owner-experience"/,'Interactive showcase preserved');
 assert.ok(html.includes('$15')&&html.includes('$25')&&html.includes('$10'),'Current $15/$25 one-time website offers and separately priced $10 agent stay visible');
 assert.ok(html.includes('class="website-agent-addon"')&&html.includes('+$10'),'Optional AI agent must appear in its own priced add-on');
 assert.doesNotMatch(html,/offer=website-ai-crm/,'Retired bundled AI subscription must not return to public checkout');
 assert.match(html,/href="\/website-checkout\/\?offer=website-basic&lang=/);
 assert.match(html,/href="\/website-checkout\/\?offer=website-plus&lang=/);
 assert.equal((html.match(/<a[^>]+class="owner-experience-cta"/g)||[]).length,1,'Exactly one owner CTA');
 assert.ok(!html.includes('testimonials fabricated'),'No invented content');
 const faq=html.match(/<section class="faq" id="preguntas">([\s\S]*?)<\/section>/)?.[1]||'';
 assert.equal((faq.match(/<details>/g)||[]).length,8,'Eight focused FAQ answers '+lang);
 assert.equal((faq.match(/<\/details>/g)||[]).length,8,'All FAQ details closed '+lang);
 for(let i=1;i<=8;i++)assert.ok(faq.includes('data-key="q'+i+'"')&&faq.includes('data-key="r'+i+'"'),'Accessible FAQ question/answer pair '+lang+' '+i);
 assert.ok(faq.includes('$15')&&faq.includes('$25')&&faq.includes('$10'),'FAQ pricing matches approved offers '+lang);
 assert.ok(lang==='es'?faq.includes('negocios de limpieza'):faq.includes('cleaning businesses'),'FAQ clarifies multi-industry services '+lang);
 assert.ok(lang==='es'?faq.includes('no confirma una cita'):faq.includes('not a confirmed appointment'),'FAQ must not misrepresent booking requests '+lang);
 const subject=lang==='es'?'Consulta%20de%20website':'Website%20Consultation';
 assert.equal(html.split('href="mailto:hello@thelaunchera.com?subject=').length-1,2,'Consultation-first contact appears in pricing and FAQ '+lang);
 assert.ok(html.includes('mailto:hello@thelaunchera.com?subject='+subject),'Consultation mailto uses verified business inbox '+lang);
 assert.ok(lang==='es'?faq.includes('¿Debo contactarlos antes de comprar?'):faq.includes('Should I contact you before purchasing?'),'Consultation-before-purchase FAQ present '+lang);
 assert.ok(lang==='es'?html.includes('Antes de comprar,'):html.includes('Before purchasing,'),'Pricing instructs consultation before payment '+lang);

}
const en=read(pages[0][1]),es=read(pages[1][1]);
assert.match(en,/SEE HOW IT WORKS/);
assert.match(es,/MIRA CÓMO FUNCIONA/);
assert.match(en,/lang=en"/);
assert.match(es,/lang=es"/);
/* Benefit-led story contract: buyer's pain → clear system → visible proof → decision.
   We apply the messaging approach without presenting Cata as a real endorsement. */
const messageContract={
 en:{
  hero:'A better customer experience.',
  payoff:'A simpler business day.',
  pain:'BUILD NEW. IMPROVE WHAT YOU HAVE.',
  system:'private Admin Panel',
  cta:'See My Options',
  owner:'Easier for you.',
  demo:'Try an Interactive Demo',
  choice:'New or refreshed.',
  launch:'We build your system.'
 },
 es:{
  hero:'Mejores experiencias para tus clientes.',
  payoff:'Menos tareas para ti.',
  pain:'CREA UNO NUEVO O MEJORA EL QUE YA TIENES.',
  system:'panel de administrador privado',
  cta:'Ver mis opciones',
  owner:'Fácil para ti.',
  demo:'Probar un demo interactivo',
  choice:'¿Nuevo o renovado?',
  launch:'Nosotros creamos el sistema.'
 }
};
for(const [lang,path] of pages){
 const html=read(path),p=messageContract[lang];
 for(const [key,value] of Object.entries(p)){
  assert.ok(html.includes(value),'Buyer story must clearly express '+lang+' '+key+': '+value);
 }
 assert.ok(html.includes('href="#paquetes" data-key="heroCta">'+p.cta),
  'Hero decision CTA stays linked to unchanged offer cards '+lang);
 assert.ok(!/Cata dice|Cata recommends|Cata recomienda/i.test(html),
  'Do not attribute or fabricate testimonials from a design mentor');
 const hero=html.match(/<section class="hero hero-gallery" id="inicio">([\s\S]*?)<\/section>/)?.[1];
 assert.ok(hero?.includes(p.hero)&&hero?.includes(p.payoff),'Actual hero must carry new value proposition');
 const owner=html.match(/<section class="owner-experience"[\s\S]*?<\/section>/)?.[0]||'';
 assert.ok(owner.includes(p.owner)&&owner.includes(p.demo),'Evidence must precede choice');
 assert.equal((html.match(/class="plan" id="website-(?:basic|plus)"/g)||[]).length,2,'No third offer '+lang);
}
const storyCSS=read('public/assets/tle-offer-editorial-motion-20261108.css');
assert.match(storyCSS,/max-width:min\(13ch,100%\)/,'Desktop headline width must be responsive');

console.log('PASS: EN/ES editorial motion, reduced motion, existing offers and links, all fourteen approved demos, no payment or network changes.');
