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
 assert.match(html,/tle-offer-editorial-motion-20261108\.css\?v=1/,'CSS installed '+lang);
 assert.match(html,/tle-offer-editorial-motion-20261108\.js\?v=2/,'JS installed '+lang);
 assert.match(html,/class="hero hero-gallery" id="inicio"/,'Original hero preserved');
 assert.equal((html.match(/class="hero-gallery-card"/g)||[]).length,11,'Eleven original demo photos must survive');
 assert.equal((html.match(/class="plan" id="website-(?:basic|ai-crm)"/g)||[]).length,2,'Only the two approved plans');
 assert.equal((html.match(/class="step"/g)||[]).length,4,'Four genuine service steps');
 assert.match(html,/id="owner-experience"/,'Interactive showcase preserved');
 assert.ok(html.includes('$15')&&html.includes('$25')&&html.includes('$8'),'Existing prices untouched');
 assert.match(html,/href="\/website-checkout\/\?offer=website-basic&lang=/);
 assert.match(html,/href="\/website-checkout\/\?offer=website-ai-crm&lang=/);
 assert.equal((html.match(/<a[^>]+class="owner-experience-cta"/g)||[]).length,1,'Exactly one owner CTA');
 assert.ok(!html.includes('testimonials fabricated'),'No invented content');
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
  hero:'More than a website.',
  payoff:'Less to juggle.',
  pain:'CUSTOMER MESSAGES EVERYWHERE?',
  system:'private Command Center',
  cta:'See My Options',
  owner:'A clearer view for you.',
  demo:'Try an Interactive Demo',
  choice:'Start with what you need.',
  launch:'We build your system.'
 },
 es:{
  hero:'Más que un website.',
  payoff:'Más control para ti.',
  pain:'¿TUS SOLICITUDES SE PIERDEN ENTRE MENSAJES?',
  system:'Command Center privado',
  cta:'Ver mis opciones',
  owner:'Más claridad para ti.',
  demo:'Probar un demo interactivo',
  choice:'Empieza con lo que necesitas.',
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
 assert.equal((html.match(/class="plan" id="website-(?:basic|ai-crm)"/g)||[]).length,2,'No third offer '+lang);
}
const storyCSS=read('public/assets/tle-offer-editorial-motion-20261108.css');
assert.match(storyCSS,/max-width:min\(13ch,100%\)/,'Desktop headline width must be responsive');

console.log('PASS: EN/ES editorial motion, reduced motion, existing offers and links, original eleven demos, no payment or network changes.');
