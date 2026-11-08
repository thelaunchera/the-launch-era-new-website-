import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const routes=['public/website-for-your-business/index.html','public/es/website-for-your-business/index.html'];
const photos={
 en:['hero-jaramillo.svg','automated-crm-en-sharp.png','process-choose-en.png','process-brand-en.png','process-build-en.png','process-launch-en.png'],
 es:['hero-jaramillo.svg','website-la-vie-in-pink-original.jpg','automated-crm-original.jpg','process-choose-original.jpg','process-brand-original.jpg','process-build-original.jpg','process-launch-original.jpg']
};
const css=readFileSync('public/assets/tle-website-official.css','utf8');
const galleryCss=readFileSync('public/assets/tle-gallery-hero-20261107.css','utf8');
assert.ok(galleryCss.includes('prefers-reduced-motion'),'reduced-motion gallery fallback');
assert.ok(galleryCss.includes('scroll-snap-type:x mandatory'),'touch gallery on phone');
assert.ok(css.includes('max-width:780px'),'phone CTA rules');
assert.ok(css.includes('hero>img'),'hero photo');
for(const [language,paths] of Object.entries(photos))
 for(const filename of paths)
  assert.ok(existsSync('public/assets/website-packages-20261105/'+filename),language+': missing photo '+filename);
for(const r of routes){
 const html=readFileSync(r,'utf8');
 const language=r.includes('/es/')?'es':'en';
 for(const filename of photos[language])assert.ok(html.includes(filename),language+': missing photo '+filename+' at '+r);
 assert.ok(html.includes('class="hero hero-gallery"'),'gallery hero not on '+language);
 assert.match(html, /\/assets\/tle-gallery-hero-20261107\.css\?v=\d+/, 'gallery styles not linked on '+language);
 assert.ok((html.match(/class="hero-gallery-card"/g)||[]).length===11,'eleven real demo gallery panels not present on '+language);
 for(const filename of photos[language==='es'?'en':'es'].slice(1))
  assert.ok(!html.includes(filename),language+': photo from other language leaked '+filename);
 assert.match(html,/id="website-basic"/);
 if(language==='en')assert.match(html,/<article class="plan" id="website-basic"><img class="plan-photo" src="\/assets\/website-packages-20261105\/hero-jaramillo\.svg"/,'EN Package 1 should feature Jaramillo photo');
 assert.match(html,/id="website-ai-crm"/);
 assert.doesNotMatch(html,/class="app-section"|\/custom-app\/\?lang=|optional-app-original/,'the redundant app offer must be hidden');
 assert.match(html,/\$15/);
 assert.match(html,/\$25/);
 assert.match(html,/\/website-checkout\/\?offer=website-basic&lang=/);
 assert.match(html,/\/website-checkout\/\?offer=website-ai-crm&lang=/);
 assert.doesNotMatch(html,/<p class="fine" data-key="termsNote">/,'no long pricing disclaimer');
 assert.match(html,/\/terms\.html/);
 assert.doesNotMatch(html,/\/service-checkout\//,'do not route to incomplete legacy checkout');
 assert.ok(html.includes('href="#paquetes"'),'package anchor');
 assert.ok(html.includes('href="#proceso"'),'process anchor');
 assert.ok(html.includes('href="#preguntas"'),'FAQ anchor');
}
console.log('[TLE OFFICIAL LANDING] Eleven-card gallery, original approved photo and independent ES/EN package photos, pricing/checkout preserved, responsive CSS checked');
