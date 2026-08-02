'use client';

import { useEffect } from 'react';

/** Registers the service worker for PWA / offline support. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }
    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* silent — SW is a progressive enhancement */
      });
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return null;
}
