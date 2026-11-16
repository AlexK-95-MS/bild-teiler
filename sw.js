/* Legt die App im Zwischenspeicher ab, damit sie auch ohne Internet startet. Neue Versionen werden beim nächsten Start geholt. */
var CACHE = 'bild-teiler-v1';
var SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(function(cache){
    return cache.match(req, { ignoreSearch: true }).then(function(hit){
      var net = fetch(req).then(function(res){
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(function(){ return hit || (req.mode === 'navigate' ? cache.match('index.html') : undefined); });
      return hit || net;
    });
  }));
});
