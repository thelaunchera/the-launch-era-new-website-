// Guard the approved hero and all seven independent interior photos on the bilingual website landing.
import {readFileSync,existsSync} from 'node:fs';
const en=readFileSync('public/website-for-your-business/index.html','utf8');
const es=readFileSync('public/es/website-for-your-business/index.html','utf8');
const css=readFileSync('public/assets/tle-website-official.css','utf8');
const photoRoot='/assets/website-packages-20261105/';
const expected={
 planBasic:'website-la-vie-in-pink.svg',
 planAdvanced:'automated-crm.svg',
 processChoose:'process-choose.svg',
 processBrand:'process-brand.svg',
 processBuild:'process-build.svg',
 processLaunch:'process-launch.svg',
 optionalApp:'optional-app.svg',
};
function assert(test, message){if(!test)throw new Error(message);}
for(const [language,html] of [['en',en],['es',es]]){
 const hero=html.match(/<section class="hero" id="inicio">([\s\S]*?)<\/section>/)?.[1];
 assert(hero,language+': hero missing');
 assert(hero.includes('src="'+photoRoot+'hero-jaramillo.svg"'),language+': approved original hero was replaced');
 assert(!hero.includes('automated-crm')&&!hero.includes('process-'),language+': interior photo intrudes into hero');
 const basic=html.match(/<article class="plan" id="website-basic">([\s\S]*?)<\/article>/)?.[1];
 const advanced=html.match(/<article class="plan" id="website-ai-crm">([\s\S]*?)<\/article>/)?.[1];
 const app=html.match(/<section class="app-section">([\s\S]*?)<\/section>/)?.[1];
 const process=html.match(/<section class="process" id="proceso">([\s\S]*?)<\/section>/)?.[1];
 assert(basic?.includes(photoRoot+expected.planBasic),language+': basic package photo wrong');
 assert(advanced?.includes(photoRoot+expected.planAdvanced),language+': CRM package photo wrong');
 assert(app?.includes(photoRoot+expected.optionalApp),language+': optional app photo wrong');
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
console.log('PASS: hero untouched; 7 correct individual images in English and Spanish; pricing and delivery aligned.');
