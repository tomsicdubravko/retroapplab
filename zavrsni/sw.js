// Jedan service worker za cijeli PWA "Obračuni" (/zavrsni/): izbornik, Završni račun (gfi/) i DOH (doh/).
// Kod svake nove verzije bilo kojeg programa promijeni CACHE, da preglednik preuzme nove datoteke.
const CACHE = 'zavrsni-20261106120000';
const PREFIX = 'zavrsni-';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'novosti.json',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-192.png', 'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png', 'icons/favicon-16.png', 'icons/favicon-32.png', 'icons/icon.svg', 'icons/maskable.svg',
  'gfi/', 'gfi/index.html', 'gfi/upute.html',
  'gfi/vendor/pdf.min.js', 'gfi/vendor/pdf.worker.min.js', 'gfi/vendor/xlsx.full.min.js', 'gfi/vendor/supabase.js',
  'gfi/icons/icon-192.png', 'gfi/icons/favicon-32.png', 'gfi/icons/apple-touch-icon.png',
  'doh/', 'doh/index.html'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
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
  // Stranice i novosti: prvo s interneta, bez interneta zadnja spremljena verzija.
  if (e.request.mode === 'navigate' || u.pathname.endsWith('.html') || u.pathname.endsWith('/') || u.pathname.endsWith('.json')) {
    e.respondWith(fetch(e.request).then(r => {
      if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
