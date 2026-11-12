// Guard approved demo hero assets and approved independent bilingual package/process photographs.
import {readFileSync,existsSync} from 'node:fs';
const en=readFileSync('public/website-for-your-business/index.html','utf8');
const es=readFileSync('public/es/website-for-your-business/index.html','utf8');
const css=readFileSync('public/assets/tle-website-official.css','utf8');
const goldenOfferCss=readFileSync('public/assets/tle-golden-offer-film-20261109.css','utf8');
const goldenOfferJs=readFileSync('public/assets/tle-golden-offer-film-20261109.js','utf8');
const photoRoot='/assets/website-packages-20261105/';
const expectedByLanguage={
 en:{
  planBasic:'hero-jaramillo.svg',
  planAdvanced:'automated-crm-en-sharp.png',
  processChoose:'process-choose-en.png',
  processBrand:'process-brand-en.png',
  processBuild:'process-build-en.png',
  processLaunch:'process-launch-en.png'
 },
 es:{
  planBasic:'hero-jaramillo.svg',
  planAdvanced:'automated-crm-original.jpg',
  processChoose:'process-choose-original.jpg',
  processBrand:'process-brand-original.jpg',
  processBuild:'process-build-original.jpg',
  processLaunch:'process-launch-original.jpg'
 }
};
function assert(test, message){if(!test)throw new Error(message);}
for(const [language,html] of [['en',en],['es',es]]){
 const expected=expectedByLanguage[language];
 const hero=html.match(/<section class="hero hero-gallery" id="inicio">([\s\S]*?)<\/section>/)?.[1];
 assert(hero,language+': hero missing');
 const galleryPhotoMap={
  'ivory-and-bloom':'/demos/ivory-and-bloom/media/hero-motion-poster-hq.webp',
  'casa-brownie':'/demos/casa-brownie/media/hero-motion-poster-hq.webp',
  'crumb':'/demos/crumb/assets/CRUMB_Storefront_Approved_20261030.webp',
  'la-vie-in-pink':'/demos/la-vie-in-pink/photos/lavie_pink_hero_editorial.png',
  'jaramillo-boutique':'https://thelaunchera.github.io/demo-booking-landing-/jaramillo-boutique/assets/noche.webp',
  'havana-19':'/demos/havana-19/media/hero-motion-poster-hq.webp',
  'sova':'/demos/sova/media/sova-hero-seamless-cobalt-20261108.png',
  'soluna-yoga':'https://thelaunchera.github.io/demo-booking-landing-/soluna-yoga/media/hero-motion-poster-hq.webp',
  'sneekiefs':'/demos/sneekiefs/assets/07-editorial-poster.webp',
  'experience-cleaning':'/experience-cleaning/media/cleaning-hero-poster-20261108.jpg',
  'yummm':'https://thelaunchera.github.io/demo-booking-landing-/yummm/media/hero-motion-poster-hq.webp',
  'wok-social':'https://thelaunchera.github.io/demo-booking-landing-/wok-social/media/hero-motion-poster-hq.webp',
  'freska':'/demos/freska/media/hero-pink-pop.webp',
  'nail-room':'https://thelaunchera.github.io/demo-booking-landing-/nail-room/media/pink-ombre-hero.png'
 };
 for(const [slug,image] of Object.entries(galleryPhotoMap)){
  assert(hero.includes('data-demo="'+slug+'"'),language+': missing distinct demo '+slug);
  const expectedHeroLink='href="/demos/?demo='+slug+'&amp;returnTo='+encodeURIComponent(language==='es'?'/es/website-for-your-business/':'/website-for-your-business/')+(language==='es'?'&amp;lang=es':'')+'"';
  assert(hero.includes(expectedHeroLink),language+': photo must link to its demo, retain locale and remember originating website');
  assert(hero.includes('src="'+image+'"'),language+': incorrect approved still/first-frame poster for '+slug);
  if(image.startsWith('/'))assert(existsSync('public'+image),language+': hero image asset missing for '+slug);
 }
 // A motion-enabled card must have its approved first-frame poster at first paint:
 // do not swap a different brand hero photo after the iPhone has displayed it.
 const galleryScript=readFileSync('public/assets/tle-offer-gallery-hero-media-20261108.js','utf8');
 assert(!galleryScript.includes('photo.src=pair[1]'),language+': late photo replacement causes a flash before video playback');
 assert(galleryScript.includes('video.poster=stablePoster'),language+': motion needs the same poster as its rendered image');
 assert(!hero.includes('data-demo="umbral"')&&!hero.includes('<figcaption>Umbral</figcaption>'),language+': Umbral must not be duplicated because it is Havana 19');
 assert(!hero.includes(photoRoot+'hero-jaramillo.svg')&&!hero.includes(photoRoot+'website-la-vie-in-pink-en.jpg'),language+': old mockup must not replace original demo hero photography');
 assert(hero.includes('hero-gallery-stage'),language+': gallery composition missing');
 const gallerySlugs=[...hero.matchAll(/class="hero-gallery-card"[^>]*data-demo="([^"]+)"/g)].map(match=>match[1]);
 assert(gallerySlugs.length===Object.keys(galleryPhotoMap).length,language+': missing or unexpected gallery cards');
 assert(new Set(gallerySlugs).size===gallerySlugs.length,language+': duplicate demo card');
 assert(gallerySlugs.indexOf('sneekiefs')===gallerySlugs.indexOf('soluna-yoga')+1,language+': Sneekiefs must appear immediately after SOLUNA Yoga');
 assert(!hero.includes('automated-crm')&&!hero.includes('process-'),language+': checkout/process photo intrudes into gallery');
 assert(hero.includes('data-motion-src="https://thelaunchera.github.io/demo-booking-landing-/yummm/media/hero-motion-20261108.mp4"'),language+': original YUMMM motion missing');
 // Original campaign art must remain the base image in the EN/ES offer showcase.
 const customer=html.match(/<div class="owner-customer-visual" data-gg-offer-video>([\\s\\S]*?)<\\/div>/)?.[1];
 assert(customer?.includes('src="/demos/golden-grid/resources/golden-1.png"'),language+': Golden Grid master photo missing');
 assert(html.includes('/assets/tle-golden-offer-film-20261109.css?v=2'),language+': tablet/desktop photo CSS cache version missing');
 assert(html.includes('/assets/tle-golden-offer-film-20261109.js?v=2'),language+': tablet/desktop media gate JS cache version missing');
 const basic=html.match(/<article class="plan" id="website-basic">([\s\S]*?)<\/article>/)?.[1];
 const advanced=html.match(/<article class="plan" id="website-plus">([\s\S]*?)<\/article>/)?.[1];
 const process=html.match(/<section class="process" id="proceso">([\s\S]*?)<\/section>/)?.[1];
 assert(basic?.includes(photoRoot+expected.planBasic),language+': basic package photo wrong');
 assert(language!=='en'||basic?.includes('alt="Woman working at a laptop displaying the Jaramillo Boutique website"'), 'English Package 1 Jaramillo image alt missing');
 assert(language!=='es'||basic?.includes('alt="Mujer trabajando en computadora con el sitio de Jaramillo Boutique en pantalla"'), 'Spanish Package 1 Jaramillo image alt missing');
 assert(!basic?.includes('website-la-vie-in-pink-original.jpg'),language+': retired La Vie in Pink package 1 image returned');
 assert(advanced?.includes(photoRoot+expected.planAdvanced),language+': CRM package photo wrong');
 assert(!html.includes('class="app-section"')&&!html.includes('/custom-app/?lang='),language+': duplicate app offer must not appear on landing');
 for(const key of ['processChoose','processBrand','processBuild','processLaunch']){
  assert(process?.includes(photoRoot+expected[key]),language+': '+key+' photo missing');
 }
 for(const name of Object.values(expected)){
  assert(html.split('src="'+photoRoot+name+'"').length===2,language+': '+name+' is missing or duplicated outside its approved package or process section');
  assert(existsSync('public'+photoRoot+name),language+': asset missing: '+name);
 }
 assert(html.includes('$15')&&html.includes('$25')&&!html.includes('$8 USD'),language+': current one-time prices or optional AI billing not aligned');
 assert(/48 (hours|horas)/i.test(html),language+': delivery estimate missing');
 assert(/one revision|revision round|una revisión|ronda de revisión/i.test(html),language+': included single revision missing');
}
assert(goldenOfferCss.includes('@media (min-width:521px)'),'Golden Grid static tablet/desktop breakpoint missing');
assert(goldenOfferCss.includes('display:none!important'),'Golden Grid video must be hidden at tablet/desktop widths');
assert(goldenOfferCss.includes('object-fit:contain!important'),'Golden Grid photo must retain full framing');
assert(goldenOfferJs.includes("window.matchMedia('(max-width: 520px)')"),'Golden Grid JS must only load video on phones');
assert(goldenOfferJs.includes('!phone.matches'),'Golden Grid JS must exclude tablet and desktop');
const photoStyles=css.split('/* 2026-11-05 image placement: keep original hero untouched. */')[1]?.split('/* Short inline billing disclosure')[0];
assert(photoStyles&&!photoStyles.includes('.hero'), 'Photo styling inadvertently edits hero');
assert(photoStyles.includes('object-fit:contain'), 'Uncropped interior photo styling missing');
console.log('PASS: fourteen distinct approved/current demo still images and matching motion posters deep-link in both languages; package photographs, prices, and delivery unchanged.');
