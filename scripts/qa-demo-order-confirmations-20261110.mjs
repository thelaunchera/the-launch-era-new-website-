// End-to-end sample-order receipts: local DOM only, no payment or customer emails.
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
const origin=(process.env.QA_URL||'http://127.0.0.1:4196').replace(/\/$/,'');
const scenarios=[
 ['freska',async page=>{
   await page.locator('[data-add="pink"]').first().click();
   await page.locator('[data-bag-open]').first().click();
   await page.locator('#checkout').click();
   assert.match(await page.locator('#bag-title').innerText(),/Demo order complete/i);
   assert.match(await page.locator('.demo-order-confirmation').innerText(),/Pink Crush/);
   assert.equal((await page.locator('#subtotal').innerText()).trim(),'$5.50');
   assert.equal((await page.locator('#bag-count').innerText()).trim(),'0');
   await page.locator('[data-bag-close]').click();
   await page.locator('[data-bag-open]').first().click();
   assert.match(await page.locator('#bag-title').innerText(),/Demo order complete/i);
 }],
 ['sneekiefs',async page=>{
   await page.locator('[data-pid="canyon-classic"][data-size="9"]').click();
   await page.locator('[data-add="canyon-classic"]').click();
   await page.locator('#bagOpen').click();
   await page.locator('#previewOrder').click();
   await page.locator('#completeDemoOrder').click();
   const receipt=await page.locator('#bagItems').innerText();
   assert.match(receipt,/DEMO ORDER COMPLETE/i);
   assert.match(receipt,/Canyon Classic/);
   assert.match(receipt,/128\.00/);
   assert.match(receipt,/no real order was created/i);
   assert.equal((await page.locator('#bagCount').innerText()).trim(),'0');
 }],
 ['casa-brownie',async page=>{
   await page.locator('.flavor[data-flavor="clasico"]').first().click();
   await page.locator('.modal-primary').filter({hasText:'Añadir al carrito de muestra'}).click();
   await page.getByRole('button',{name:'Completar pedido de prueba'}).waitFor({state:'visible',timeout:10000});
   await page.getByRole('button',{name:'Completar pedido de prueba'}).click();
   assert.match(await page.locator('#modal-root').innerText(),/Pedido de prueba completado/);
   assert.match(await page.locator('#modal-root').innerText(),/ningún pedido real/);
   assert.equal((await page.locator('#cart-count').innerText()).trim(),'0');
 }],
 ['crumb',async page=>{
   await page.locator('#open-builder').click();
   await page.locator('[data-pack="3"]').click();
   for(let n=0;n<3;n++)await page.locator('#box-dialog [data-add="classic"]').click();
   await page.locator('#preview-button').click();
   await page.locator('.crumb-demo-finish').click();
   const receipt=await page.locator('#preview').innerText();
   assert.match(receipt,/Your demo order is complete/);
   assert.match(receipt,/Classic Chocolate Chip/);
   assert.match(receipt,/no email was sent/);
   assert.equal((await page.locator('#bag-count').innerText()).trim(),'0');
 }]
];
for(const kind of [chromium,webkit]){
 const browser=await kind.launch({headless:true});
 try{
  for(const [slug,verify] of scenarios){
   const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
   const errors=[],writes=[];
   page.on('pageerror',error=>errors.push(String(error)));
   page.on('request',request=>{
    if(request.method()!=='GET'&&/stripe|payment|checkout|order/i.test(request.url()))writes.push(request.url());
   });
   const response=await page.goto(origin+'/demos/'+slug+'/',{waitUntil:'domcontentloaded',timeout:35000});
   assert.equal(response?.status(),200,slug+' must load');
   await verify(page);
   assert.deepEqual(errors,[],slug+' JavaScript errors');
   assert.deepEqual(writes,[],slug+' no checkout network writes');
   console.log('PASS',kind.name(),slug,'sample receipt, iPhone width, no commerce requests');
   await page.close();
  }
 }finally{await browser.close();}
}
