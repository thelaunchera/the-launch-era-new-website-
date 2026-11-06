/* Current official site uses a simple accessible four-step visual process.
   Old cleaning-specific shared-element transitions remain archived. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const pages=[['EN','public/website-for-your-business/index.html'],['ES','public/es/website-for-your-business/index.html']];
const photos=['process-choose.svg','process-brand.svg','process-build.svg','process-launch.svg'];
for(const [lang,path] of pages){
 const html=read(path);
 assert.match(html,/class="process-grid"/,lang+' process grid missing');
 assert.equal((html.match(/class="step-photo"/g)||[]).length,4,lang+' process must have four separate photos');
 assert.equal((html.match(/class="step-no"/g)||[]).length,4,lang+' process numbers must be explicit');
 for(const photo of photos){
  assert(html.includes(photo),lang+' photo missing: '+photo);
  assert(existsSync('public/assets/website-packages-20261105/'+photo),lang+' photo file missing: '+photo);
 }
 assert(html.includes('href="#proceso"'),lang+' process navigation missing');
 assert(lang==='ES'?html.includes('Construimos tu sistema'):html.includes('We build your system'),lang+' process title not localized');
}
const css=read('public/assets/tle-website-official.css');
assert.match(css,/prefers-reduced-motion/,'Reduced-motion support is required');
assert.match(css,/object-fit:\s*cover/,'Photos must crop without distortion');
console.log('[TLE PROCESS QA] Four real photos, distinct steps and bilingual process UX passed');
