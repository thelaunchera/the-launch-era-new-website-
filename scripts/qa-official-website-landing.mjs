import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const routes=['public/website-for-your-business/index.html','public/es/website-for-your-business/index.html'];
const photos={
 en:['hero-jaramillo.svg','automated-crm-en-sharp.png','process-choose-en.png','process-brand-en.png','process-build-en.png','process-launch-en.png'],
 es:['hero-jaramillo.svg','automated-crm-original.jpg','process-choose-original.jpg','process-brand-original.jpg','process-build-original.jpg','process-launch-original.jpg']
};
const css=readFileSync('public/assets/tle-website-official.css','utf8');
const galleryCss=readFileSync('public/assets/tle-gallery-hero-20261107.css','utf8');

const heroMedia=readFileSync('public/assets/tle-offer-gallery-hero-media-20261108.js','utf8');
const demoLibrary=readFileSync('public/demos/index.html','utf8');
const cleaningVideo='/experience-cleaning/media/cleaning-hero-20261108.mp4';
const cleaningPoster='/experience-cleaning/media/cleaning-hero-poster-20261108.jpg';
assert.ok(existsSync('public'+cleaningVideo)&&existsSync('public'+cleaningPoster),'Approved cleaning video and matching poster must exist');

const goldenOfferMovie='/demos/golden-grid/media/hero-approved-canva-20261108.mp4';
const goldenOfferPoster='/demos/golden-grid/resources/golden-1.png';
const goldenOfferCss=readFileSync('public/assets/tle-golden-offer-film-20261109.css','utf8');
const goldenOfferJs=readFileSync('public/assets/tle-golden-offer-film-20261109.js','utf8');
assert.ok(existsSync('public'+goldenOfferMovie)&&existsSync('public'+goldenOfferPoster),'Existing Golden Grid film and original sharp poster must remain available');
assert.ok(goldenOfferCss.includes('max-width:512px')&&goldenOfferCss.includes('object-fit:contain'),'Golden Grid video must not be zoomed or materially upscaled in the offer');
assert.ok(goldenOfferCss.includes('prefers-reduced-motion'),'Golden Grid film must respect reduced motion');
assert.ok(goldenOfferJs.includes('IntersectionObserver')&&goldenOfferJs.includes('saveData')&&goldenOfferJs.includes('video.play()'),'Golden Grid film must load in view and retain autoplay and data saving fallback');

assert.ok(heroMedia.includes("'experience-cleaning':['"+cleaningVideo+"','"+cleaningPoster+"']"),'Website offers must reuse the Cleaning demo hero, not a static substitute');
assert.ok(demoLibrary.includes("'experience-cleaning':{video:'"+cleaningVideo+"',poster:'"+cleaningPoster+"'}"),'Public demos must show the same cleaning hero');
assert.match(demoLibrary,/data-brand="experience-cleaning"/,'Cleaning demo card must remain available');
assert.ok(galleryCss.includes('data-demo="experience-cleaning"')&&galleryCss.includes('object-fit:contain!important'),'Cleaning portrait cover must not crop in offers');

assert.ok(galleryCss.includes('prefers-reduced-motion'),'reduced-motion gallery fallback');
assert.ok(galleryCss.includes('scroll-snap-type:x proximity'),'touch gallery must not trap vertical page scrolling');
assert.match(galleryCss,/width:max-content;\s*min-width:100%;\s*justify-content:flex-start/,'tablet rail must start with the first real project rather than center clipped overflow');
assert.ok(galleryCss.includes('flex:0 0 clamp(235px,27vw,295px)'),'tablet demo covers need independent readable sizing');
assert.ok(galleryCss.includes('touch-action:pan-x pan-y'),'gallery must allow horizontal swipe and native vertical page scroll');
assert.ok(galleryCss.includes('flex:0 0 min(72vw,292px);height:245px'),'phone cards should be slightly larger');
assert.ok(css.includes('max-width:780px'),'phone CTA rules');
assert.ok(css.includes('hero>img'),'hero photo');
for(const [language,paths] of Object.entries(photos))
 for(const filename of paths)
  assert.ok(existsSync('public/assets/website-packages-20261105/'+filename),language+': missing photo '+filename);
