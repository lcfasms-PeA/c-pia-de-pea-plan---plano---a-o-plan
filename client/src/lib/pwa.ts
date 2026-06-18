/**
 * PWA Service Worker Registration
 * Este arquivo registra o service worker quando a aplicação carrega
 */

export function registerServiceWorker(): void {
  const doRegister = () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('✓ Service Worker registrado:', registration);

        // Verificar updates a cada hora
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // Notificar quando novo service worker estiver pronto
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // Nova versão disponível
              console.log(
                '✓ Nova versão disponível, recarregue para atualizar'
              );

              // Emitir evento customizado
              window.dispatchEvent(
                new CustomEvent('pwa-update-available', {
                  detail: { registration },
                })
              );
            }
          });
        });
      })
      .catch((error) => {
        console.warn('✗ Erro ao registrar Service Worker:', error);
      });
  };

  if ('serviceWorker' in navigator) {
    // Registra imediatamente se a pagina ja terminou de carregar.
    if (document.readyState === 'complete') {
      doRegister();
    } else {
      window.addEventListener('load', doRegister, { once: true });
    }
  } else {
    console.log(
      '✗ Service Workers não suportados neste navegador'
    );
  }
}

/**
 * Tipagem para o evento de instalação do PWA.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/**
 * Solicitar instalação da app
 */
let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function setupInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (event) => {
    const beforeInstallEvent = event as BeforeInstallPromptEvent;
    // Prevenir o comportamento padrão
    beforeInstallEvent.preventDefault();
    // Armazenar o evento para uso posterior
    deferredPrompt = beforeInstallEvent;
    console.log('✓ Instalação da app disponível');

    // Emitir evento customizado
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  });
}

export function installApp(): Promise<void> {
  if (!deferredPrompt) {
    console.warn('Instalação não disponível');
    return Promise.reject('Instalação não disponível');
  }

  deferredPrompt.prompt();
  return deferredPrompt.userChoice.then((choiceResult: { outcome: 'accepted' | 'dismissed'; platform: string }) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('✓ App instalada pelo usuário');
    } else {
      console.log('✗ Usuário rejeitou instalação');
    }
    deferredPrompt = null;
  });
}

/**
 * Detectar modo offline
 */
export function setupOfflineDetection(): void {
  window.addEventListener('online', () => {
    console.log('✓ Conexão restaurada');
    window.dispatchEvent(new CustomEvent('pwa-online'));
  });

  window.addEventListener('offline', () => {
    console.log('✗ Conexão perdida - modo offline ativado');
    window.dispatchEvent(new CustomEvent('pwa-offline'));
  });
}

/**
 * Solicitar permissão para notificações
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Notificações não suportadas');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Registrar Background Sync
 */
export async function registerBackgroundSync(tag: string): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Background Sync não suportado');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if ('sync' in registration) {
      await (registration as any).sync.register(tag);
      console.log('✓ Background Sync registrado:', tag);
    }
  } catch (error) {
    console.warn('Erro ao registrar Background Sync:', error);
  }
}

/**
 * Sincronizar dados offline quando voltar online
 */
export function setupAutoSync(): void {
  window.addEventListener('online', async () => {
    console.log('Sincronizando dados...');
    try {
      await registerBackgroundSync('sync-planos');
    } catch (error) {
      console.warn('Erro ao sincronizar:', error);
    }
  });
}
