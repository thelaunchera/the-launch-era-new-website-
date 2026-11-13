import fs from 'node:fs';
import path from 'node:path';

/** Menu-only enhancement applied after the legacy demo is unpacked and the story homepage is built. */
export function refreshMenu(destination, source = 'demo-source/knockout-deli/landing') {
  const catalog = JSON.parse(fs.readFileSync(path.join(source, 'menu-catalog.json'), 'utf8'));
  if(catalog.length < 20 || new Set(catalog.map(i=>i.id)).size!==catalog.length)throw Error('Menu catalog incomplete or contains duplicate IDs');
  const withPhoto=catalog.filter(i=>i.image).map(i=>i.image);
  if(withPhoto.length>10 || withPhoto.length!==new Set(withPhoto).size)throw Error('Menu must show only unique featured food photos');
  if(catalog.some(i => /(?:post|instagram)/i.test(i.image||'')))throw Error('Social-media images cannot appear in the menu');
  if(!catalog.every(item=>item.nameEs && item.descriptionEs && item.categoryEs))
    throw Error('All Knockout products must include the Spanish translations');
  if(!catalog.every(i=>['Main Event','Breakfast','Ringside Favorites','Take Home','Beverages'].includes(i.category)))throw Error('Unexpected menu category');

  const appPath=path.join(destination,'app.js');
  let app=fs.readFileSync(appPath,'utf8');
  const catalogPattern=/menu:\s*\[[\s\S]*?\],\s*events:\s*\[\]/;
  if(!catalogPattern.test(app))throw Error('Menu data anchor changed, refusing unsafe content replacement');
  app=app.replace(catalogPattern,`menu: ${JSON.stringify(catalog,null,4)},\n    events: []`);
  // The existing app.js owns buttons and product detail dialogs; keep its listeners and pricing logic.
  const cardToken='class="menu-card" data-menu-id=';
  if(!app.includes(cardToken))throw Error('Menu card template changed');
  app=app.replace(cardToken,'class="menu-card ${imgIsSafe(item.image) ? \'with-photo\' : \'text-only\'}" data-menu-id=');
  // The bilingual switch must keep the short menu heading and new category labels.
  let langIndex=0;
  app=app.replace(/menuTitle:'[^']*'/g,()=>`menuTitle:'${langIndex++===0?'OUR MENU':'NUESTRO MENÚ'}'`);
  if(langIndex!==2)throw Error('Bilingual menu heading missing');
  let allIndex=0;
  app=app.replace(/filterAll:'[^']*'/g,()=>`filterAll:'${allIndex++===0?'ALL ITEMS':'TODOS'}'`);
  let ringsideIndex=0;
  app=app.replace(/filterRingside:'[^']*'/g,()=>{
    const isEnglish=ringsideIndex++===0;
    return `filterRingside:'${isEnglish?'RINGSIDE FAVORITES':'OTROS FAVORITOS'}',filterTakeHome:'${isEnglish?'TAKE HOME':'PARA LLEVAR'}',filterBeverages:'${isEnglish?'BEVERAGES':'BEBIDAS'}'`;
  });
  if(ringsideIndex!==2)throw Error('Language categories missing');
  fs.writeFileSync(appPath,app);

  const file=path.join(destination,'menu.html');
  let html=fs.readFileSync(file,'utf8');
  if(!html.includes('id="menu-grid"')||!html.includes('id="menu-filters"'))throw Error('Menu DOM anchor missing');
  if(!html.includes('menu-redesign.css'))html=html.replace('</head>','  <link rel="stylesheet" href="./menu-redesign.css?v=20261113-spanish-menu-v7" />\n  <script src="./menu-redesign.js?v=20261113-spanish-menu-v7" defer></script>\n</head>');
  // A dedicated BACK link belongs to the sticky header, not inside the logo link.
  if(!html.includes('km-header-back')){
    const brandAnchor=/(<a class="brand"[^>]*>[\s\S]*?<\/a>)/;
    if(!brandAnchor.test(html))throw Error('Knockout header brand link missing');
    html=html.replace(brandAnchor,'$1<a class="km-header-back" href="./index.html" aria-label="Back to Knockout Deli website"><svg aria-hidden="true" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 18-6-6 6-6"/></svg><span class="km-header-back-label">BACK</span></a>');
  }
  const banner=`<section class="km-banner" aria-label="Knockout Deli menu introduction"><picture class="km-banner-image"><img class="km-banner-photo" src="./assets/knockout-menu-food-poster-20261113.webp" width="1672" height="941" alt="Knockout Deli: New York deli on wheels poster with pastrami, cheesesteak, breakfast sandwich, hot dog, knish, fries and sides" decoding="async" fetchpriority="high" /></picture><div class="km-banner-inner"><p class="km-eyebrow">SOUTH FLORIDA · FOOD TRUCK</p><h1>NEW YORK DELI.<br><em>ON WHEELS.</em></h1><p>Browse the food, build a pickup list and check the options at the truck. Ordering here is a concept preview.</p></div></section>`;
  if(!html.includes('class="km-banner"'))html=html.replace('<main id="top">',`<main id="top">\n    ${banner}`);
  const h2Pattern=/(<h2 id="menu-heading"[^>]*>)[\s\S]*?(<\/h2>)/;
  if(!h2Pattern.test(html))throw Error('Menu heading changed');
  html=html.replace(h2Pattern,'$1OUR MENU$2');
  // Add Take Home/Beverages only once; these remain hooked up to the original filter logic.
  const filterBlock=/(<div class="menu-filters"[\s\S]*?)(<\/div>)/;
  if(!filterBlock.test(html))throw Error('Menu filters missing');
  html=html.replace(filterBlock,(all,opening,closing)=>{
    let content=opening.replace(/(<button[^>]*data-filter="Take Home"[^>]*)(>)/, (button,head,end)=>head.includes('data-i18n=')?button:`${head} data-i18n="filterTakeHome"${end}`);
    if(!content.includes('data-filter="Beverages"'))content+='\n        <button type="button" class="filter" data-filter="Beverages" aria-pressed="false" data-i18n="filterBeverages">BEVERAGES</button>\n';
    return content+closing;
  });
  if(!html.includes('id="menu-search"'))html=html.replace('<div class="menu-filters"','<div class="km-search"><label for="menu-search">SEARCH MENU</label><input type="search" id="menu-search" placeholder="Search sandwiches, breakfast, favorites..." autocomplete="off" /></div>\n      <div class="menu-filters"');
  fs.writeFileSync(file,html);
  fs.copyFileSync(path.join(source,'menu-redesign.css'),path.join(destination,'menu-redesign.css'));
  // Embed the approved bilingual menu data directly in the frontend script so
  // mobile file previews and offline demos do not depend on a fetch request.
  const menuLocales=Object.fromEntries(catalog.map(item=>[item.id,{
    name:item.name,nameEs:item.nameEs,description:item.description,
    descriptionEs:item.descriptionEs,category:item.category,categoryEs:item.categoryEs
  }]));
  const localePlaceholder='/* KNOCKOUT_ES_PRODUCT_MAP */ {}';
  const localeSource=fs.readFileSync(path.join(source,'menu-redesign.js'),'utf8');
  if(!localeSource.includes(localePlaceholder))throw Error('Menu locale script insertion point missing');
  fs.writeFileSync(path.join(destination,'menu-redesign.js'),
    localeSource.replace(localePlaceholder,JSON.stringify(menuLocales)));
  for(const name of ['knockout-fries-event.webp','knockout-menu-hero-event.webp','knockout-menu-knockout.webp','knockout-menu-tko.webp','knockout-menu-heavy-weight.webp','knockout-menu-pound-for-pound.webp','knockout-menu-round-knish.webp','knockout-menu-hero-drive-07.png','knockout-menu-food-poster-20261113.webp','knockout-menu-food-collage-20261113.webp','knockout-menu-food-only-tablet-desktop-20261113.webp'])fs.copyFileSync(path.join(source,'assets',name),path.join(destination,'assets',name));
  console.log('Knockout Deli: '+catalog.length+' real-menu items, '+withPhoto.length+' unique featured photos, separate editorial digital menu');
}

// CLI supported for isolated QA.
if(process.argv[1] && path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname))refreshMenu(path.resolve(process.argv[2]||'.output/public/demos/knockout-deli'),path.resolve(process.argv[3]||'demo-source/knockout-deli/landing'));
