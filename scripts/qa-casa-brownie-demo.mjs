import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const dir = new URL('../public/demos/casa-brownie/',import.meta.url);
const load = file => readFileSync(new URL(file,dir),'utf8');
for(const name of ['index.html','styles.css','hero-corrections.css','motion.css','editorial-center-v2.css','gift-photos.css','main.js','motion.js','README.md','GUIA-PARA-LA-CLASE.md']) assert.ok(existsSync(new URL(name,dir)),name+' missing');
const html=load('index.html'),css=load('hero-corrections.css'),js=load('main.js');
const motion=load('motion.js'),motionStyles=load('motion.css');
assert.match(html,/Brownies<br\s*\/>\s*hechos\s*<span class="love">en casa<\/span>/i);
assert.ok(!html.includes('amor real'),'rejected copy removed');
assert.ok(!/[↗➜➝→➔➡➤]/.test(html),'no decorative arrows');
assert.match(html,/<video id="hero-video"/);
assert.match(html,/get\('etapa'\) === 'sin-video'/,'static teaching URL is supported');
assert.match(html,/data-clase-etapa="sin-video"/,'teaching URL hides video without editing official assets');
assert.match(js,/classWithoutVideo/,'static teaching URL must not play video');
assert.match(js,/heroVideo\.querySelector\('source'\)\?\.remove\(\)/,'video source is removed for static teaching mode');

