const CACHE_NAME = 'compendium-cache-v60';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon-32.png',
  './css/base.css',
  './css/shinobi.css',
  './css/mass-effect.css',
  './css/avatar.css',
  './css/witcher.css',
  './css/witcher.css?v=58',
  './css/wizard.css',
  './css/wizard.css?v=60',
  './js/dnd-data.js',
  './js/core.js',
  './js/modules/homebrew.js',
  './js/modules/shinobi.js',
  './js/modules/mass-effect.js',
  './js/modules/avatar.js',
  './js/modules/witcher.js',
  './js/modules/witcher.js?v=57',
  './js/modules/wizard.js',
  './js/modules/wizard.js?v=57',
  './js/modules/github-sync.js',
  './js/app.js',
  './mass_effect_galaxy_map.jpg',
  './shinobi_map_accurate.svg',
  './v4-1600px-Avatar-the-Last-Airbender-Map-Summary-Version-2.jpg.webp',
  './new-4k-map-of-the-continent-v0-s4ryngvic0ga1.webp',
  './symbols/Witcher/Aard.png',
  './symbols/Witcher/Axii.png',
  './symbols/Witcher/Igni.png',
  './symbols/Witcher/Quen.png',
  './symbols/Avatar/air.png',
  './symbols/Avatar/earth.png',
  './symbols/Avatar/water.png',
  './symbols/Avatar/fire.png',
  './symbols/Mass Effect/Cerberus.png',
  './symbols/Mass Effect/Citadel.webp',
  './symbols/Mass Effect/N7_light.png',
  './symbols/clans/Dzanku_Symbol.png',
  './symbols/clans/Uchiha_Symbol.webp',
  './symbols/country/Fire.webp',
  './symbols/country/wind.png',
  './symbols/country/ground.webp',
  './symbols/country/lightning.webp',
  './symbols/country/water.png',
  './symbols/country/sound.webp',
  './symbols/country/hotsprings.webp',
  './symbols/country/winter.webp',
  './symbols/country/rivers.webp',
  './symbols/country/rock.webp',
  './symbols/country/tea.webp',
  './symbols/country/snow.webp',
  './symbols/country/bear.webp',
  './symbols/country/noodle.webp',
  './symbols/country/neck.webp',
  './symbols/country/bird.webp',
  './symbols/country/moon.webp',
  './symbols/country/lake.webp',
  './symbols/country/Waves.webp',
  './symbols/country/whirlpool.webp',
  './symbols/country/woods.webp',
  './symbols/village/Konohagakure_Symbol.webp',
  './symbols/village/Sunagakure_Symbol.webp',
  './symbols/village/Iwagakure_Symbol.webp',
  './symbols/village/Kumogakure_Symbol.webp',
  './symbols/village/Kirigakure_Symbol.webp',
  './symbols/village/Amegakure_Symbol.webp',
  './symbols/village/Kusagakure_Symbol.webp',
  './symbols/village/Takigakure_Symbol.webp',
  './symbols/village/Otogakure_Symbol.webp',
  './symbols/village/Yugakure_Symbol.webp',
  './symbols/village/Shimogakure_Symbol.webp',
  './symbols/village/Ishigakure_Symbol.webp',
  './symbols/village/Yukigakure_Symbol.webp',
  './symbols/village/Hoshigakure_Symbol.webp',
  './symbols/village/Tanigakure_Symbol.webp',
  './symbols/village/Getsugakure_Symbol.webp',
  './symbols/village/Uzushiogakure_Symbol.webp',
  './symbols/village/Yumegakure_Symbol.webp',
  './symbols/village/Jomae_Village_Symbol.webp',
  './symbols/village/Toad_Symbol.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return Promise.all(
          APP_SHELL.map((url) => cache.add(url).catch((err) => {
            console.warn('SW: Failed to cache asset:', url, err);
          }))
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Для скриптов, страниц и стилей используем Network-First с fallback в кэш.
  // Это гарантирует, что пользователь всегда сразу получает свежий код при онлайн-соединении.
  const p = url.pathname;
  const isCodeAsset = event.request.mode === 'navigate' ||
    p.endsWith('.html') ||
    p.endsWith('.js') ||
    p.endsWith('.css') ||
    p === '/' ||
    p.endsWith('/') ||
    p.indexOf('witcher') !== -1;

  if (isCodeAsset) {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Для тяжелых медиа (карта, картинки) — Cache First
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
