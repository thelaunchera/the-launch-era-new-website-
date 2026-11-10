// Measure real rendered heroes from the current catalog; no fixed demo count.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';

const root=process.cwd();
const secondary=process.env.SECONDARY_ROOT||path.resolve(root,'../secondary');
const jaramillo=process.env.JARAMILLO_ROOT||path.resolve(root,'../jaramillo');
const catalog=fs.readFileSync('public/demos/index.html','utf8');
const brands=[...new Set([...catalog.matchAll(/data-brand="([^"]+)"/g)].map(m=>m[1]))];
assert(brands.length>0,'Discover current catalog instead of assuming a total');
const out='qa-artifacts/hero-clarity';fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp4':'video/mp4','.json':'application/json','.woff2':'font/woff2'};
function localFile(name){
 name=decodeURIComponent(new URL(name,'http://localhost').pathname);
 let file=name.startsWith('/secondary/jaramillo-boutique/')?path.join(jaramillo,'demos',name.slice('/secondary/'.length)):
 name.startsWith('/secondary/assets/')?path.join(secondary,'assets',name.slice('/secondary/assets/'.length)):
 name.startsWith('/secondary/')?path.join(secondary,'demos',name.slice('/secondary/'.length)):path.join(root,'public',name);
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 return file;
}
const server=http.createServer((req,res)=>{
 const file=localFile(req.url);
 if(!fs.existsSync(file)){res.writeHead(404);return res.end('Not found')}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const engine=process.env.BROWSER==='webkit'?webkit:chromium;
const browser=await engine.launch({headless:true});
const changed={
 'freska':['.hero-buttons a[href="#flavors"]','FRUIT DRINKS'],
 'sneekiefs':['.hero-copy a[href="#collection"]','SNEAKERS /'],
 'la-vie-in-pink':['.hero-actions a[href="#menu"]','ALL-DAY BRUNCH'],
 'lavender-edit':['.hero-copy a[href="#boutique"]','EVERYDAY RITUALS'],
 'aftr':['.hero-cta a[href="#tonight"]','Las Vegas nights'],
 'wok-social':['.hero-actions a[href="#menu"]','NOODLES & HIBACHI'],
 'seasonal-brew':['.hero-actions a[href="#seasonal-menu"]','SEASONAL COFFEE'],
 'velmora':['.hero-copy a[href="#shop"]','Lipstick & makeup'],
 'nail-room':['.hero-actions a[href="#services"]','NAIL ART']
};
const report=[];
try{
 for(const width of [360,390,820,1024,1440])for(const brand of brands){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async route=>{
   const u=new URL(route.request().url());
   if(u.origin===origin||u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com')return route.continue();
   let name;
   if(u.hostname==='thelaunchera.com')name=u.pathname;
   if(u.hostname==='thelaunchera.github.io'&&u.pathname.startsWith('/demo-booking-landing-/'))name='/secondary/'+u.pathname.slice('/demo-booking-landing-/'.length);
   if(u.hostname==='raw.githubusercontent.com'&&u.pathname.startsWith('/thelaunchera/demo-booking-landing-/main/demos/'))name='/secondary/'+u.pathname.split('/main/demos/')[1];
   const file=name&&localFile(name);
   if(file&&fs.existsSync(file))return route.fulfill({path:file,contentType:mime[path.extname(file)]});
   return route.abort();
  });
  if(brand==='aftr')await page.addInitScript(()=>sessionStorage.setItem('aftr_age_confirmed','yes'));
  const local=fs.existsSync(path.join(root,'public/demos',brand,'index.html'));
  const url=brand==='experience-cleaning'?'/experience-cleaning/':local?'/demos/'+brand+'/':'/secondary/'+brand+'/';
  await page.goto(origin+url,{waitUntil:'domcontentloaded'});
  const hero=page.locator('main .hero').first();await hero.waitFor();
  await page.waitForTimeout(500); // Native delayed catalog/locale mounting.
  const geometry=await hero.evaluate(async h=>{
   const visible=n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return r.width>20&&r.height>20&&s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity>0};
   const photos=[...h.querySelectorAll('img')].filter(visible);
   for(const img of photos){try{await img.decode()}catch{}}
   return {width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,
    heroHeight:h.getBoundingClientRect().height,text:h.innerText,
    photos:photos.map(n=>({src:n.currentSrc,loaded:n.naturalWidth>0})),
    hasMedia:photos.length>0||!!h.querySelector('video,.hero-image,[role="img"]'),
    headings:[...h.querySelectorAll('h1,h2')].filter(visible).map(n=>({text:n.innerText,left:n.getBoundingClientRect().left,right:n.getBoundingClientRect().right})),
    actions:[...h.querySelectorAll('a,button')].filter(visible).map(n=>({text:n.innerText,href:n.getAttribute('href'),height:n.getBoundingClientRect().height}))};
  });
  assert(geometry.heroHeight>150,brand+' needs a visible hero');
  assert(geometry.overflow<=3,brand+' horizontal overflow at '+width+': '+geometry.overflow);
  assert(geometry.hasMedia,brand+' must retain brand photography');
  assert(geometry.photos.every(p=>p.loaded),brand+' missing hero photo '+JSON.stringify(geometry.photos));
  assert(geometry.headings.every(h=>h.left>=-2&&h.right<=width+2),brand+' headline clipped at '+width);
  if(changed[brand]){
   assert(geometry.text.includes(changed[brand][1]),brand+' must say what it offers');
   const cta=page.locator('.hero '+changed[brand][0].replace(/^\.hero /,'')).first();
   assert(await cta.isVisible(),brand+' primary action visible');
   const rect=await cta.boundingBox();assert(rect.height>=44,brand+' primary target too small');
   if(['freska','sneekiefs','nail-room'].includes(brand)){
    const contrast=await hero.evaluate((h,brand)=>{
     const lum=s=>{const c=s.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722};
     const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
     if(brand==='sneekiefs')return ratio(getComputedStyle(h.querySelector('.hero-copy>p')).color,getComputedStyle(h).backgroundColor);
     const button=h.querySelector(brand==='freska'?'.pill-pink':'.hero-actions .pink'),style=getComputedStyle(button);
     const colors=style.backgroundImage.match(/rgba?\([^)]+\)/g)||[style.backgroundColor];
     return Math.min(...colors.map(c=>ratio(style.color,c)));
    },brand);
    assert(contrast>=4.5,brand+' small copy/primary action contrast '+contrast.toFixed(2));
   }
   const dest=await cta.getAttribute('href');assert(dest?.startsWith('#'));
   assert.equal(await page.locator(dest).count(),1,brand+' primary destination exists once');
   await cta.click();
   assert(await page.locator(dest).isVisible(),brand+' click opens native destination');
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  }
  assert.deepEqual(errors,[],brand+' runtime errors');
  if([390,820,1440].includes(width))await page.screenshot({path:out+'/'+brand+'-'+width+'-'+(process.env.BROWSER||'chromium')+'.png',animations:'disabled'});
  report.push({brand,width,passed:true,...geometry});console.log('PASS',brand,width);await page.close();
 }
}finally{
 fs.writeFileSync(out+'/results-'+(process.env.BROWSER||'chromium')+'.json',JSON.stringify(report,null,2));
 await browser.close();server.close();
}
