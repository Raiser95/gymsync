const CACHE = 'gymsync-v3';
const ASSETS = ['./', './index.html', './app.js', './workouts.js', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.url.includes('api.github.com')) return;
  const sameOrigin = new URL(req.url).origin === self.location.origin;
  const store = res => {
    if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  };
  if (sameOrigin) {
    // Arquivos do app: rede primeiro (pega a ficha nova assim que há internet), cache como fallback offline
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(store).catch(() => caches.match(req).then(c => c || caches.match('./index.html'))));
  } else {
    // CDNs (Tailwind/Chart.js): cache primeiro
    e.respondWith(caches.match(req).then(c => c || fetch(req).then(store)));
  }
});
