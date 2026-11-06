/* Archived booking bundle is preserved for previous customers, not marketed.
   Its generated media must not be a prerequisite for publishing the new site. */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const read=p=>readFileSync(p,'utf8');
const legacy='public/booking-bundle/index.html';
assert(existsSync(legacy),'Do not remove existing customer-order links');
const html=read(legacy);
assert.match(html,/name="robots" content="noindex/,'Retired sales landing must not appear in SEO');
assert.match(html,/id="choose-plan"/,'Preserve historical buyers choice');
assert(!read('public/sitemap.xml').includes('<loc>https://thelaunchera.com/booking-bundle/</loc>'),'Old sales must be excluded from sitemap');
const builder=read('scripts/build_mobile_flow_assets.py');
assert(builder.includes('bundle-landing'),'Preserve historical generated media builder for client access');
for(const f of ['public/assets/tle-bundle-landing.js','public/assets/tle-booking-bundle.js']){
 execFileSync(process.execPath,['--check',f],{stdio:'pipe'});
}
for(const name of ['hero','booking','command','ai']){
 assert(html.includes('/assets/bundle-landing/optimized/'+name+'.webp'),'Archived photo reference missing: '+name);
}
console.log('[ARCHIVED BUNDLE] Existing buyer route preserved, excluded from public SEO and original asset builder retained');