assert.match(html,/muted loop playsinline/);
assert.match(html,/class="hero-photo-poster"/);
assert.match(html,/\.\/assets\/hero-brownies\.mp4\?v=20261029-local/,'self-hosted approved video');
assert.match(html,/\.\/assets\/hero-brownies\.webp\?v=20261029-local/,'self-hosted video poster');
assert.doesNotMatch(html,/resource2\.heygen\.ai/,'hero playback no longer depends on third-party video hosting');
for (const [name,minSize,maxSize] of [
 ['hero-brownies.mp4',100000,8_000_000],
 ['hero-brownies.webp',10000,500000]
]) {
 const local=new URL('assets/'+name,dir);
 assert.ok(existsSync(local),'missing hero asset '+name);
 const bytes=readFileSync(local).length;
 assert.ok(bytes>=minSize&&bytes<=maxSize,'hero file must be locally optimized: '+name+' '+bytes);
}
assert.match(css,/@media \(max-width: 790px\)[\s\S]*?\.hero-photo\s*\{\s*order:\s*-1/);
assert.match(js,/prefers-reduced-motion/);
assert.ok(!/<form\b/i.test(html),'no data-collecting form');
assert.ok(!/stripe\.com|checkout\.stripe\.com/i.test(html),'no payment destination');
assert.match(html,/DEMO EDUCATIVA · SIN PEDIDOS NI PAGOS REALES/);
assert.match(html,/Entrega local/);
assert.match(html,/href="#brownies"/);
for (const asset of ['./styles.css','./hero-corrections.css']) assert.match(html,new RegExp('(?:href|src)="'+asset.replaceAll('.','\\.')+'\\?v=cb-sticky-cart-20261029"'),'updated-gallery cache '+asset);
for (const asset of ['./motion.css','./motion.js']) assert.match(html,new RegExp('(?:href|src)="'+asset.replaceAll('.','\\.')+'\\?v=cb-center-20261028b"'),'motion cache '+asset);
assert.match(html,/href="\.\/editorial-center-v2\.css"/,'new stylesheet must load');

assert.match(html,/gift-photos\.css\?v=cb-tablet-video-first-20261029/,'new tablet gift photos version');
assert.doesNotMatch(html,/class="hero-gift"/,'gift illustration is removed from hero');
assert.doesNotMatch(html,/class="delivery-gift"/,'CSS gift is removed from delivery');
assert.match(html,/EL DETALLE PERFECTO PARA CADA MOMENTO/,'gift copy moved beside approved photos');
assert.match(css,/@media \(min-width: 791px\) and \(max-width: 1199px\)/,'tablet layout exists');
assert.match(css,/\.hero-photo\s*\{\s*order:\s*-1/,'tablet shows video before copy');
assert.match(css,/\.moments-strip\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(2,\s*minmax\(0,1fr\)\)/,'two tall photos on tablet');
assert.match(css,/\.delivery-section\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*minmax\(0,1fr\)/,'delivery stacks on tablet');

assert.equal((html.match(/class="step-symbol"/g)||[]).length,3,'three refined step icons');
assert.equal((html.match(/class="flavor-mark"/g)||[]).length,6,'six illustrated flavor marks');
const flavorCss=load('styles.css');
assert.match(flavorCss,/grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/,'desktop and tablet gallery must have three columns');
assert.match(flavorCss,/@media \(max-width: 560px\)[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,'phone gallery must have two columns');
assert.doesNotMatch(flavorCss,/repeat\(6,\s*minmax\(0,\s*1fr\)\)/,'never squeeze all six flavors in one row');
assert.match(flavorCss,/aspect-ratio:\s*4\s*\/\s*5/,'all six photos have the same vertical aspect ratio');
assert.match(flavorCss,/\.flavor-mark\s*\{\s*display:\s*none/,'badge circles must not cover brownies');
assert.doesNotMatch(css,/\.flavor-picture\s*\{\s*height:\s*clamp\(/,'no legacy desktop picture height override');
assert.match(html,/<span class="pin-circle" aria-hidden="true"><svg/,'Miami location marker uses a real vector pin');
assert.ok(!html.includes('>⌖</span>')&&!html.includes('>▤</span>'),'no font glyph placeholders');
assert.match(html,/href="\.\/motion\.css\?v=cb-center-20261028b"/);
assert.match(html,/src="\.\/motion\.js\?v=cb-center-20261028b"/);
assert.match(motion,/IntersectionObserver/);
assert.match(motion,/cb-in-view/);
assert.match(motion,/requestAnimationFrame/);
assert.match(motionStyles,/prefers-reduced-motion/);
assert.match(motionStyles,/grid-template-columns:\s*28px 48px minmax\(0,1fr\)/,'readable vertical delivery steps on phones');
assert.doesNotMatch(motion,/fetch\(|localStorage|sessionStorage|analytics|sendBeacon/,'visual effects are isolated');

assert.match(html,/Un sabor para cada ocasión/,'gallery has an editorial headline');
assert.match(html,/Elegir mi favorito/,'single purposeful gallery CTA');
assert.match(html,/Toca un sabor para conocerlo mejor/,'cards have one shared instruction');
assert.doesNotMatch(html,/Conocer sabor|Nuestros Brownies|Más que brownies/,'avoid repetitive generic copy');
assert.match(html,/src="\.\/assets\/regalo-lazo-rosa\.webp\?v=20261029-original"/,'approved pink-ribbon photo is used');
assert.match(html,/src="\.\/assets\/regalos-bolsa-y-cajas\.webp\?v=20261029-original"/,'approved bag and boxes photo is used');
for(const img of ['assets/regalo-lazo-rosa.webp','assets/regalos-bolsa-y-cajas.webp']) {
  assert.ok(existsSync(new URL(img,dir)),'local approved image missing: '+img);
  const file=readFileSync(new URL(img,dir));
  assert.ok(file.length>100000,'photo must be full resolution, not a tiny enlarged preview');
}
const imageSrcs=[...html.matchAll(/<img\\b[^>]*?src="([^"]+)"/g)].map(m=>m[1]);
assert.equal(imageSrcs.length,new Set(imageSrcs).size,'no repeated image URL across hero and gallery');
assert.ok(html.indexOf('class="flavor-section"')<html.indexOf('class="moments-strip"'));
assert.ok(html.indexOf('class="moments-strip"')<html.indexOf('class="delivery-section"'));
assert.ok(html.indexOf('class="delivery-section"')<html.indexOf('class="closing"'));
assert.match(js,/getElementById\('all-flavors'\)\.addEventListener\('click', \(\) => viewExperience\(\)\)/,'gallery CTA enters real simulation');
assert.doesNotMatch(js,/deliveryBlock\.after\(/,'no post-load section jumping');
assert.match(css,/\.moments-strip/,'story layout styling');
assert.match(html,/DEMO EDUCATIVA · SIN PEDIDOS NI PAGOS REALES/,'fictitious store disclosure remains');

const layout=load('editorial-center-v2.css');
assert.match(html,/class="cb-marquee"/,'moving ribbon must appear');
assert.equal((html.match(/class="cb-marquee-group"/g)||[]).length,2,'two identical tracks ensure seamless loop');
assert.match(layout,/@keyframes cb-text-scroll/,'ribbon moves continuously');
assert.match(layout,/@media\(prefers-reduced-motion:reduce\)/,'ribbon respects accessibility');
assert.match(layout,/\.moments-strip>\.moment-illustration/,'illustration needs full-width mobile area');
assert.match(layout,/\.moments-strip>\.moment-note/,'handwritten note needs explicit mobile height');
const giftCss=load('gift-photos.css');
assert.match(html,/gift-photos\.css/,'approved photo styling is included');
assert.match(giftCss,/\.cb-real-gift-photo/,'approved photos have mobile composition rules');
assert.match(giftCss,/object-fit:\s*cover/,'approved photos retain correct crop');
assert.match(giftCss,/@media \(max-width: 790px\)/,'gift photos have mobile styling');
assert.match(layout,/\.hero-copy\{text-align:center;align-items:center\}/,'hero content centered');
assert.match(layout,/\.delivery-miami\{text-align:center;align-items:center\}/,'delivery centered');
assert.match(layout,/\.closing\{display:flex;flex-direction:column;align-items:center/,'closing centered');
assert.match(layout,/overflow-x:hidden/,'prevent sideways scrolling');
assert.match(html,/DEMO EDUCATIVA · SIN PEDIDOS NI PAGOS REALES/);

const stickyStyles=load('styles.css');
assert.match(stickyStyles,/\.site-header\s*\{[^}]*position:\s*sticky;\s*top:\s*0;/s,'logo and cart header stay visible on scroll');
assert.match(css,/@media \(min-width: 1200px\)[\s\S]*?\.site-header\s*\{[^}]*position:\s*sticky;\s*top:\s*0;/,'desktop does not override sticky header');
assert.match(stickyStyles,/scroll-padding-top:\s*92px/,'anchor links do not hide behind header');
assert.match(html,/id="cart-count" aria-live="polite"/,'visible and accessible demo cart count');
assert.match(js,/const demoCart = new Map\(\)/,'demo cart lives only in memory');
assert.match(js,/function updateCartBadge\(\)/,'cart badge count is updated dynamically');
assert.match(js,/function changeCartQuantity\(flavorId, change\)/,'cart quantities can be edited');
assert.match(js,/\.addEventListener\('click', viewCart\)/,'header cart opens actual demo contents');
assert.match(js,/Añadir al carrito de muestra/,'flavor modal lets the visitor add a sample brownie');
assert.doesNotMatch(js,/localStorage|sessionStorage|fetch\(/,'no stored data or live purchase calls');

console.log('Casa Brownie static demo QA OK');


assert.match(html,/main\.js\?v=cb-sticky-cart-20261029/);
assert.equal((js.match(/assets\/sabor-/g)||[]).length,6,'all catalog photos are hosted originals');
assert.doesNotMatch(js,/amummytoo|proteinbrownies|getrecipekit|anasrecipes|dailydoughco|ctfassets/,'no third-party flavor photos');
