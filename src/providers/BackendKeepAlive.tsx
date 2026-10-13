'use client';

import { useEffect } from 'react';
import { API_CONFIG } from '@/constants';

// Azure's load balancer silently drops idle connections (~4 min) and the
// Container App backend can scale down when unused. Both make the first
// request after idle hang until the 20 s axios timeout cancels it. A cheap
// periodic ping keeps the connection path and the container warm, and a ping
// on tab re-focus revives them before the user's real requests fire.
const KEEP_ALIVE_INTERVAL_MS = 4 * 60 * 1000;

export function BackendKeepAlive() {
  useEffect(() => {
    let lastPingAt = 0;

    const ping = () => {
      lastPingAt = Date.now();
      // Any response (even 404) proves the connection is alive and keeps the
      // container warm — status and body are irrelevant.
      fetch(`${API_CONFIG.BASE_URL}/`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT_MS),
      }).catch(() => {});
    };

    const onVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        Date.now() - lastPingAt > KEEP_ALIVE_INTERVAL_MS
      ) {
        ping();
      }
    };

    ping();
    const intervalId = setInterval(ping, KEEP_ALIVE_INTERVAL_MS);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return null;
}
