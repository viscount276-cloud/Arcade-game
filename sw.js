const CACHE = 'arcade-cache-v1';
const ASSETS = [
  '.', 'index.html','style.css','hub.js','sw-register.js','manifest.json',
  'lib/idb-keyval.min.js',
  'creator/index.html','creator/creator.js','creator/creator.css',
  'games/slot/index.html','games/slot/slot.js','games/slot/slot.css',
  'games/snake/index.html','games/snake/snake.js','games/snake/snake.css',
  'games/blackjack/index.html','games/blackjack/blackjack.js','games/blackjack/blackjack.css'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e=>{ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(fetchRes=>{caches.open(CACHE).then(c=>c.put(e.request, fetchRes.clone()));return fetchRes}).catch(()=>caches.match('index.html'))));
});
