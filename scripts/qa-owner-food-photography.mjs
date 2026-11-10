/* The Launch Era — food photograph contract for existing public demo menus.
   Never replace custom user-uploaded demo images or real customer content. */
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {Script,createContext} from "node:vm";

const owner=readFileSync("public/demos/owner-center/index.html","utf8");
const original=readFileSync("demo-source/la-vie-in-pink/src/App.tsx","utf8");
const a=owner.indexOf("const themes={");
const b=owner.indexOf("};",a)+2;
assert.ok(a>0&&b>a,"Owner Center theme definitions must exist");
const themeScript=owner.slice(a,b);
const ctx={};
createContext(ctx);
const themes=new Script(themeScript+";themes;").runInContext(ctx);
const foodBrands=Object.entries(themes).filter(([,v])=>v.kind==="menu");
assert.ok(foodBrands.length>0,"At least one restaurant/cafe menu must retain food photography");
for(const [slug,config] of foodBrands){
 const urls=config.items.map(item=>item[5]);
 assert.ok(urls.every(u=>typeof u==="string"&&u.length>0),"Food cards must have a product image; missing in "+slug);
 assert.ok(urls.every(u=>u!==config.hero),"Product photos must not be the brand storefront hero: "+slug);
 assert.equal(new Set(urls).size,urls.length,"Different foods need distinct photos: "+slug);
 for(const url of urls){
  if(url.startsWith("/"))assert.ok(existsSync("public"+url),"Product image not present on GitHub Pages: "+slug+" "+url);
  else assert.match(url,/^https:\/\/thelaunchera\.github\.io\/demo-booking-landing-\//,"Only approved demo-owned external photos: "+slug);
 }
}
const la=themes["la-vie-in-pink"];
const legacyDefaultPhotos=[
 "/demos/la-vie-in-pink/resources/8572492e-4032-4e82-a5d3-7e087ec38613.png",
 "/demos/la-vie-in-pink/resources/3674f67a-abe7-4116-b01c-19afb41ae3d5.png",
 "/demos/la-vie-in-pink/resources/28efa0a2-eefe-40b3-9398-b25bb8e0532a.png"
];
assert.ok(la.items.length>=legacyDefaultPhotos.length,'Expanded La Vie menu must keep its original photo coverage');
assert.ok(la.items.every(item=>item[5].startsWith('/demos/la-vie-in-pink/photos/')),'Current La Vie menu must use its own distinct approved campaign photographs');
assert.equal(new Set(la.items.map(item=>item[5])).size,la.items.length,'All La Vie menu items require unique current photos');
assert.match(original,/croissant:\s*'\/demos\/la-vie-in-pink\/resources\/8572492e-4032-4e82-a5d3-7e087ec38613\.png'/);
assert.match(original,/breakfastHero:\s*'\/demos\/la-vie-in-pink\/resources\/3674f67a-abe7-4116-b01c-19afb41ae3d5\.png'/);
assert.match(original,/breakfast:\s*'\/demos\/la-vie-in-pink\/resources\/28efa0a2-eefe-40b3-9398-b25bb8e0532a\.png'/);
assert.match(owner,/const restoreDefaultProductPhotos=saved=>/);
const restoreStart=owner.indexOf("const restoreDefaultProductPhotos=saved=>");
const restoreEnd=owner.indexOf("const load=()=>",restoreStart);
const repairSource=owner.slice(restoreStart,restoreEnd);
const migration=new Script('const current="la-vie-in-pink";'+themeScript+";"+repairSource+";restoreDefaultProductPhotos;").runInNewContext({});
const old=[
 {id:"p1",name:"Butter Croissant",price:7.5,discount:10,category:"Pâtisserie",image:"",available:true},
 {id:"p2",name:"Café Crème",price:5,discount:10,category:"Coffee",image:la.hero,available:false},
 {id:"p3",name:"Weekend Brunch",price:22,discount:0,category:"Breakfast",image:"",available:true},
 {id:"custom-p4",name:"New item",price:25,discount:0,category:"Breakfast",image:"",available:true}
];
const migrated=migration(old);
assert.deepEqual(Array.from(migrated.slice(0,3),v=>v.image),legacyDefaultPhotos,"Existing browser-only defaults must retain their original safe three-photo migration");
assert.equal(migrated[0].price,7.5,"Migrating the images must not change custom prices");
assert.equal(migrated[0].discount,10,"Migrating the images must not change discounts");
assert.equal(migrated[1].available,false,"Migrating must preserve availability");
assert.equal(migrated[3].image,"","Custom added item must remain untouched");
const preserved=migration([{...old[0],image:"/demos/la-vie-in-pink/resources/3ab35897-f8f3-4dcb-bc98-3ed74cc6aa16.png"}]);
assert.equal(preserved[0].image,"/demos/la-vie-in-pink/resources/3ab35897-f8f3-4dcb-bc98-3ed74cc6aa16.png","Keep custom image selection");
console.log(`PASS: ${foodBrands.length} menus with unique per-product photos; La Vie ${la.items.length} current images and non-destructive three-photo legacy browser migration.`);
