/* Private AI Team workspace navigation. Presentation only: existing owner auth and API stay unchanged. */
const nav=document.getElementById("ait-workspace-nav");
const views=["overview","team","work","results","settings"];
const panels=Object.fromEntries(views.map(k=>[k,document.getElementById("ait-panel-"+k)]));
const buttons=Object.fromEntries(views.map(k=>[k,document.getElementById("ait-tab-"+k)]));
const detail=document.getElementById("ait-panel-overview-detail");
if(detail&&panels.overview){panels.overview.append(detail);detail.hidden=false;}
function showView(key,focus=false){
 if(!views.includes(key))key="overview";
 for(const name of views){
  const active=name===key;
  panels[name].hidden=!active;
  buttons[name].setAttribute("aria-selected",String(active));
  buttons[name].tabIndex=active?0:-1;
 }
 if(focus)buttons[key].focus();
}
for(const key of views){
 buttons[key].addEventListener("click",()=>showView(key));
 buttons[key].addEventListener("keydown",event=>{
  if(!["ArrowRight","ArrowLeft","Home","End"].includes(event.key))return;
  event.preventDefault();
  const index=views.indexOf(key);
  const next=event.key==="Home"?0:event.key==="End"?views.length-1:event.key==="ArrowRight"?(index+1)%views.length:(index+views.length-1)%views.length;
  showView(views[next],true);
 });
}
document.getElementById("new-task-top")?.addEventListener("click",()=>showView("work"));
document.getElementById("scan")?.addEventListener("click",()=>showView("overview"));
showView("overview");
