/// <reference lib="webworker" />
/**
 * PeA-Plan Service Worker
 * Gerencia cache, offline support e sincronização em background
 */

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'pea-plan-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Evento: Instalação
self.addEventListener('install', (event: ExtendableEvent) => {
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

// Evento: Ativação
self.addEventListener('activate', (event: ExtendableEvent) => {
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

// Evento: Fetch (Network First para API, Cache First para assets)
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }

  // API tRPC: Network first, fallback to offline response
  if (url.pathname.startsWith('/api/trpc')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clonar resposta para cache
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          // Offline: Retornar erro amigável
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached;
            }
            return new Response(
              JSON.stringify({
                error: 'Offline - A funcionalidade requer conexão',
              }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          });
        })
    );
    return;
  }

  // Assets estáticos: Cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          // Não cachear respostas de erro
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
          // Fallback offline
          return new Response('Offline - Recurso não disponível', {
            status: 503,
          });
        });
    })
  );
});

// Evento: Background Sync (para sincronizar dados quando voltar online)
interface SyncEvent extends ExtendableEvent {
  tag: string;
}

self.addEventListener('sync', (event: SyncEvent) => {
  console.log('Service Worker: Background sync trigger -', event.tag);

  if (event.tag === 'sync-planos') {
    event.waitUntil(syncPlans());
  }
});

async function syncPlans(): Promise<void> {
  try {
    // Abrir índexed DB para buscar planos não sincronizados
    const db = await openIndexedDB();
    const unsyncedPlans = await getUnsyncedPlans(db);

    // Sincronizar cada plano
    for (const plan of unsyncedPlans) {
      try {
        await fetch('/api/trpc/planos.atualizar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(plan),
        });

        // Marcar como sincronizado
        await markAsSynced(db, plan.id);
      } catch (error) {
        console.warn('Erro ao sincronizar plano', plan.id, error);
      }
    }
  } catch (error) {
    console.error('Erro em background sync', error);
  }
}

// Helpers IndexedDB (simplificados)
async function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('pea-plan-db', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getUnsyncedPlans(db: IDBDatabase): Promise<any[]> {
  return new Promise((resolve) => {
    const store = db
      .transaction('planos', 'readonly')
      .objectStore('planos');
    const request = store.getAll();
    request.onsuccess = () => {
      resolve(request.result.filter((p) => !p.synced));
    };
  });
}

async function markAsSynced(db: IDBDatabase, planId: string): Promise<void> {
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

// Evento: Push notifications
interface PushEvent extends ExtendableEvent {
  data: any;
}

self.addEventListener('push', (event: PushEvent) => {
  console.log('Service Worker: Push recebido', event);

  if (event.data) {
    const data = event.data.json();
    const options: NotificationOptions = {
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

// Evento: Notificação clicada
interface NotificationEvent extends ExtendableEvent {
  notification: Notification;
  action: string;
}

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('Service Worker: Notificação clicada', event.action);

  event.notification.close();

  const urlToOpen = event.notification.tag === 'plano-update'
    ? '/dashboard'
    : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Se já existe janela aberta, focar nela
      for (const client of clientList) {
        if ((client as any).url === urlToOpen && 'focus' in client) {
          return (client as WindowClient).focus();
        }
      }
      // Senão, abrir nova janela
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
