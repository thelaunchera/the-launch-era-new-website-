/* One shortcut in the existing owner header; no buyer navigation changes. */
(()=>{'use strict';let button;
 function sync(){const owner=window.TLEOwnerJessyGateway?.ready?.()===true;
  if(!owner){button?.remove();button=null;return}
  if(button?.isConnected)return;
  const host=document.querySelector('.premium-header-actions');if(!host)return;
  button=document.createElement('button');button.type='button';button.id='ownerSalesTools';button.className='secondary';
  button.textContent=localStorage.getItem('tle_crm_owner_language')==='es'?'Herramientas de ventas ↗':'Sales tools ↗';
  button.onclick=()=>{if(window.TLEOwnerJessyGateway?.ready?.())location.assign('./sales-tools.html')};host.append(button);
 }
 new MutationObserver(sync).observe(document.body,{attributes:true,subtree:true,attributeFilter:['class']});
 document.addEventListener('tle-crm-language',()=>{button?.remove();button=null;sync()});window.addEventListener('tle-crm-ready',sync);sync();
})();
