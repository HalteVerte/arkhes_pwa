// Version du cache
const CACHE_NAME = 'arkhes-v2';
const OFFLINE_URL = '/offline.html';

// Fichiers à mettre en cache
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/sw-register.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Ajoutez ici toutes les autres ressources importantes
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des ressources');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Stratégie de mise en cache (Cache First, fallback réseau)
self.addEventListener('fetch', (event) => {
  // Ignore les requêtes non-GET et les requêtes cross-origin
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Retourne la réponse en cache si disponible
        if (cachedResponse) {
          return cachedResponse;
        }

        // Sinon, va chercher sur le réseau
        return fetch(event.request)
          .then((response) => {
            // Si la réponse est valide, la met en cache
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Fallback pour les pages hors-ligne
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Gestion des messages (pour les mises à jour en arrière-plan)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
document.querySelector('.menu-toggle').addEventListener('click', () => {
  const nav = document.querySelector('nav ul');
  nav.classList.toggle('show');
  
  // Animation optionnelle
  if (nav.classList.contains('show')) {
    nav.style.animation = 'slideDown 0.3s ease-out';
  } else {
    nav.style.animation = 'slideUp 0.3s ease-out';
  }
});