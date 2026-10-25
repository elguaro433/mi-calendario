// Mi Calendario — service worker: "red primero". Con internet siempre carga la versión publicada
// (así no se queda una versión vieja en el móvil); sin internet usa la última copia guardada.
// Los datos del usuario están en localStorage: este archivo nunca los toca.
const CACHE = 'micalendario-1.0.1';
const BASICOS = ['./', './index.html', './comun.js', './manifest.json', './privacidad.html', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
const HOSTS = [self.location.origin, 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASICOS)).catch(() => {}));
});
self.addEventListener('activate', e => {
  e.waitUntil(Promise.all([
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k.startsWith('micalendario-')).map(k => caches.delete(k)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || !HOSTS.includes(url.origin)) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      // Si la red tarda más de 6 s y hay copia guardada, usar la copia
      const red = fetch(req, url.origin === self.location.origin ? { cache: 'no-cache' } : {}).then(res => { if (res.ok) cache.put(req, res.clone()); return res; });
      const lento = new Promise((_, rej) => setTimeout(() => rej(new Error('lento')), 6000));
      return await Promise.race([red, lento]).catch(async () => (await cache.match(req, { ignoreSearch: true })) || red);
    } catch (err) {
      return (await cache.match(req, { ignoreSearch: true })) || Response.error();
    }
  })());
});
