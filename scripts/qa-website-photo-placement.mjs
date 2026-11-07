// Guard the approved hero asset inside the new user-requested gallery and preserve independent interior photos.
import {readFileSync,existsSync} from 'node:fs';
const en=readFileSync('public/website-for-your-business/index.html','utf8');
const es=readFileSync('public/es/website-for-your-business/index.html','utf8');
const css=readFileSync('public/assets/tle-website-official.css','utf8');
const photoRoot='/assets/website-packages-20261105/';
const expectedByLanguage={
 en:{
  planBasic:'website-la-vie-in-pink-en-sharp.png',
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
 assert(hero.includes('src="'+photoRoot+'hero-jaramillo.svg"'),language+': approved Jaramillo image missing from gallery');
 assert(hero.includes('hero-gallery-stage'),language+': gallery composition missing');
 assert((hero.match(/class="hero-gallery-card"/g)||[]).length===7,language+': expected seven distinct demo cards');
 assert(!hero.includes('automated-crm')&&!hero.includes('process-'),language+': checkout/process photo intrudes into gallery');
 const basic=html.match(/<article class="plan" id="website-basic">([\s\S]*?)<\/article>/)?.[1];
 const advanced=html.match(/<article class="plan" id="website-ai-crm">([\s\S]*?)<\/article>/)?.[1];
 const process=html.match(/<section class="process" id="proceso">([\s\S]*?)<\/section>/)?.[1];
 assert(basic?.includes(photoRoot+expected.planBasic),language+': basic package photo wrong');
 assert(advanced?.includes(photoRoot+expected.planAdvanced),language+': CRM package photo wrong');
 assert(!html.includes('class="app-section"')&&!html.includes('/custom-app/?lang='),language+': duplicate app offer must not appear on landing');
 for(const key of ['processChoose','processBrand','processBuild','processLaunch']){
  assert(process?.includes(photoRoot+expected[key]),language+': '+key+' photo missing');
 }
 for(const name of Object.values(expected)){
  assert(html.split('src="'+photoRoot+name+'"').length===2,language+': '+name+' is missing or duplicated');
  assert(existsSync('public'+photoRoot+name),language+': asset missing: '+name);
 }
 assert(html.includes('$15')&&html.includes('$25')&&html.includes('$8 USD'),language+': prices not aligned');
 assert(/48 (hours|horas)/i.test(html),language+': delivery estimate missing');
 assert(/revision round|ronda de revisión/i.test(html),language+': included revision round missing');
}
const photoStyles=css.split('/* 2026-11-05 image placement: keep original hero untouched. */')[1];
assert(photoStyles&&!photoStyles.includes('.hero'), 'Photo styling inadvertently edits hero');
assert(photoStyles.includes('object-fit:contain'), 'Uncropped interior photo styling missing');
console.log('PASS: seven-card gallery includes approved Jaramillo asset, package photos remain language-correct, prices and delivery unchanged.');
