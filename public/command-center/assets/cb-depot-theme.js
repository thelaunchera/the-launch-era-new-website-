/* CB Depot only: user-selectable, device-persisted light/dark appearance.
   No CRM data writes, auth changes, network calls or cross-tenant theme leaks. */
(function(){
  "use strict";
  const key="tle_cb_depot_display_theme_v1";
  const attribute="data-cb-depot-theme";
  function stored(){try{return localStorage.getItem(key)==="dark"?"dark":"light"}catch(_){return "light"}}
  let mode=stored();
  document.documentElement.setAttribute(attribute,mode);
  function visible(){return document.body && document.body.classList.contains("cb-depot-buyer")}
  function copy(button){
    if(!button)return;
    const dark=mode==="dark";
    const es=(function(){try{return localStorage.getItem("tle_crm_language")==="es"}catch(_){return false}})();
    const title=es?(dark?"Cambiar a modo claro":"Cambiar a modo oscuro"):(dark?"Switch to light mode":"Switch to dark mode");
    button.setAttribute("aria-label",title);
    button.setAttribute("title",title);
    button.setAttribute("aria-pressed",String(dark));
    const icon=button.querySelector(".cb-theme-icon");
    const label=button.querySelector(".cb-theme-label");
    if(icon)icon.textContent=dark?"☀":"☾";
    if(label)label.textContent=es?(dark?"Modo claro":"Modo oscuro"):(dark?"Light mode":"Dark mode");
  }
  function paint(){
    document.documentElement.setAttribute(attribute,mode);
    document.querySelectorAll(".cb-theme-switch").forEach(copy);
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta&&visible())meta.setAttribute("content",mode==="dark"?"#17232d":"#e9eef1");
  }
  function switchMode(){
    if(!visible())return;
    mode=mode==="dark"?"light":"dark";
    try{localStorage.setItem(key,mode)}catch(_){}
    paint();
  }
  function button(id){
    const b=document.createElement("button");
    b.type="button";b.id=id;b.className="cb-theme-switch";
    b.innerHTML='<span class="cb-theme-icon" aria-hidden="true">☾</span><span class="cb-theme-label">Dark mode</span>';
    b.addEventListener("click",switchMode);
    copy(b);
    return b;
  }
  function mount(){
    const menu=document.getElementById("sidebarUtilityMenu");
    const logout=document.getElementById("sidebarLogout");
    if(menu&&logout&&!document.getElementById("cbThemeSidebar")){
      menu.insertBefore(button("cbThemeSidebar"),logout);
    }
    const mobile=document.querySelector(".premium-mobilebar");
    const newButton=document.getElementById("mobileNew");
    if(mobile&&newButton&&!document.getElementById("cbThemeMobile")){
      mobile.insertBefore(button("cbThemeMobile"),newButton);
    }
    paint();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
  document.addEventListener("tle-crm-language",paint);
  const observer=new MutationObserver(function(){paint()});
  if(document.readyState==="loading")
    document.addEventListener("DOMContentLoaded",function(){observer.observe(document.body,{attributes:true,attributeFilter:["class"]})},{once:true});
  else observer.observe(document.body,{attributes:true,attributeFilter:["class"]});
})();
