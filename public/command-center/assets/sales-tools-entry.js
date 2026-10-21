/* Owner-only Sales tools shortcuts in the existing header and sidebar. */
(()=>{'use strict';let headerButton,sidebarLink;
 function spanish(){try{return localStorage.getItem('tle_crm_owner_language')==='es'}catch{return false}}
 function remove(){headerButton?.remove();sidebarLink?.remove();headerButton=null;sidebarLink=null}
 function sync(){const owner=window.TLEOwnerJessyGateway?.ready?.()===true;
  if(!owner){remove();return}
  const es=spanish();
  if(!headerButton?.isConnected){
   const header=document.querySelector('.premium-header-actions');
   if(header){headerButton=document.createElement('button');headerButton.type='button';headerButton.id='ownerSalesTools';headerButton.className='secondary';
    headerButton.onclick=()=>{if(window.TLEOwnerJessyGateway?.ready?.())location.assign('./sales-tools.html')};header.append(headerButton)}
  }
  if(headerButton?.isConnected)headerButton.textContent=es?'Herramientas de ventas ↗':'Sales tools ↗';
  if(!sidebarLink?.isConnected){
   const sidebar=document.querySelector('#ownerPrivateSection'),before=document.querySelector('#ownerProspectingGroup');
   if(sidebar){sidebarLink=document.createElement('a');sidebarLink.id='ownerSalesToolsNav';sidebarLink.className='nav-link';sidebarLink.href='./sales-tools.html#demos';sidebarLink.style.textDecoration='none';
    sidebarLink.innerHTML='<span aria-hidden="true">◇</span> <span></span>';sidebar.insertBefore(sidebarLink,before?.parentElement===sidebar?before:null)}
  }
  if(sidebarLink?.isConnected){sidebarLink.querySelector('span:last-child').textContent=es?'Herramientas de ventas':'Sales tools';sidebarLink.setAttribute('aria-label',es?'Herramientas de ventas · Demo de Clara':'Sales tools · Clara demo')}
 }
 new MutationObserver(sync).observe(document.body,{attributes:true,subtree:true,attributeFilter:['class']});
 document.addEventListener('tle-crm-language',()=>{remove();sync()});window.addEventListener('tle-crm-ready',sync);sync();
})();
