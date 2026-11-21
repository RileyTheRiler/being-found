/* Generated at build time. Offline-first shell with network-first navigation. */
const CACHE='bf-offline-__VERSION__-__BUILD__';
const ASSETS=__ASSETS__;
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(async cache=>{
   for(const asset of ASSETS) {
     const response=await fetch(asset,{cache:'reload'});
     if(!response.ok)throw Error('Offline precache failed: '+asset);
     await cache.put(asset,response);
   }
 }));
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
   const keys=await caches.keys();
   await Promise.all(keys.filter(k=>k.startsWith('bf-offline-')&&k!==CACHE).map(k=>caches.delete(k)));
   await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 const url=new URL(req.url);
 const key=url.pathname==='/'?'/index.html':url.pathname;
 if(req.mode==='navigate'){
   event.respondWith(fetch(req).catch(async()=>await caches.match('/index.html')||Response.error()));
   return;
 }
 event.respondWith(caches.match(key).then(hit=>hit||fetch(req)));
});