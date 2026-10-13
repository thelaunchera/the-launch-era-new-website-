import assert from "node:assert/strict";
import {webkit} from "playwright";
const browser=await webkit.launch({headless:true});
const url="https://thelaunchera.com/command-center/ai-team.html";
const tests=[{width:390,height:844,label:"iPhone"},{width:820,height:1180,label:"tablet"},{width:1440,height:900,label:"desktop"}];
try {
 for(const test of tests){
   const page=await browser.newPage({viewport:{width:test.width,height:test.height},storageState:{cookies:[],origins:[]}});
   const errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   const res=await page.goto(url+"?qa=owner-locked-v1",{waitUntil:"domcontentloaded",timeout:45000});
   assert.equal(res?.status(),200,test.label+" route must be live");
   await page.locator("#locked").waitFor({state:"visible",timeout:20000});
   const state=await page.evaluate(()=>{
     const app=document.getElementById("app");
     const locked=document.getElementById("locked");
     return {
       title:document.title,hasLoginBlock:!!locked&&!locked.hidden,
       hasOwnerApp:!!app&&!app.classList.contains("hidden"),
       horizontalOverflow:document.documentElement.scrollWidth>window.innerWidth+3,
       hasBack:!!locked?.querySelector('a[href="./"]'),
       hasLiveTaskData:!!document.querySelector("#tasks .ait-task")
     };
   });
   assert.match(state.title,/AI Team/);
   assert.equal(state.hasOwnerApp,false,"Private AI Team visible without owner authentication");
   assert.equal(state.hasLoginBlock,true,"Owner sign-in restriction is missing");
   assert.equal(state.hasBack,true,"Missing recovery navigation");
   assert.equal(state.horizontalOverflow,false,test.label+" screen overflows horizontally");
   assert.equal(state.hasLiveTaskData,false,"Leaked task data on anonymous page");
   assert.deepEqual(errors,[],"Browser JS error on "+test.label);
   console.log("PASS AI Team Safari",test.label,state);
   await page.close();
 }
} finally {await browser.close();}
