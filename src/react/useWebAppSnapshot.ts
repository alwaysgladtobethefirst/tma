import { useCallback, useRef, useSyncExternalStore } from 'react';
import { getWebApp } from '../web-app';
import type { WebApp } from '../web-app.types';
import { isSameSnapshot } from './isSameSnapshot';
import { useTmaContext } from './useTmaContext';

function getServerSnapshot(): undefined {
  return undefined;
}

/**
 * The store every read-only state hook in this layer is built on: guard the
 * provider, re-read from `WebApp` when `subscribe` says something changed,
 * and re-render only the components actually reading this value.
 *
 * `subscribe` and `read` must be stable across renders, or the subscription
 * is torn down and rebuilt every time.
 *
 * The snapshot is cached and handed back unchanged when nothing differs.
 * That isn't an optimisation: `useSyncExternalStore` compares snapshots by
 * identity, so returning a freshly built object on every call would
 * re-render forever.
 *
 * `getServerSnapshot` reports the same `undefined` as running outside
 * Telegram, so a server render and the first client paint agree and
 * hydration can't mismatch.
 *
 * Most hooks want `useWebAppState` instead, which builds `subscribe` from a
 * list of events. Reach for this one directly when the value isn't readable
 * from `WebApp` alone — `useViewport` has to remember an event payload.
 */
export function useWebAppSnapshot<T>(
  hookName: string,
  subscribe: (onStoreChange: () => void) => () => void,
  read: (webApp: WebApp) => T,
): T | undefined {
  useTmaContext(hookName);

  const cached = useRef<{ value: T | undefined } | undefined>(undefined);

  const getSnapshot = useCallback(() => {
    const webApp = getWebApp();
    const next = webApp === undefined ? undefined : read(webApp);

    if (cached.current !== undefined && isSameSnapshot(cached.current.value, next)) {
      return cached.current.value;
    }

    cached.current = { value: next };
    return next;
  }, [read]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
