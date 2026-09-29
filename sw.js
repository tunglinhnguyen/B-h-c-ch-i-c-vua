const CACHE='chess-kingdom-v2';
const LOCAL=['./','./index.html','./src/style.css','./src/main.js','./manifest.webmanifest','./icons/icon-192.svg','./icons/icon-512.svg'];
const CDN=['https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js','https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll([...LOCAL,...CDN])).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp}).catch(()=>caches.match('./index.html')))));
