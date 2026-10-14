import {webkit} from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.QA_URL||'https://thelaunchera.com';
const key='d'.repeat(48);
const fixture={
 business_name:'CB Depot',language:'en',timezone:'America/New_York',currency:'USD',
 quote_policy:'review_unpriced_jobs',auto_confirm_flat:false,addons:[],
 branding:{business_name:'CB Depot',headline:'Professional car detailing, made simple.',description:'Premium auto detailing',service_area:'Example City',reviews:[]},
 services:['Interior Detailing','Exterior Detailing','Deep Interior Cleaning','Paint Protection','Full Detail Package','Custom Auto Detailing Quote'].map((name,i)=>({id:'s'+i,name,mode:'quote',category:'residential',active:true}))
};
const browser=await webkit.launch();
let failures=0;
for(const width of [320,360,375,390,430,768,820]){
 const page=await browser.newPage({viewport:{width,height:900},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 try{
  await page.route('**/functions/v1/**',route=>{
   if(route.request().url().endsWith('/tle-booking-flow-pricing'))return route.fulfill({json:fixture});
   return route.fulfill({json:{slots:[]}});
  });
  await page.goto(base+'/base-booking.html?key='+key+'&lang=en',{waitUntil:'domcontentloaded'});
  await page.locator('body.vehicle-booking').waitFor();
  await page.locator('[data-cb-vehicle="SUV"]').click();
  await page.locator('#cbNext1').click();
  await page.locator('.cb-stage[data-stage="2"]:visible').waitFor();
  const bounds=await page.evaluate(()=>{
   const rect=s=>{const {left,right,width}=document.querySelector(s).getBoundingClientRect();return {left,right,width}};
   return {viewport:innerWidth,container:rect('#cbDateFields'),date:rect('#qdate'),time:rect('#qtime'),wizard:rect('#quote .cb-wizard')};
  });
  for(const name of ['date','time']){
   const box=bounds[name],parent=bounds.container;
   assert.ok(box.width>0&&box.width<=parent.width+1&&box.left>=parent.left-1&&box.right<=parent.right+1,
    'WebKit '+width+'px: '+name+' overflows date container: '+JSON.stringify(bounds));
  }
  assert.ok(bounds.container.right<=bounds.wizard.right+1,'WebKit '+width+'px: date container overflows wizard');
  const monday=new Date();monday.setDate(monday.getDate()+8);
  await page.locator('#qdate').fill(monday.toISOString().slice(0,10));
  await page.locator('#qtime').selectOption('07:30');
  await page.locator('#cbNext2').click();
  assert.equal(await page.locator('.cb-stage[data-stage="3"]').isVisible(),true);
  console.log('PASS CB Depot WebKit/iOS date control '+width+'px');
 }catch(error){failures++;console.error('FAIL CB Depot WebKit/iOS date control '+width+'px:',error.message);}
 finally{await page.close();}
}
await browser.close();
if(failures)process.exitCode=1;
