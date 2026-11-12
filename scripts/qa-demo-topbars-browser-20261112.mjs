#!/usr/bin/env node
/* Browser test of the published portfolio's independently sourced headers. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
const root=process.cwd();
const secondary=process.env.SECONDARY_ROOT||path.resolve('fixtures/secondary');
const jaramillo=process.env.JARAMILLO_ROOT||path.resolve('fixtures/jaramillo');
const catalog=fs.readFileSync('public/demos/index.html','utf8');
const brands=[...new Set([...catalog.matchAll(/data-brand="([^"]+)"/g)].map(x=>x[1]))].filter(x=>x!=='experience-cleaning');
assert.ok(brands.length>0,'Brand catalog must not be empty');
const sample={
 aftr:['TONIGHT','ESTA NOCHE'],crumb:['Cookies','Galletas'],
 'ivory-and-bloom':['Our Cakes','Nuestros pasteles'],
 'nail-room':['Services','Servicios'],
 'seasonal-brew':['Our flavors','Nuestros sabores'],
 'soluna-yoga':['Our approach','Nuestra filosofía'],
 velmora:['Shop','Comprar'],
 'wok-social':['OUR VIBE','NUESTRA ESENCIA'],
 yummm:['Boxes to go','Cajas para llevar']
};
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.json':'application/json','.mp4':'video/mp4'};
function localFile(input){
 const url=decodeURIComponent(new URL(input,'http://localhost').pathname);
 let f=url.startsWith('/secondary/jaramillo-boutique/')?path.join(jaramillo,'demos',url.slice('/secondary/'.length)):
 url.startsWith('/secondary/assets/')?path.join(secondary,'assets',url.slice('/secondary/assets/'.length)):
 url.startsWith('/secondary/')?path.join(secondary,'demos',url.slice('/secondary/'.length)):
 path.join(root,'public',url);
 if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
 return f;
}
const server=http.createServer((req,res)=>{
 const f=localFile(req.url);
 if(!fs.existsSync(f)){res.writeHead(404);return res.end('Not found');}
 res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});
 fs.createReadStream(f).pipe(res);
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await (process.env.BROWSER==='webkit'?webkit:chromium).launch({headless:true});
const out='qa-artifacts/demo-topbars';
fs.mkdirSync(out,{recursive:true});
try{
 for(const width of [360,390,820,1440])for(const brand of brands){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  await page.route('**/*',async route=>{
    const u=new URL(route.request().url());
    if(u.origin===origin||['fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname))return route.continue();
    let url;
    if(u.hostname==='thelaunchera.com')url=u.pathname;
    if(u.hostname==='thelaunchera.github.io'&&u.pathname.startsWith('/demo-booking-landing-/'))url='/secondary/'+u.pathname.slice('/demo-booking-landing-/'.length);
    if(u.hostname==='raw.githubusercontent.com'&&u.pathname.startsWith('/thelaunchera/demo-booking-landing-/main/demos/'))url='/secondary/'+u.pathname.split('/main/demos/')[1];
    const f=url&&localFile(url);
    if(f&&fs.existsSync(f))return route.fulfill({path:f,contentType:mime[path.extname(f)]});
    return route.abort();
  });
  if(brand==='aftr')await page.addInitScript(()=>sessionStorage.setItem('aftr_age_confirmed','yes'));
  const route=fs.existsSync(path.join(root,'public/demos',brand,'index.html'))?'/demos/'+brand+'/':'/secondary/'+brand+'/';
  await page.goto(origin+route,{waitUntil:'domcontentloaded'});
  await page.locator('header.tle-demo-compact-header').first().waitFor({state:'attached',timeout:10000});
  const header=page.locator('header.tle-demo-compact-header').first();
  const bounds=await header.boundingBox();
  assert(bounds&&bounds.x>=-2&&bounds.x+bounds.width<=width+2,brand+' header bounds at '+width+': '+JSON.stringify(bounds));
  const toggle=header.locator('.tle-demo-lang-control');
  if(sample[brand]){
    assert.equal(await toggle.count(),1,brand+' must have a single locale toggle');
    const box=await toggle.boundingBox();
    assert(box&&box.x>=-2&&box.x+box.width<=width+2,brand+' locale switch clipped at '+width+': '+JSON.stringify(box));
    const before=await header.locator('a[href]').evaluateAll(els=>els.map(e=>e.getAttribute('href')));
    await toggle.locator('[data-tle-lang="es"]').click();
    assert.equal(await page.locator('html').getAttribute('lang'),'es');
    assert.equal(await toggle.locator('[data-tle-lang="es"]').getAttribute('aria-pressed'),'true');
    assert((await page.locator('body').innerText()).includes(sample[brand][1]),brand+' Spanish primary copy absent');
    await toggle.locator('[data-tle-lang="en"]').click();
    assert.equal(await page.locator('html').getAttribute('lang'),'en');
    assert((await page.locator('body').innerText()).includes(sample[brand][0]),brand+' original English not restored');
    const after=await header.locator('a[href]').evaluateAll(els=>els.map(e=>e.getAttribute('href')));
    assert.deepEqual(after,before,brand+' header destinations changed after toggling');
  }else{
    assert.equal(await toggle.count(),0,brand+' native language selector duplicated');
  }
  if(brand==='ivory-and-bloom'){
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert(overflow<=3,'Ivory horizontal overflow at '+width+': '+overflow);
  }
  if(width===390&&sample[brand])await page.screenshot({path:out+'/'+brand+'-'+(process.env.BROWSER||'chromium')+'.png',animations:'disabled'});
  console.log('PASS TOPBAR',brand,width);
  await page.close();
 }
}finally{await browser.close();server.close();}
