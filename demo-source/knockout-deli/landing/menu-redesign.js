/* Knockout Deli digital-menu enhancements. No orders are submitted. */
(() => {
  'use strict';
  const input=document.getElementById('menu-search');
  const grid=document.getElementById('menu-grid');
  const catalogEs=/* KNOCKOUT_ES_PRODUCT_MAP */ {};
  if(!input||!grid)return;
  const header=document.querySelector('#site-header .nav-actions');
  const windowBag=document.getElementById('window-sticky-button');
  const existingCount=document.getElementById('window-sticky-count');
  const prefersLessMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  // Reuse the one and only cart/dialog owned by window-order.js, with its
  // existing item quantities and translations. Never create a second bag.
  const headerBag=document.createElement('button');
  headerBag.type='button';
  headerBag.id='knockout-header-cart';
  headerBag.className='km-header-cart';
  headerBag.setAttribute('aria-haspopup','dialog');
  headerBag.innerHTML=`<svg class="km-header-cart-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l1 12H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg><span class="km-cart-count" id="km-cart-count" aria-hidden="true">0</span>`;
  header?.insertBefore(headerBag,header.querySelector('.language-toggle'));
  const countBadge=headerBag.querySelector('#km-cart-count');
  const localizedLabel=(count)=>{
    const es=document.documentElement.lang==='es';
    headerBag.setAttribute('aria-label',es?`Ver bolsa, ${count} productos`:`View bag, ${count} items`);
    headerBag.title=es?'Ver bolsa':'View bag';
  };
  const syncCount=()=>{
    const next=(existingCount?.textContent||'0').trim();
    countBadge.textContent=next;
    countBadge.classList.toggle('km-has-items',Number(next)>0);
    localizedLabel(next);
  };
  syncCount();
  if(existingCount)new MutationObserver(syncCount).observe(existingCount,{childList:true,characterData:true,subtree:true});
  headerBag.addEventListener('click',()=>{if(windowBag)windowBag.click();});
  const pickupAction=document.getElementById('km-pickup-action');
  pickupAction?.addEventListener('click',()=>{
    grid.scrollIntoView({behavior:prefersLessMotion.matches?'auto':'smooth',block:'start'});
  });
  const filterBySearch=()=>{
    const needle=input.value.trim().toLocaleLowerCase();
    grid.querySelectorAll('.menu-card').forEach(card=>{
      const haystack=(card.textContent||'').toLocaleLowerCase();
      card.hidden=Boolean(needle && !haystack.includes(needle));
    });
  };
  input.addEventListener('input',filterBySearch);
  new MutationObserver(filterBySearch).observe(grid,{childList:true});
  document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',filterBySearch));

  // A visible-text safety net for content injected by the original menu and
  // checkout templates. The generated catalog also supplies local translations,
  // and this sync handles switching language with the cart already open.
  const toSpanish=new Map(),toEnglish=new Map();
  for(const item of Object.values(catalogEs)){
    for(const [en,es] of [[item.name,item.nameEs],[item.description,item.descriptionEs],[item.category,item.categoryEs]]){
      if(en&&es&&en!==es){toSpanish.set(en,es);toEnglish.set(es,en);}
    }
  }
  const extraPairs=[
    ['02 · TOPPINGS','02 · OPCIONES'],
    ['Toppings · optional','Cambios · opcional'],
    ['TAKE HOME','PARA LLEVAR'],
    ['MAIN EVENT','ESPECIALES'],
    ['BREAKFAST','DESAYUNOS'],
    ['RINGSIDE FAVORITES','OTROS FAVORITOS'],
    ['BEVERAGES','BEBIDAS'],
    ['ALL ITEMS','TODOS'],
    ['PICKUP OR DELIVERY','RECOGIDA O ENTREGA']
  ];
  for(const [en,es] of extraPairs){toSpanish.set(en,es);toEnglish.set(es,en);}
  function localizeRenderedText(){
    const dictionary=document.documentElement.lang==='es'?toSpanish:toEnglish;
    for(const root of [grid,document.getElementById('product-dialog'),document.getElementById('window-cart-dialog')]){
      if(!root)continue;
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      let node;
      while((node=walker.nextNode())){
        if(!node.parentElement||node.parentElement.closest('script,style,textarea,option'))continue;
        const existing=node.nodeValue||'';
        const current=existing.trim();
        const translated=dictionary.get(current);
        if(translated&&translated!==current){
          node.nodeValue=existing.replace(current,translated);
        }
      }
    }
    const header=document.querySelector('.km-order-progress strong');
    if(header){
      const es=document.documentElement.lang==='es';
      if(header.textContent.trim()=== (es?'02 · TOPPINGS':'02 · OPCIONES'))
        header.textContent=es?'02 · OPCIONES':'02 · TOPPINGS';
    }
  }
  let localeSyncQueued=false;
  const scheduleMenuLocaleSync=()=>{
    if(localeSyncQueued)return;
    localeSyncQueued=true;
    queueMicrotask(()=>{localeSyncQueued=false;localizeRenderedText();filterBySearch();});
  };
  for(const node of [grid,document.getElementById('product-dialog'),document.getElementById('window-cart-dialog')]){
    if(node)new MutationObserver(scheduleMenuLocaleSync).observe(node,{subtree:true,childList:true});
  }

  const translate=()=>{
    const es=document.documentElement.lang==='es';
    const back=document.querySelector('.km-header-back-label');
    if(back)back.textContent=es?'VOLVER':'BACK';
    const banner=document.querySelector('.km-banner');
    if(banner){
      const locationLabel=banner.querySelector('.km-eyebrow');
      if(locationLabel)locationLabel.textContent=es?'FOOD TRUCK · SUR DE FLORIDA':'SOUTH FLORIDA · FOOD TRUCK';
    }
    if(banner){banner.querySelector('h1').innerHTML=es?'DELI DE NUEVA YORK.<br><em>SOBRE RUEDAS.</em>':'NEW YORK DELI.<br><em>ON WHEELS.</em>';
      banner.querySelector('p:last-child').textContent=es?'Explora la comida y prepara tu lista para pedir en el truck. Es una demostración; no se envían pedidos.':'Browse the food, build a pickup list and check the options at the truck. Ordering here is a concept preview.';
    }
    input.placeholder=es?'Buscar sándwiches, desayunos y favoritos...':'Search sandwiches, breakfast, favorites...';
    const label=document.querySelector('.km-search label');if(label)label.textContent=es?'BUSCAR EN EL MENÚ':'SEARCH MENU';
    syncCount();
    scheduleMenuLocaleSync();
  };
  new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  // A deliberate 1.2-second arc from the tapped + to the bag. The existing
  // window-order listener still owns adding quantities and showing the toast.
  // This never opens the bag or changes cart state by itself.
  function flyToCart(source){
    if(prefersLessMotion.matches||!headerBag.isConnected)return;
    const from=source.getBoundingClientRect();
    const to=headerBag.getBoundingClientRect();
    if(!from.width||!to.width)return;
    const startX=from.left+from.width/2,startY=from.top+from.height/2;
    const endX=to.left+to.width/2,endY=to.top+to.height/2;
    const deltaX=endX-startX,deltaY=endY-startY;
    const curve=Math.max(65,Math.min(185,Math.abs(deltaY)*.22));
    const productImage=source.closest('.menu-card')?.querySelector('.menu-card-visual img')||document.querySelector('#product-dialog .dialog-photo');
    const flying=document.createElement('span');
    flying.className='km-cart-flight';
    flying.setAttribute('aria-hidden','true');
    flying.style.left=`${startX-23}px`;
    flying.style.top=`${startY-23}px`;
    if(productImage){const img=document.createElement('img');img.src=productImage.currentSrc||productImage.src;img.alt='';flying.appendChild(img);}else{flying.textContent='+1';}
    document.body.appendChild(flying);
    const motion=flying.animate([
      {transform:'translate(0,0) scale(1)',opacity:1,offset:0},
      {transform:`translate(${deltaX*.18}px,${deltaY*.18-curve*.70}px) scale(.96)`,opacity:1,offset:.25},
      {transform:`translate(${deltaX*.53}px,${deltaY*.53-curve}px) scale(.78)`,opacity:1,offset:.56},
      {transform:`translate(${deltaX*.86}px,${deltaY*.86-curve*.36}px) scale(.50)`,opacity:.96,offset:.83},
      {transform:`translate(${deltaX}px,${deltaY}px) scale(.18)`,opacity:0,offset:1}
    ],{duration:1200,easing:'cubic-bezier(.25,.68,.22,1)',fill:'forwards'});
    const settle=()=>{
      flying.remove();
      headerBag.classList.remove('km-cart-land');
      void headerBag.offsetWidth;
      headerBag.classList.add('km-cart-land');
      window.setTimeout(()=>headerBag.classList.remove('km-cart-land'),450);
    };
    motion.finished.then(settle,()=>flying.remove());
  }
  document.addEventListener('click',event=>{
    const add=event.target.closest('[data-add-item]');
    if(add&&!(add instanceof HTMLButtonElement && add.disabled))flyToCart(add);
  },true);
  translate();filterBySearch();
})();
