import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { chromium, webkit } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PACKAGE || 'playwright');
const root=process.cwd(), secondary=process.env.SECONDARY_ROOT||path.resolve(root,'../secondary'), jaramillo=process.env.JARAMILLO_ROOT||path.resolve(root,'../jaramillo');
const asset=fs.readFileSync('public/assets/tle-demo-discovery-20261110.js','utf8');
const configs=JSON.parse(asset.split('/* CONFIG_START */')[1].split('/* CONFIG_END */')[0]);
const secondaryBrands=['wok-social','seasonal-brew','yummm','soluna-yoga','nail-room','jaramillo-boutique'];
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp4':'video/mp4','.json':'application/json','.woff2':'font/woff2'};
function localFile(url){const name=decodeURIComponent(new URL(url,'http://localhost').pathname);let file;if(name.startsWith('/secondary/jaramillo-boutique/'))file=path.join(jaramillo,'demos',name.slice('/secondary/'.length));else if(name.startsWith('/secondary/assets/'))file=path.join(secondary,'assets',name.slice('/secondary/assets/'.length));else if(name.startsWith('/secondary/'))file=path.join(secondary,'demos',name.slice('/secondary/'.length));else file=path.join(root,'public',name);if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');return file;}
const server=http.createServer((req,res)=>{const file=localFile(req.url);if(!fs.existsSync(file)){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res)});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const out='qa-artifacts/demo-discovery';fs.mkdirSync(out,{recursive:true});const report=[];
const engine=process.env.BROWSER==='webkit'?webkit:chromium;const browser=await engine.launch({headless:true});
try{for(const width of [375,1440])for(const [brand,cfg]of Object.entries(configs).sort(([a],[b])=>(a==='jaramillo-boutique'?-1:b==='jaramillo-boutique'?1:0))){
const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin===origin)return route.continue();if(u.hostname==='thelaunchera.com'){const file=localFile(u.pathname);if(fs.existsSync(file))return route.fulfill({path:file,contentType:mime[path.extname(file)]});}return route.abort()});
const url=origin+(secondaryBrands.includes(brand)?'/secondary/'+brand+'/':brand==='experience-cleaning'?'/experience-cleaning/':'/demos/'+brand+'/');
if(brand==='aftr')await page.addInitScript(()=>sessionStorage.setItem('aftr_age_confirmed','yes'));
await page.goto(url,{waitUntil:'domcontentloaded'});await page.locator('main .hero').first().waitFor();
// The secondary fixtures may not have received the include commit yet; exercise the exact release module.
if(!await page.locator('[data-discovery-brand]').count())await page.evaluate(brand=>{const s=document.createElement('script');s.src='https://thelaunchera.com/assets/tle-demo-discovery-20261110.js?v=1';s.dataset.discoveryBrand=brand;document.body.append(s)},brand);
await page.locator('#tle-brand-discovery').waitFor();await page.waitForTimeout(400);const baseline=errors.splice(0);
if(brand==='jaramillo-boutique'){page.on('console',m=>{if(m.text().startsWith('DISCOVERY_DEBUG'))console.log(m.text())});await page.evaluate(()=>document.addEventListener('click',e=>console.log('DISCOVERY_DEBUG click',e.isTrusted,e.target.closest('a,button')?.outerHTML.slice(0,220)),true))}
assert.equal(await page.locator('#tle-brand-discovery').count(),1);assert.equal(await page.locator('#tle-brand-discovery .td-card').count(),3);
assert(await page.locator('main .hero').first().evaluate(hero=>hero.nextElementSibling?.id==='tle-brand-discovery'));
const geometry=await page.locator('#tle-brand-discovery').evaluate(s=>{const r=s.getBoundingClientRect();return {left:r.left,right:r.right,width:innerWidth,cards:[...s.querySelectorAll('a')].map(a=>({height:a.getBoundingClientRect().height,photo:a.style.getPropertyValue('--td-photo')}))}});
assert(geometry.left>=-1&&geometry.right<=geometry.width+1,brand+' discovery overflow');assert(geometry.cards.every(c=>c.height>=44&&c.photo),brand+' photo and touch targets');
// Test the same shortcuts after a search so category selection cannot inherit stale empty results.
if(await page.locator('#tle-menu-search').count())await page.locator('#tle-menu-search').fill('no matching favorite');
for(let index=0;index<3;index++){
const shortcut=page.locator('#tle-brand-discovery .td-card').nth(index);
await shortcut.scrollIntoViewIfNeeded();
// Scroll the rail deliberately, as a phone swipe would, before a real hit-tested click.
await page.locator('#tle-brand-discovery .td-track').evaluate((track,index)=>{const a=track.querySelectorAll('a')[index];track.scrollLeft=a.offsetLeft-track.offsetLeft},index);
await page.waitForFunction(index=>{const a=document.querySelectorAll('#tle-brand-discovery .td-card')[index],r=a.getBoundingClientRect();const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return r.left>=-1&&r.right<=innerWidth+1&&!!hit&&(hit===a||a.contains(hit))},index);
await shortcut.click();
assert(await page.locator(cfg[4][index][2]).isVisible(),brand+' destination '+index);
const trigger=cfg[4][index][4];if(trigger&&await page.locator(trigger).count()){
if(brand==='jaramillo-boutique')console.log('DISCOVERY_DEBUG state',index,await page.locator('.filter').evaluateAll(bs=>bs.map(b=>[b.dataset.filter,b.getAttribute('aria-pressed')])));
const selected=await page.locator(trigger).getAttribute('aria-pressed');if(selected!==null){await page.waitForFunction(selector=>document.querySelector(selector)?.getAttribute('aria-pressed')==='true',trigger);assert.equal(await page.locator(trigger).getAttribute('aria-pressed'),'true',brand+' native filter '+index);}}
}
assert.deepEqual(errors,[],brand+' errors after shortcut');
await page.locator('#tle-brand-discovery .td-track').evaluate(track=>{track.scrollLeft=0});
await page.locator('#tle-brand-discovery').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/'+brand+'-'+width+'-'+(process.env.BROWSER||'chromium')+'.png'});
report.push({brand,width,passed:true,preExistingErrors:baseline});console.log('PASS',brand,width);await page.close();
}}finally{fs.writeFileSync(out+'/results-'+(process.env.BROWSER||'chromium')+'.json',JSON.stringify(report,null,2));await browser.close();server.close()}
