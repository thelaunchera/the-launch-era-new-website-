import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

const read=(p)=>readFileSync(resolve(process.cwd(),p),"utf8");
const app=read("public/guias/app.js");
async function testLanguage(lang) {
  const route=lang==="es"?"/es/guias/":"/guias/";
  const file=lang==="es"?"public/es/guias/index.html":"public/guias/index.html";
  const errors=[];
  const virtualConsole=new VirtualConsole();
  virtualConsole.on("jsdomError",(e)=>errors.push(String(e.message||e)));
  const markup=read(file)
    .replace('<script src="/guias/app.js?v=20261112-guides-1" defer></script>',"")
    .replace("</body>","<script>"+app+"</script></body>");
  let copied=null;
  const dom=new JSDOM(markup,{
    url:"https://thelaunchera.com"+route,
    runScripts:"dangerously",
    pretendToBeVisual:true,
    virtualConsole,
    beforeParse(window){
      Object.defineProperty(window,"isSecureContext",{value:true,configurable:true});
      Object.defineProperty(window.navigator,"clipboard",{value:{writeText:async(value)=>{copied=value;}},configurable:true});
    }
  });
  const {window}=dom,document=window.document;
  assert.equal(errors.length,0,lang+" runtime errors: "+errors.join("; "));
  assert.equal(document.querySelectorAll(".guide").length,10,lang+" initial guide cards");
  const previews=[...document.querySelectorAll(".guide-preview")];
  assert.equal(previews.length,10,lang+" all ten cards explain the lesson");
  assert.ok(previews.every(el=>el.textContent.trim().length>70),lang+" useful learning previews");
  assert.ok(previews.every(el=>!el.textContent.includes("[audience]")&&!el.textContent.includes("[audiencia]")),lang+" previews show readable copy");

  assert.ok(document.getElementById("count").textContent.includes("10"),lang+" total count");
  const search=document.getElementById("search");
  search.value="Higgsfield";search.dispatchEvent(new window.Event("input",{bubbles:true}));
  assert.equal(document.querySelectorAll(".guide").length,1,lang+" search result");
  search.value="no-such-guide";search.dispatchEvent(new window.Event("input",{bubbles:true}));
  assert.equal(document.querySelectorAll(".guide").length,0,lang+" empty state");
  search.value="";search.dispatchEvent(new window.Event("input",{bubbles:true}));
  const filterText=lang==="es"?"Automatización":"Automation";
  const filter=[...document.querySelectorAll(".filter")].find(b=>b.textContent===filterText);
  assert.ok(filter,lang+" filter button exists");
  filter.click();
  const activeFilter=[...document.querySelectorAll(".filter")].find(b=>b.textContent===filterText);
  assert.equal(activeFilter?.getAttribute("aria-pressed"),"true",lang+" filter selected");
  assert.equal(document.querySelectorAll(".guide").length,3,lang+" automation count");
  const guideButton=document.querySelector(".guide .open");guideButton.focus();guideButton.click();
  const modal=document.getElementById("dialog-backdrop");
  assert.equal(modal.hidden,false,lang+" modal open");
  assert.equal(document.querySelectorAll('.lang').length,1,lang+" exactly one language selector");
  assert.equal(document.querySelectorAll('.guide-language').length,0,lang+" no duplicate reader language control");
  const otherLang=lang==='en'?'es':'en';
  assert.ok(document.querySelector('.lang a[hreflang="'+otherLang+'"]').getAttribute('href').includes('guide='),lang+" language switch retains guide");
  assert.ok(document.getElementById("guide-title").textContent.length>8,lang+" title");
  assert.equal(document.querySelectorAll("#guide-detail .guide-section-title").length,3,lang+" clear what/need/how headings");
  assert.ok(document.querySelector("#guide-detail .guide-overview").textContent.length>130,lang+" complete lesson overview");
  assert.ok(document.querySelector("#guide-detail .guide-need").textContent.length>50,lang+" prerequisites displayed");
  assert.ok(document.querySelectorAll("#guide-detail ol li").length>=4,lang+" actionable steps inside guide");

  assert.ok(document.querySelector("#guide-detail pre.prompt").textContent.length>75,lang+" full prompt");
  document.querySelector("#guide-detail .copy").click();
  await new Promise(resolve=>setImmediate(resolve));
  assert.ok(copied?.length>75,lang+" copied actual prompt");
  document.dispatchEvent(new window.KeyboardEvent("keydown",{key:"Escape",bubbles:true}));
  assert.equal(modal.hidden,true,lang+" Escape dismisses");
  assert.equal(document.querySelector('.lang a[hreflang="'+otherLang+'"]').getAttribute('href').includes('guide='),false,lang+" close clears guide from locale links");
  assert.equal(document.activeElement,guideButton,lang+" focus restored");
  assert.equal(errors.length,0,lang+" JS errors: "+errors.join("; "));
  dom.window.close();
  console.log("[TLE GUIDES DOM] "+lang+" 10 cards, search, empty, filter, reader, copy, Escape, focus: OK");
}
await testLanguage("en");
await testLanguage("es");
