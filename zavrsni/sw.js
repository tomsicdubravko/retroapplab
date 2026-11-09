// Jedan service worker za cijeli PWA "Obračuni" (/zavrsni/): izbornik, Završni račun (gfi/), DOH (doh/), Neprofitne i Financijska dijagnoza (dijagnoza/).
// Kod svake nove verzije bilo kojeg programa promijeni CACHE, da preglednik preuzme nove datoteke.
// Stranice (.html), skripte (.js), stilovi (.css) i novosti (.json) idu "network-first": uz mrežu uvijek sa servera
// (uz provjeru i mimo HTTP predmemorije preglednika), a iz predmemorije samo kad mreže nema. Ikone idu iz predmemorije.
// Nova verzija se aktivira odmah (skipWaiting + clients.claim); stranice se jednom same osvježe (controllerchange u zaglavlje.js i izborniku).
// Lokalno spremljeni podaci korisnika (localStorage, IndexedDB) ovdje se ne diraju.
const CACHE = 'zavrsni-20261109190000';
const PREFIX = 'zavrsni-';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'novosti.json',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-192.png', 'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png', 'icons/favicon-16.png', 'icons/favicon-32.png', 'icons/icon.svg', 'icons/maskable.svg',
  'gfi/', 'gfi/index.html', 'gfi/upute.html',
  'gfi/vendor/pdf.min.js', 'gfi/vendor/pdf.worker.min.js', 'gfi/vendor/xlsx.full.min.js', 'gfi/vendor/supabase.js',
  'gfi/icons/icon-192.png', 'gfi/icons/favicon-32.png', 'gfi/icons/apple-touch-icon.png',
  'doh/', 'doh/index.html',
  'neprofitne.html', 'dijagnoza/', 'dijagnoza/index.html', 'zaglavlje.css', 'zaglavlje.js'
];
self.addEventListener('install', e => {
  // cache: 'reload' – datoteke za rad bez mreže preuzimaju se sa servera, ne iz HTTP predmemorije preglednika
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
// Briše samo vlastite stare predmemorije (zavrsni-…), ne dira predmemorije drugih aplikacija na retroapplab.com.
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const p = u.pathname;
  if (e.request.mode === 'navigate' || p.endsWith('/') || /\.(html|js|css|json|webmanifest)$/.test(p)) {
    // cache: 'no-cache' – preglednik uvijek pita server (ETag), pa nakon objave odmah dobije novu verziju
    e.respondWith(fetch(u.href, { cache: 'no-cache', credentials: 'same-origin' }).then(r => {
      if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true })
      .then(r => r || (e.request.mode === 'navigate' ? caches.match('index.html') : undefined))
      .then(r => r || Response.error())));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
