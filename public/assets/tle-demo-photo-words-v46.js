/* v46 · Human microcopy on every existing service photograph.
 * Public fictional sample only. Do not alter photo sources, routes, prices,
 * bookings, testimonials, personalized clients or real customer data. */
(()=>{"use strict";
const query=new URLSearchParams(location.search);
if(!/\/lead-private-preview\.html$/.test(location.pathname)||query.has("key")||query.get("owner_preview")==="1")return;
const es=query.get("lang")==="es";
const lines=es?{
  home:[
   ["Tu hogar, más",["fresco","cómodo","tranquilo"]],
   ["Todo vuelve a sentirse",["limpio","fresco","renovado"]],
   ["Empieza con",["calma","orden","frescura"]]
  ],
  business:[
   ["Trabaja con más",["calma","orden","claridad"]],
   ["Listo para",["abrir","recibir","brillar"]],
   ["Un espacio para",["cuidar","recibir","confiar"]],
   ["Se nota en cada",["paso","detalle","rincón"]]
  ]
}:{
  home:[
   ["Home feels",["fresh","calm","yours"]],
   ["A reset that feels",["fresh","easy","good"]],
   ["Start with",["calm","a clean slate","confidence"]]
  ],
  business:[
   ["Room to",["focus","work","grow"]],
   ["Ready to",["welcome","open","shine"]],
   ["Care in every",["corner","detail","room"]],
   ["You'll notice every",["step","detail","corner"]]
  ]
};
function createSlogan(prefix,words){
 const slogan=document.createElement("span");
 slogan.className="tle-v46-photo-words";
 // Only the first word contributes to assistive button names; hidden
 // alternatives are a purely visual animation.
 const pre=document.createElement("span");
 pre.className="tle-v46-static";
 pre.textContent=prefix+" ";
 const grid=document.createElement("span");
 grid.className="tle-v46-rotate";
 for(let i=0;i<3;i++){
  const word=document.createElement("span");
  word.className="tle-v46-word";
  word.textContent=words[i];
  word.style.setProperty("--tle-v46-delay",i*2+"s");
  if(i>0)word.setAttribute("aria-hidden","true");
  grid.append(word);
 }
 slogan.append(pre,grid);
 return slogan;
}
function install(){
 const root=document.documentElement;
 if(!root.classList.contains("demo-editorial")||!root.classList.contains("tle-demo-v45"))return false;
 if(root.classList.contains("tle-v46-photo-words-ready"))return true;
 const lists=[
  {list:document.getElementById("residentialServiceList"),content:lines.home},
  {list:document.getElementById("commercialServiceList"),content:lines.business}
 ];
 if(lists.some(x=>!x.list||x.list.querySelectorAll(":scope > button.service.tle-service-has-photo-v21").length<x.content.length))return false;
 for(const {list,content} of lists){
  const buttons=[...list.querySelectorAll(":scope > button.service.tle-service-has-photo-v21")];
  for(const [i,[prefix,words]] of content.entries()){
   const button=buttons[i],photo=button.querySelector(".tle-service-photo-v21 img");
   if(!photo||button.querySelector(".tle-v46-photo-words"))continue;
   const slogan=createSlogan(prefix,words);
   button.append(slogan);
  }
 }
 root.classList.add("tle-demo-v46","tle-v46-photo-words-ready");
 return true;
}
if(!install()){
 const observer=new MutationObserver(()=>{if(install())observer.disconnect();});
 observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
 window.addEventListener("load",()=>{if(install())observer.disconnect()},{once:true});
}
})();
