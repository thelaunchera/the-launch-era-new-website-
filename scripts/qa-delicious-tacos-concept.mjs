import assert from "node:assert/strict";
import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { Script } from "node:vm";

const root = join(process.cwd(), "public/demos/delicious-tacos");
const html = readFileSync(join(root, "index.html"), "utf8");
assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
assert.match(html, /not the official Delicious Tacos website/i);
assert.match(html, /1950 S Federal Hwy/);
assert.match(html, /tel:\+15617816080/);
assert.match(html, /www\.google\.com\/maps\/search\//);
assert.match(html, /data-t-html="heroTitle"/);
assert.match(html, /const d=\{\s*en:\{/);
assert.match(html, /es:\{navMenu:/);
assert.match(html, /prefers-reduced-motion/);
assert.doesNotMatch(html, /<form\b|href="[^"]*(?:checkout|stripe|squareup|doordash)/i);
assert.doesNotMatch(html, /<img[^>]+src="\.\/media\/[^"]+\.svg"/, "Illustrated placeholder art must not be used");
const photos = [...html.matchAll(/<img[^>]+src="([^"]+)"[^>]*data-source="stand-in"/g)].map(x=>x[1]);
assert.equal(photos.length, 4, "Must show four distinct licensed photo stand-ins");
assert.equal(new Set(photos).size, 4);
for (const p of photos) assert.match(p,/images\.pexels\.com\/photos\/\d+\/pexels-photo-\d+\.jpeg/);
assert.equal([...html.matchAll(/class="menu-row"/g)].length, 6);
const script = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(x => x[1]).join("\n");
new Script(script, { filename:"delicious-tacos-inline.js" });
console.log("PASS static: editorial photography, licensing disclosures, clear menu, EN/ES and no fake checkout");

if (!process.env.QA_URL) process.exit(0);
const { chromium } = await import("playwright");
const browser = await chromium.launch({ headless:true });
try {
 for (const width of [375,390,820,1440]) {
  const ctx = await browser.newContext({viewport:{width,height:width<600?812:900},reducedMotion:"reduce"});
  const page = await ctx.newPage();
  const errors=[];page.on("pageerror",e=>errors.push(String(e)));
  const response = await page.goto(new URL("/demos/delicious-tacos/",process.env.QA_URL).href,{waitUntil:"domcontentloaded",timeout:30000});
  assert.equal(response.status(),200);
  assert.equal(await page.locator(".menu-row").count(),6);
  await page.locator("img").evaluateAll(imgs=>imgs.forEach(img=>img.loading="eager"));
  await page.waitForFunction(()=>[...document.querySelectorAll('img')].every(x=>x.complete&&x.naturalWidth>0),null,{timeout:25000}).catch(async e=>{const state=await page.locator("img").evaluateAll(imgs=>imgs.map(img=>({src:img.currentSrc,complete:img.complete,width:img.naturalWidth})));throw new Error("Image loading failed "+JSON.stringify(state)+" / "+e.message)});
  const docWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
  if(docWidth>width+1){ const offenders=await page.evaluate(()=>[...document.querySelectorAll("body *")].map(e=>({tag:e.tagName,cls:String(e.className).slice(0,90),text:(e.textContent||"").trim().slice(0,35),right:Math.round(e.getBoundingClientRect().right),left:Math.round(e.getBoundingClientRect().left)})).filter(x=>x.right>innerWidth+1||x.left< -1).slice(0,20));throw new Error("Horizontal overflow at "+width+": "+docWidth+" offending: "+JSON.stringify(offenders)) }
  await page.locator('.filter[data-kind="tacos"]').click();
  assert.equal(await page.locator(".menu-row:visible").count(),4);
  await page.locator('.filter[data-kind="more"]').click();
  assert.equal(await page.locator(".menu-row:visible").count(),2);
  await page.locator('.filter[data-kind="all"]').click();
  assert.equal(await page.locator(".menu-row:visible").count(),6);
  await page.locator("#language").click();
  assert.equal(await page.locator("html").getAttribute("lang"),"es");
  assert.equal((await page.locator("[data-t='menuKicker']").textContent()).trim(),"01 / EL MENÚ");
  if(width<600){
   await page.locator("#menuToggle").click();
   assert.equal(await page.locator("#menuToggle").getAttribute("aria-expanded"),"true");
   await page.keyboard.press("Escape");
   assert.equal(await page.locator("#menuToggle").getAttribute("aria-expanded"),"false");
  }
  assert.deepEqual(errors,[]);
  if([375,820,1440].includes(width)){
   await page.locator("#language").click();
   await page.evaluate(()=>{document.documentElement.style.scrollBehavior="auto";window.scrollTo(0,0)});
   await page.waitForFunction(()=>window.scrollY===0,null,{timeout:5000});
   mkdirSync("qa-screenshots/delicious-tacos",{recursive:true});
   await page.screenshot({path:"qa-screenshots/delicious-tacos/"+width+".png",fullPage:true,animations:"disabled"});
  }
  await ctx.close();
 }
}finally{await browser.close()}
console.log("PASS real-photography responsive Chromium QA at 375, 390, 820, 1440 px");
