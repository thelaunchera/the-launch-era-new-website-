/**
 * iPhone-size Spanish/English customer ↔ owner interaction test.
 * No production data, no actual booking, no network writes.
 * QA_URL=http://127.0.0.1:4173 node scripts/qa-owner-bilingual-browser.mjs
 */
import assert from "node:assert/strict";
import {chromium,devices} from "playwright";
import {mkdir} from "node:fs/promises";

const origin=(process.env.QA_URL||"http://127.0.0.1:4173").replace(/\/$/,"");
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({...devices["iPhone 13"],locale:"es-US",reducedMotion:"reduce"});
const page=await context.newPage();
const capture="qa-screenshots/demo-gallery/owner-spanish-iphone.png";
try{
 await mkdir("qa-screenshots/demo-gallery",{recursive:true});
 const res=await page.goto(origin+"/es/website-for-your-business/",{waitUntil:"domcontentloaded",timeout:35000});
 assert.equal(res?.status(),200,"Spanish sales page must be available");
 await page.locator(".owner-experience-cta").click();
 await page.waitForURL(u=>u.pathname==="/demos/"&&u.searchParams.get("demo")==="golden-grid"&&u.searchParams.get("lang")==="es",{timeout:15000});
 await page.waitForFunction(()=>document.querySelector("#demo-viewer")?.open===true,null,{timeout:15000});
 assert.equal(await page.locator("html").getAttribute("lang"),"es");
 assert.equal((await page.locator("#viewer-owner").innerText()).trim(),"Vista del propietario");
 await page.locator("#viewer-owner").click();
 await page.waitForURL(u=>u.pathname==="/demos/owner-center/"&&u.searchParams.get("demo")==="golden-grid"&&u.searchParams.get("lang")==="es",{timeout:15000});
 assert.match(await page.locator("#heading").innerText(),/Tu menú/);
 assert.equal((await page.locator('#mobile-nav [data-view="catalog"]').innerText()).trim(),"Menú");
 const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
 assert.ok(overflow.scroll<=overflow.width+2,"Spanish Owner Center should not overflow on iPhone "+JSON.stringify(overflow));
 await page.locator('#mobile-nav [data-view="catalog"]').click();
 await page.locator('#catalog-list [data-edit="p1"]').click();
 assert.equal(await page.locator("#item-name").inputValue(),"El clásico Golden");
 await page.locator("#item-price").fill("20");
 await page.locator("#item-discount").fill("25");
 await page.locator('#item-form button[type="submit"]').click();
 await page.locator('#mobile-nav [data-view="preview"]').click();
 const first=page.locator("#large-preview .preview-card").first();
 assert.match(await first.innerText(),/El clásico Golden/);
 assert.match(await first.locator("b").innerText(),/15/,"20 with 25 percent discount should show 15");
 await page.screenshot({path:capture});
 page.once("dialog",dialog=>{assert.match(dialog.message(),/¿Restablecer/);dialog.accept();});
 await page.locator("#reset-preview").click();
 assert.match(await page.locator("#large-preview .preview-card").first().locator("b").innerText(),/13/,"Reset restores original price");
 await page.locator('.tle-demo-lang a[lang="en"]').click();
 await page.waitForURL(u=>u.pathname==="/demos/owner-center/"&&u.searchParams.get("lang")==="en",{timeout:15000});
 assert.match(await page.locator("#heading").innerText(),/Your menu/);
 await page.locator('.tle-demo-lang a[lang="es"]').click();
 await page.waitForURL(u=>u.pathname==="/demos/owner-center/"&&u.searchParams.get("lang")==="es",{timeout:15000});
 await page.locator("#breadcrumbs").click();
 await page.waitForURL(u=>u.pathname==="/demos/"&&u.searchParams.get("demo")==="golden-grid"&&u.searchParams.get("lang")==="es",{timeout:15000});
 await page.waitForFunction(()=>document.querySelector("#demo-viewer")?.open===true,null,{timeout:15000});
 await page.locator("#viewer-close").click();
 await page.waitForURL(u=>u.pathname==="/es/website-for-your-business/"&&u.hash==="#inicio",{timeout:15000});
 console.log("PASS: iPhone Spanish sales → Customer → Owner → edit discount/price → preview → reset → EN/ES switch → original Spanish sales page");
}finally{
 await browser.close();
}
