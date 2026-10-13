/* Jessy owner-only PWA notifications. Other clients never receive owner-only pushes. */
self.addEventListener("push",event=>{
 let data={};try{data=event.data?.json()||{}}catch{data={}};
 const destination=new URL("/command-center/?from=jessy-alert",self.location.origin);
 try{const provided=new URL(String(data.url||""),self.location.origin);if(provided.origin===self.location.origin&&provided.pathname.startsWith("/command-center/"))destination.href=provided.href}catch{}
 const title=String(data.title||"The Launch Era").slice(0,90);
 const body=String(data.body||"New Command Center update").slice(0,200);
 event.waitUntil(self.registration.showNotification(title,{body,tag:String(data.tag||"tle-jessy").slice(0,120),icon:"/assets/brand/tle-mark.svg",badge:"/assets/brand/tle-mark.svg",data:{url:destination.href}}));
});
self.addEventListener("notificationclick",event=>{
 event.notification.close();
 event.waitUntil((async()=>{
  const url=new URL("/command-center/?from=jessy-alert",self.location.origin);
  try{const requested=new URL(event.notification.data?.url||"");if(requested.origin===self.location.origin&&requested.pathname.startsWith("/command-center/"))url.href=requested.href}catch{}
  const pages=await clients.matchAll({type:"window",includeUncontrolled:true});
  const existing=pages.find(page=>{try{return new URL(page.url).origin===self.location.origin&&new URL(page.url).pathname.startsWith("/command-center/")}catch{return false}});
  if(existing){await existing.focus();return}
  await clients.openWindow(url.href);
 })());
});