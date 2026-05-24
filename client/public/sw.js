// PeA-Plan Service Worker
// Gerencia cache, offline support e sincronização em background

const CACHE_NAME = 'pea-plan-v1';
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Cache aberto');
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.warn('Service Worker: Erro ao fazer cache de assets', error);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.pathname.startsWith('/api/trpc')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached;
            }
            return new Response(JSON.stringify({
              error: 'Offline - A funcionalidade requer conexão',
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            });
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }

          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });

          return response;
        })
        .catch(() => {
          return new Response('Offline - Recurso não disponível', {
            status: 503,
          });
        });
    })
  );
});

self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync trigger -', event.tag);
  if (event.tag === 'sync-planos') {
    event.waitUntil(syncPlans());
  }
});

async function syncPlans() {
  try {
    const db = await openIndexedDB();
    const unsyncedPlans = await getUnsyncedPlans(db);

    for (const plan of unsyncedPlans) {
      try {
        await fetch('/api/trpc/planos.atualizar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(plan),
        });
        await markAsSynced(db, plan.id);
      } catch (error) {
        console.warn('Erro ao sincronizar plano', plan.id, error);
      }
    }
  } catch (error) {
    console.error('Erro em background sync', error);
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('pea-plan-db', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getUnsyncedPlans(db) {
  return new Promise((resolve) => {
    const store = db.transaction('planos', 'readonly').objectStore('planos');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result.filter((p) => !p.synced));
  });
}

function markAsSynced(db, planId) {
  return new Promise((resolve) => {
    const store = db.transaction('planos', 'readwrite').objectStore('planos');
    const request = store.get(planId);
    request.onsuccess = () => {
      const plan = request.result;
      plan.synced = true;
      store.put(plan);
      resolve();
    };
  });
}

self.addEventListener('push', (event) => {
  console.log('Service Worker: Push recebido', event);
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/pwa-192x192.png',
      badge: '/icons/pwa-192x192-maskable.png',
      tag: data.tag || 'pea-plan-notification',
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || [],
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});
