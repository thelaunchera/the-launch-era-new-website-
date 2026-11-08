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
 assert.match(await page.locator("#heading").innerText(),/Tu colección de waffles/);
 assert.match(await page.locator("#subheading").innerText(),/COLECCIÓN DE WAFFLES/);
 assert.match(await page.locator("#breadcrumbs").innerText(),/VOLVER AL DEMO/);
 assert.equal((await page.locator('#mobile-nav [data-view="catalog"]').innerText()).trim(),"Productos");
 const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
 assert.ok(overflow.scroll<=overflow.width+2,"Spanish Owner Center should not overflow on iPhone "+JSON.stringify(overflow));
 await page.screenshot({path:"qa-screenshots/demo-gallery/owner-spanish-dashboard-iphone.png",fullPage:false});
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
 await page.locator("#toast.show").waitFor({state:"detached",timeout:6000});
 await page.screenshot({path:capture});
 page.once("dialog",dialog=>{assert.match(dialog.message(),/¿Restablecer/);dialog.accept();});
 await page.locator("#reset-preview").click();
 assert.match(await page.locator("#large-preview .preview-card").first().locator("b").innerText(),/13/,"Reset restores original price");
 await page.locator('.tle-demo-lang a[lang="en"]').click();
 await page.waitForURL(u=>u.pathname==="/demos/owner-center/"&&u.searchParams.get("lang")==="en",{timeout:15000});
 assert.match(await page.locator("#heading").innerText(),/Your waffle collection/);
 await page.locator('.tle-demo-lang a[lang="es"]').click();
 await page.waitForURL(u=>u.pathname==="/demos/owner-center/"&&u.searchParams.get("lang")==="es",{timeout:15000});
 await page.locator("#breadcrumbs").click();
 await page.waitForURL(u=>u.pathname==="/demos/"&&u.searchParams.get("demo")==="golden-grid"&&u.searchParams.get("lang")==="es",{timeout:15000});
 await page.waitForFunction(()=>document.querySelector("#demo-viewer")?.open===true,null,{timeout:15000});
 await page.locator("#viewer-close").click();
 await page.waitForURL(u=>u.pathname==="/es/website-for-your-business/"&&u.hash==="#inicio",{timeout:15000});

 // Previously all non-menu brands inherited the residential cleaning cards.
 // Verify the actual rendered iPhone content for the lavender store and peers.
 const cases=[
  ["lavender-edit","Solicitudes","Set de regalo de lavanda",false],
  ["marea-wigs-miami","Citas","Prueba privada de peluca",false],
  ["soluna-yoga","Reservas","Disponibilidad de cupo",false],
  ["ivory-and-bloom","Consultas","Pastel floral",false],
  ["experience-cleaning","Solicitudes","Limpieza residencial estándar",true],
 ];
 for(const [slug,nav,detail,allowsResidential] of cases){
  await page.goto(origin+"/demos/owner-center/?demo="+slug+"&lang=es",{waitUntil:"domcontentloaded",timeout:35000});
  const requestsButton=page.locator('#mobile-nav [data-view="requests"]');
  assert.equal((await requestsButton.innerText()).trim(),nav,"The tab label must match business type: "+slug);
  await requestsButton.click();
  await page.locator("#requests-list .request").first().waitFor({state:"visible"});
  assert.equal(await page.locator("#requests-list .request").count(),3,"Each brand has three simulated cards: "+slug);
  const rendered=await page.locator("#requests-list").innerText();
  assert.ok(rendered.includes(detail),"Expected brand-specific inquiry not present: "+slug);
  if(!allowsResidential)assert.doesNotMatch(rendered,/residencial|residential/i,"Unrelated business must never inherit cleaning requests: "+slug);
  assert.match(rendered,/SIMULADO/,"Every card remains clearly simulated: "+slug);
  const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
  assert.ok(width.scroll<=width.viewport+2,"Brand request cards must not overflow iPhone: "+slug);
  if(slug==="lavender-edit"){
   await page.screenshot({path:"qa-screenshots/demo-gallery/owner-lavender-es-brand-specific-requests.png",fullPage:true});
   await page.locator('.tle-demo-lang a[lang="en"]').click();
   await page.waitForURL(u=>u.searchParams.get("demo")==="lavender-edit"&&u.searchParams.get("lang")==="en");
   await page.locator('#mobile-nav [data-view="requests"]').click();
   const english=await page.locator("#requests-list").innerText();
   assert.match(english,/Lavender gift set/,"The correct gift-store inquiry must render in English");
   assert.doesNotMatch(english,/Residential|Home Cleaning/i);
  }
 }

 // Cross-brand integrity: original industries must determine UI labels and editor defaults.
 const brandCases=[
  ["ivory-and-bloom","Diseños","Tus diseños de pasteles.","Pasteles de boda","COLECCIÓN DE PASTELES"],
  ["crumb","Productos","Tu colección de galletas.","Galletas","LA COLECCIÓN DE GALLETAS"],
  ["casa-brownie","Productos","Tu colección de brownies.","Brownies","LA COLECCIÓN DE BROWNIES"],
  ["lavender-edit","Colección","Tu colección de lavanda.","Regalos","THE LAVENDER EDIT"],
  ["soluna-yoga","Clases","Tus clases de yoga.","Clases","CLASES DE YOGA"],
  ["experience-cleaning","Servicios","Tus servicios de limpieza.","Residencial","SERVICIOS DE LIMPIEZA"],
 ];
 for(const [slug,nav,heading,category,caption] of brandCases){
  await page.goto(origin+"/demos/owner-center/?demo="+slug+"&lang=es",{waitUntil:"domcontentloaded",timeout:35000});
  assert.ok((await page.locator("#heading").innerText()).includes(heading),"Correct business heading: "+slug);
  assert.equal((await page.locator('#mobile-nav [data-view="catalog"]').innerText()).trim(),nav,"Correct catalog tab for "+slug);
  assert.ok((await page.locator("#small-preview .phone-caption").innerText()).includes(caption),"Correct customer context: "+slug);
  await page.locator('#mobile-nav [data-view="catalog"]').click();
  await page.locator('#catalog-view [data-owner-command="add"]').click();
  assert.equal(await page.locator("#item-category").inputValue(),category,"Add-item category is brand-specific: "+slug);
  assert.match(await page.locator("#editor-title").innerText(),/Agregar/,"Editor should remain in Spanish");
  const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
  assert.ok(dims.scroll<=dims.width+2,"Owner business catalog overflows iPhone: "+slug);
 }
 console.log("PASS: six brand-specific Owner Center headings, tabs, previews and sample catalog categories");

 console.log("PASS: iPhone brand-specific request cards for Lavender, Marea, Yoga, Cakes and Cleaning in ES/EN");

 console.log("PASS: iPhone Spanish sales → Customer → Owner → edit discount/price → preview → reset → EN/ES switch → original Spanish sales page");
}finally{
 await browser.close();
}
