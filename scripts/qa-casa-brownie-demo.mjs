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
assert.ok(!html.includes('<form'),'contact form only created on click');
assert.ok(html.includes('id="contact-us-button"'),'footer contact trigger is visible');
assert.equal((html.match(/data-social-demo="/g)||[]).length,3,'three simulated social previews');
assert.ok(html.includes('123 Calle del Cacao'),'fictional address visible');
assert.ok(html.includes('Dirección inventada'),'fictional location disclosed');
assert.ok(html.includes('id="nuestra-historia"'),'compact story is part of page');
assert.ok(html.indexOf('id="nuestra-historia"') < html.indexOf('id="entrega"'),'story precedes delivery');
assert.ok(html.includes('store-experience.css?v=cb-editorial-experience-20261030'),'new responsive CSS loaded');
for (const snippet of [
 'function viewContactDemo()',
 'function viewSocialDemo(platform)',
 "form.addEventListener('submit'",
 'event.preventDefault()',
 'form.reset()',
 "modalRoot.querySelectorAll('button,[href],select,input,textarea'"
]) assert.ok(js.includes(snippet),'missing safe demo behavior '+snippet);
for(const term of ['fetch(', 'sendBeacon', 'localStorage', 'sessionStorage'])assert.ok(!js.includes(term),'no network/storage operation '+term);
const experienceCss=load('store-experience.css');
for(const selector of ['.cb-store-story','.cb-demo-contact-form','@media (max-width:640px)'])assert.ok(experienceCss.includes(selector),'missing demo style '+selector);

assert.ok(!/stripe\.com|checkout\.stripe\.com/i.test(html),'no payment destination');
assert.match(html,/DEMO EDUCATIVA · SIN PEDIDOS NI PAGOS REALES/);
assert.match(html,/entrega local/i);
assert.match(html,/href="#brownies"/);
assert.match(html,/styles\\.css\\?v=cb-editorial-experience-20261030/,'new serif stylesheet loads');
assert.match(html,/hero-corrections\\.css\\?v=cb-sticky-cart-20261029/,'approved hero geometry kept');
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


// Both official and teaching demos share one document; the teaching switch only removes the video.
assert.match(html,/get\('etapa'\) === 'sin-video'/);
assert.match(html,/src="\.\/assets\/hero-brownies\.mp4\?v=20261029-local"/,'original hero video untouched');
assert.match(html,/casabrownie-editorial\.css\?v=20261029-ticker-v3/,'editorial stylesheet loaded after existing styles');
const editorial=load('casabrownie-editorial.css');
assert.match(editorial,/@media \(min-width:791px\) and \(max-width:1199px\)/,'tablet-specific editorial grid');
assert.match(editorial,/\.hero \.hero-copy\s*\{\s*display:grid/,'tablet hero story becomes two columns');
assert.match(editorial,/\.step-number\s*\{\s*margin-right:\s*12px/,'number and icon separated');
const editorialNames=[
 'hero-lifestyle','hands-gift','gift-packaging',
 'box-closeup','local-pickup','fudgy-plate'
];
for(const name of editorialNames){
  const asset='assets/casabrownie-'+name+'.svg';
  assert.match(html,new RegExp('casabrownie-'+name+'\\.svg'),'editorial photo referenced: '+name);
  assert.ok(existsSync(new URL(asset,dir)),'missing optimized editorial photo '+name);
  const svg=load(asset);
  assert.match(svg,/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/,'valid SVG wrapper for photo '+name);
  assert.match(svg,/href="data:image\/jpeg;base64,\/9j\//,'embedded self-hosted JPEG '+name);
  assert.ok(svg.length>30000,'asset photo must not be a tiny low-resolution placeholder '+name);
}
assert.match(html,/srcset="\.\/assets\/casabrownie-hands-gift\.svg"/);
assert.match(html,/srcset="\.\/assets\/casabrownie-gift-packaging\.svg"/);
assert.match(editorial,/\.delivery-miami \.cb-delivery-photo/,'Miami delivery photography and responsive support');
assert.doesNotMatch(editorial,/hero-video|hero-motion|hero-brownies\.mp4/,'editorial CSS never changes the hero video');

assert.match(editorial,/\.moments-copy \.cb-moment-accent\s*\{\s*width:min\(100%,510px\);\s*height:auto;/,'phone gift photo is a large editorial image');
assert.match(editorial,/\.closing \.cb-closing-photo\s*\{\s*display:block;\s*width:100%;\s*max-width:560px;\s*height:auto;/,'phone closing photo fills available space');
assert.match(editorial,/\.closing\s*\{\s*display:grid;\s*grid-template-columns:minmax\(0,1fr\) minmax\(210px,.58fr\);/,'tablet closing has balanced text and a full-sized photo');
assert.match(editorial,/\.cb-moment-accent\s*\{\s*width:min\(100%,385px\);/,'desktop story accent is not a thumbnail');
assert.doesNotMatch(editorial,/\.cb-moment-accent\s*\{\s*width:98px/,'old 98 pixel story thumbnail removed');
assert.doesNotMatch(editorial,/\.cb-closing-photo\s*\{\s*width:142px/,'old 142 pixel closing thumbnail removed');

assert.match(html,/class="cb-gift-ribbon" role="img"/,'ticker accessible');
assert.equal((html.match(/class="cb-gift-ribbon-row(?: |\x22)/g)||[]).length,2,'two ticker rows');
assert.equal((html.match(/class="cb-gift-ribbon-group"/g)||[]).length,4,'duplicated tracks for seamless loop');
assert.equal((html.match(/class="cb-gift-ribbon-item"/g)||[]).length,16,'two rows each with four repeated icon phrases');
assert.match(html,/cb-ticker-heart/,'heart icon appears');
assert.match(html,/cb-ticker-gift/,'gift icon appears');
const storyIndex=html.indexOf('class="cb-moment-accent"');
const ribbonIndex=html.indexOf('class="cb-gift-ribbon"');
const secondGiftIndex=html.indexOf('class="moment-image moment-note cb-real-gift-photo"');
assert.ok(storyIndex < ribbonIndex && ribbonIndex < secondGiftIndex,'ticker remains between gift photos');
assert.match(editorial,/@keyframes cb-gift-ribbon-flow/,'continuous motion');
assert.match(editorial,/\.cb-gift-ribbon-row-reverse .*animation-direction:reverse/,'second row moves opposite');
assert.match(editorial,/background:#f5ede5/,'light editorial background');
assert.match(editorial,/mask-image:linear-gradient/,'running text fades at edges');
assert.match(editorial,/@media \(prefers-reduced-motion: reduce\)/,'accessible static option');
assert.match(editorial,/\.moments-strip > \.cb-gift-ribbon \{order:2;/,'ticker ordered between mobile photos');
assert.match(editorial,/\.moments-strip > \.moment-note \{order:3;/,'second gift photo follows the ticker');
assert.ok(html.includes('© 2026 The Launch Era. Todos los derechos reservados.'),'real credit');
assert.ok(html.includes('Powered by <a href="https://thelaunchera.com/"'),'thelaunchera.com credit link');
assert.equal((html.match(/data-demo-legal="/g)||[]).length,3,'legal footer links');
assert.match(js,/function viewLegalTopic\(topic\)/,'legal modal implementation');
assert.ok(js.includes("querySelectorAll('[data-demo-legal]')"),'legal handlers connected');
assert.match(experienceCss,/\.cb-footer-legal/,'legal footer CSS');

assert.match(html,/src="\.\/assets\/hero-brownies\.mp4\?v=20261029-local"/,'hero video is unchanged');



// One document powers the approved video and static class demos.
for (const action of ['flavor', 'packaging', 'occasion', 'next', 'back', 'restart', 'close']) {
  assert.match(js, new RegExp('data-action=.?'+action), 'interactive demo action ' + action);
}
assert.match(js,/Math\.min\(12, quantity \+ 1\)/,'quantities are capped');
assert.match(html,/id="story-more-btn"/,'story detail is interactive');
assert.match(html,/id="delivery-try-btn"/,'delivery starts the interactive demo');
assert.match(js,/story-more-btn/,'story detail handler attached');
assert.match(js,/delivery-try-btn/,'delivery button handler attached');
assert.match(html,/casabrownie-hands-gift\.svg/,'story uses existing photo');
assert.match(load('styles.css'),/Bodoni Moda/,'hero serif font applied in repo');
assert.match(experienceCss,/\.cb-order-flavors/,'flavor cards receive responsive styling');
assert.match(experienceCss,/\.cb-story-visual/,'story redesign styled');

console.log('Casa Brownie video + static educational demo QA OK');


assert.match(html,/main\.js\?v=cb-editorial-experience-20261030/);
assert.equal((js.match(/assets\/sabor-/g)||[]).length,6,'all catalog photos are hosted originals');
assert.doesNotMatch(js,/amummytoo|proteinbrownies|getrecipekit|anasrecipes|dailydoughco|ctfassets/,'no third-party flavor photos');
