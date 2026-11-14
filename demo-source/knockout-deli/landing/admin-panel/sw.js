/* Knockout Admin Panel demo PWA. Static preview shell ONLY, no push or messaging. */
const CACHE="knockout-admin-preview-shell-v1";
const SHELL=["./","./index.html","./app.js","./menu-catalog.json","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("knockout-admin-preview-")&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET"||new URL(req.url).origin!==self.location.origin)return;
 const url=new URL(req.url);
 if(!url.pathname.startsWith(new URL("./",self.registration.scope).pathname))return;
 event.respondWith(fetch(req).then(response=>{
  if(response.ok&&response.type==="basic"){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)));}
  return response;
 }).catch(()=>caches.match(req).then(cached=>cached||Response.error())));
});
