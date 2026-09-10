import { useState, useEffect } from 'react';

/**
 * Hook to detect online / offline connectivity status
 */
export function isDeviceOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function initConnectivityListener(onChange: (isOnline: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handleOnline = () => onChange(true);
  const handleOffline = () => onChange(false);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

const STORAGE_KEY_NOTIFICATIONS_ENABLED = 'cardiovault_notifications_enabled';

export function areNotificationsEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_NOTIFICATIONS_ENABLED) === 'true';
  } catch {
    return false;
  }
}

export function setNotificationsEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS_ENABLED, enabled ? 'true' : 'false');
  } catch {}
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    setNotificationsEnabled(granted);
    return granted;
  } catch (err) {
    console.error('Failed to request notification permission:', err);
    return false;
  }
}

export function sendBedsideNotification(title: string, options?: NotificationOptions): void {
  if (!isNotificationSupported() || !areNotificationsEnabled()) {
    return;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/icon.svg',
        ...options,
      });
    } catch (err) {
      console.warn('Could not trigger Notification directly:', err);
    }
  }
}
