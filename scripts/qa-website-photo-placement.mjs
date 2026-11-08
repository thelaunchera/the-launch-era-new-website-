// Guard the approved hero asset inside the new user-requested gallery and preserve independent interior photos.
import {readFileSync,existsSync} from 'node:fs';
const en=readFileSync('public/website-for-your-business/index.html','utf8');
const es=readFileSync('public/es/website-for-your-business/index.html','utf8');
const css=readFileSync('public/assets/tle-website-official.css','utf8');
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
  planBasic:'website-la-vie-in-pink-original.jpg',
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
  'casa-brownie':'/demos/casa-brownie/assets/hero-brownies.webp',
  'golden-grid':'/demos/golden-grid/resources/golden-1.png',
  'yummm':'https://thelaunchera.github.io/demo-booking-landing-/yummm/images/10.webp',
  'aftr':'/demos/aftr/assets/hero-real-20261031.webp',
  'ivory-and-bloom':'/demos/ivory-and-bloom/images/hero-cake-artist.webp',
  'marea-wigs-miami':'/demos/marea-wigs-miami/resources/01-hero.png',
  'sova':'/demos/sova/resources/01-hero.png'
 };
 const galleryVideoMap={
  'casa-brownie':'/demos/casa-brownie/media/hero-motion-20261108.mp4',
  'golden-grid':'/demos/golden-grid/media/hero-motion-20261108.mp4',
  'yummm':'https://thelaunchera.github.io/demo-booking-landing-/yummm/media/hero-motion-20261108.mp4',
  'aftr':'/demos/aftr/media/hero-motion-20261108.mp4',
  'ivory-and-bloom':'/demos/ivory-and-bloom/media/hero-motion-20261108.mp4',
  'marea-wigs-miami':'/demos/marea-wigs-miami/media/hero-motion-20261108.mp4',
  'sova':'/demos/sova/media/hero-motion-20261108.mp4'
 };
 assert(!hero.includes('data-demo="crumb"')&&!hero.includes('data-hero-video="/demos/crumb'),language+': CRUMB must remain outside this animated seven-card portfolio');
 for(const [slug,image] of Object.entries(galleryPhotoMap)){
  assert(hero.includes('data-demo="'+slug+'"'),language+': missing distinct demo '+slug);
  const expectedHeroLink='href="/demos/?demo='+slug+'&amp;returnTo='+encodeURIComponent(language==='es'?'/es/website-for-your-business/':'/website-for-your-business/')+(language==='es'?'&amp;lang=es':'')+'"';
  assert(hero.includes(expectedHeroLink),language+': photo must link to its demo, retain locale and remember originating website');
  assert(hero.includes('src="'+image+'"'),language+': incorrect original hero photo for '+slug);
  if(image.startsWith('/'))assert(existsSync('public'+image),language+': hero image asset missing for '+slug);
  const video=galleryVideoMap[slug];
  assert(video&&hero.includes('data-hero-video="'+video+'"'),language+': motion must use the original approved video for '+slug);
  if(video.startsWith('/'))assert(existsSync('public'+video),language+': original hero video missing for '+slug);
 }
 assert(!hero.includes('data-demo="umbral"')&&!hero.includes('<figcaption>Umbral</figcaption>'),language+': Umbral must not be duplicated because it is Havana 19');
 assert(!hero.includes(photoRoot+'hero-jaramillo.svg')&&!hero.includes(photoRoot+'website-la-vie-in-pink-en.jpg'),language+': old mockup must not replace original demo hero photography');
 assert(hero.includes('hero-gallery-stage'),language+': gallery composition missing');
 assert((hero.match(/class="hero-gallery-card"/g)||[]).length===7,language+': expected seven distinct demo cards');
 assert(!hero.includes('automated-crm')&&!hero.includes('process-'),language+': checkout/process photo intrudes into gallery');
 const basic=html.match(/<article class="plan" id="website-basic">([\s\S]*?)<\/article>/)?.[1];
 const advanced=html.match(/<article class="plan" id="website-ai-crm">([\s\S]*?)<\/article>/)?.[1];
 const process=html.match(/<section class="process" id="proceso">([\s\S]*?)<\/section>/)?.[1];
 assert(basic?.includes(photoRoot+expected.planBasic),language+': basic package photo wrong');
 assert(language!=='en'||basic?.includes('alt="Woman working at a laptop displaying the Jaramillo Boutique website"'), 'English Package 1 Jaramillo image alt missing');
 assert(advanced?.includes(photoRoot+expected.planAdvanced),language+': CRM package photo wrong');
 assert(!html.includes('class="app-section"')&&!html.includes('/custom-app/?lang='),language+': duplicate app offer must not appear on landing');
 for(const key of ['processChoose','processBrand','processBuild','processLaunch']){
  assert(process?.includes(photoRoot+expected[key]),language+': '+key+' photo missing');
 }
 for(const name of Object.values(expected)){
  assert(html.split('src="'+photoRoot+name+'"').length===2,language+': '+name+' is missing or duplicated outside its approved package or process section');
  assert(existsSync('public'+photoRoot+name),language+': asset missing: '+name);
 }
 assert(html.includes('$15')&&html.includes('$25')&&html.includes('$8 USD'),language+': prices not aligned');
 assert(/48 (hours|horas)/i.test(html),language+': delivery estimate missing');
 assert(/revision round|ronda de revisión/i.test(html),language+': included revision round missing');
}
const photoStyles=css.split('/* 2026-11-05 image placement: keep original hero untouched. */')[1]?.split('/* Short inline billing disclosure')[0];
assert(photoStyles&&!photoStyles.includes('.hero'), 'Photo styling inadvertently edits hero');
assert(photoStyles.includes('object-fit:contain'), 'Uncropped interior photo styling missing');
console.log('PASS: seven selected original hero videos and photos deep-link to their real galleries in EN/ES, CRUMB remains excluded, and packages/prices/delivery are preserved.');