for(const r of routes){
 const html=readFileSync(r,'utf8');

 assert.ok(html.includes('data-gg-offer-video'),r+': customer video frame missing');
 assert.ok(html.includes('data-src="'+goldenOfferMovie+'"'),r+': approved Golden Grid film missing');
 assert.ok(html.includes('<img src="'+goldenOfferPoster+'"'),r+': original image fallback missing');
 assert.ok(html.includes('/assets/tle-golden-offer-film-20261109.css?v=1'),r+': Golden Grid styling missing');
 assert.ok(html.includes('/assets/tle-golden-offer-film-20261109.js?v=1'),r+': in-app video playback missing');

 const language=r.includes('/es/')?'es':'en';
 for(const filename of photos[language])assert.ok(html.includes(filename),language+': missing photo '+filename+' at '+r);
 assert.ok(html.includes('class="hero hero-gallery"'),'gallery hero not on '+language);
 assert.match(html, /\/assets\/tle-gallery-hero-20261107\.css\?v=\d+/, 'gallery styles not linked on '+language);
 assert.ok((html.match(/class="hero-gallery-card"/g)||[]).length===11,'eleven real demo gallery panels not present on '+language);
 assert.ok(/\/assets\/tle-offer-gallery-hero-media-20261108\.js\?v=\d+/.test(html),language+': gallery video fallback script missing');
 for(const [slug,asset] of Object.entries({
  'soluna-yoga':'/soluna-yoga/images/soluna-hero-editorial.webp',
  'experience-cleaning':'/assets/cleaning-demo/hero-cleaner-original.jpg',
  'yummm':'/yummm/media/hero-motion-poster-hq.webp',
  'wok-social':'/wok-social/assets/hero-storefront.webp'
 })){
  assert.ok(html.includes('data-demo="'+slug+'"'),language+': project missing '+slug);
  assert.ok(html.includes('demo='+slug),language+': project preview link missing '+slug);
  assert.ok(html.includes(asset),language+': original hero media missing '+slug);
 }
 assert.ok(html.includes('/yummm/media/hero-motion-20261108.mp4'),language+': approved YUMMM motion not linked');
 for(const filename of photos[language==='es'?'en':'es'].slice(1))
  assert.ok(!html.includes(filename),language+': photo from other language leaked '+filename);
 assert.match(html,/id="website-basic"/);
 if(language==='en')assert.match(html,/<article class="plan" id="website-basic"><img class="plan-photo" src="\/assets\/website-packages-20261105\/hero-jaramillo\.svg"/,'EN Package 1 should feature Jaramillo photo');
 assert.match(html,/id="website-plus"/);
 assert.doesNotMatch(html,/class="app-section"|\/custom-app\/\?lang=|optional-app-original/,'the redundant app offer must be hidden');
 assert.match(html,/\$15/);
 assert.match(html,/\$25/);
 assert.match(html,/\/website-checkout\/\?offer=website-basic&lang=/);
 assert.match(html,/\/website-checkout\/\?offer=website-plus&lang=/);
 assert.doesNotMatch(html,/offer=website-ai-crm/,'retired AI subscription not sold in current package');
 assert.doesNotMatch(html,/<p class="fine" data-key="termsNote">/,'no long pricing disclaimer');
 assert.match(html,/\/terms\.html/);
 assert.doesNotMatch(html,/\/service-checkout\//,'do not route to incomplete legacy checkout');
 assert.ok(html.includes('href="#paquetes"'),'package anchor');
 assert.ok(html.includes('href="#proceso"'),'process anchor');
 assert.ok(html.includes('href="#preguntas"'),'FAQ anchor');
}
console.log('[TLE OFFICIAL LANDING] Eleven-card gallery, original approved photo and independent ES/EN package photos, pricing/checkout preserved, responsive CSS checked');
