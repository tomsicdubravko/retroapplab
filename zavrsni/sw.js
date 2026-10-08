const CACHE='zavrsni-20261008101938';
const FILES=["./", "index.html", "manifest.webmanifest", "vendor/pdf.min.js", "vendor/pdf.worker.min.js", "vendor/xlsx.full.min.js", "vendor/supabase.js", "icons/maskable.svg", "icons/favicon-16.png", "icons/icon-maskable-512.png", "icons/icon-maskable-192.png", "icons/icon-192.png", "icons/apple-touch-icon.png", "icons/favicon-32.png", "icons/icon.svg", "icons/icon-512.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin) return;
  if(e.request.mode==='navigate'||u.pathname.endsWith('/index.html')||u.pathname.endsWith('/')){
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
