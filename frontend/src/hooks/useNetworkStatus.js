import { useState, useEffect } from 'react';

/**
 * Custom hook that tracks the browser's online/offline status in real time.
 *
 * Uses `navigator.onLine` for the initial state and listens to the browser's
 * 'online' and 'offline' events for live updates. These events fire whenever
 * the device loses or regains network connectivity.
 *
 * Note: `navigator.onLine` can report false positives (e.g. connected to WiFi
 * but the router has no internet). It's reliable for detecting complete
 * disconnection (airplane mode, no WiFi) but not for detecting poor connectivity.
 *
 * @returns {{ isOnline: boolean }} Current network status
 *
 * @example
 * const { isOnline } = useNetworkStatus();
 * if (!isOnline) showOfflineBanner();
 */
const useNetworkStatus = () => {
  // Initialize with the browser's current connectivity state
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // These handlers fire on the window object when connectivity changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup listeners on unmount to prevent memory leaks
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
};

export default useNetworkStatus;
