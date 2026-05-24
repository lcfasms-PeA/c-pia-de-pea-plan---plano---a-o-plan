/**
 * PWA Hook
 * Hook React para gerenciar PWA features
 */

import { useEffect, useState } from 'react';
import {
  registerServiceWorker,
  setupInstallPrompt,
  setupOfflineDetection,
  setupAutoSync,
  installApp as triggerInstall,
} from '@/lib/pwa';

export function usePWA() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [installAvailable, setInstallAvailable] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Registrar Service Worker
    registerServiceWorker();

    // Setup install prompt
    setupInstallPrompt();

    // Setup offline detection
    setupOfflineDetection();

    // Setup auto sync
    setupAutoSync();

    // Listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleInstall = () => setInstallAvailable(true);
    const handleUpdate = () => setUpdateAvailable(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('pwa-install-available', handleInstall);
    window.addEventListener('pwa-update-available', handleUpdate);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa-install-available', handleInstall);
      window.removeEventListener('pwa-update-available', handleUpdate);
    };
  }, []);

  return {
    isOnline,
    installAvailable,
    updateAvailable,
    installApp: triggerInstall,
    reloadForUpdate: () => window.location.reload(),
  };
}
