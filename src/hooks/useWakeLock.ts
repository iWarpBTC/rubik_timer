import { useEffect } from 'react';

/**
 * Keeps the screen on while `active` is true (Screen Wake Lock API). The
 * browser drops the lock when the tab is hidden, so it is taken again when
 * the page comes back. Silently does nothing where the API is unavailable
 * (older browsers, or pages not served over HTTPS / localhost).
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      if (document.visibilityState !== 'visible' || (lock !== null && !lock.released)) return;
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        if (cancelled) void sentinel.release();
        else lock = sentinel;
      } catch {
        // Refused (e.g. battery saver) — the timer works the same without it.
      }
    };

    void acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', acquire);
      void lock?.release();
    };
  }, [active]);
}
