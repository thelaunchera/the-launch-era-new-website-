/* Menu route enhancement only. Filter text on existing product cards; never submits orders. */
(() => {
  'use strict';
  const input=document.getElementById('menu-search');
  const grid=document.getElementById('menu-grid');
  if(!input||!grid)return;
  const filterBySearch=()=>{
    const needle=input.value.trim().toLocaleLowerCase();
    grid.querySelectorAll('.menu-card').forEach(card=>{
      // Preserve the original category filter; this only narrows visible results.
      const haystack=(card.textContent||'').toLocaleLowerCase();
      card.hidden=Boolean(needle && !haystack.includes(needle));
    });
  };
  input.addEventListener('input',filterBySearch);
  new MutationObserver(filterBySearch).observe(grid,{childList:true});
  document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',filterBySearch));
  const translate=()=>{
    const es=document.documentElement.lang==='es';
    const banner=document.querySelector('.km-banner');
    if(banner){banner.querySelector('h1').innerHTML=es?'DELI DE NUEVA YORK.<br><em>SOBRE RUEDAS.</em>':'NEW YORK DELI.<br><em>ON WHEELS.</em>';
      banner.querySelector('p:last-child').textContent=es?'Explora la comida y prepara tu lista para pedir en el truck. Es una demostración; no se envían pedidos.':'Browse the food, build a pickup list and check the options at the truck. Ordering here is a concept preview.';
    }
    input.placeholder=es?'Buscar sándwiches, desayunos y favoritos...':'Search sandwiches, breakfast, favorites...';
    const label=document.querySelector('.km-search label');if(label)label.textContent=es?'BUSCAR EN EL MENÚ':'SEARCH MENU';
  };
  new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  translate();filterBySearch();
})();
