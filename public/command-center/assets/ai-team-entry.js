/* Inject ONLY into the authenticated internal owner sidebar. Never buyers. */
(function(){"use strict";
let item=null;
function sync(){
 const side=document.getElementById("ownerPrivateSection");
 const owner=window.TLEOwnerJessyGateway?.ready?.()===true;
 if(!owner||!side||side.classList.contains("hidden")){
  if(item){item.remove();item=null}return;
 }
 if(item?.isConnected)return;
 const button=document.createElement("button");button.type="button";button.id="ownerAiTeamNav";
 button.className="nav-link";button.setAttribute("aria-label","Open private AI Team");
 const es=(()=>{try{return localStorage.getItem("tle_crm_owner_language")==="es"}catch{return false}})();
 button.textContent=es?"✦  Mi equipo de IA":"✦  My AI Team";
 button.addEventListener("click",()=>{if(window.TLEOwnerJessyGateway?.ready?.())window.location.assign("./ai-team.html")});
 const anchor=side.querySelector("#ownerPagesNav");
 if(anchor)side.insertBefore(button,anchor);else side.append(button);
 item=button;
}
function start(){
 const app=document.getElementById("app");
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:["class"]});
 if(app)new MutationObserver(sync).observe(app,{attributes:true,attributeFilter:["class"]});
 const side=document.getElementById("ownerPrivateSection");
 if(side)new MutationObserver(sync).observe(side,{attributes:true,attributeFilter:["class"]});
 window.addEventListener("tle-crm-ready",sync);document.addEventListener("tle-crm-language",()=>{if(item){item.remove();item=null}sync()});
 window.addEventListener("pageshow",sync);sync();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();