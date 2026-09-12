import { useCallback, useRef, useSyncExternalStore } from 'react';
import { getWebApp, on } from '../web-app';
import type { EventHandler, EventType, WebApp } from '../web-app.types';
import { isSameSnapshot } from './snapshot';
import { useTmaContext } from './TmaProvider';

function getServerSnapshot(): undefined {
  return undefined;
}

/**
 * The machinery every read-only state hook in this layer shares: subscribe to
 * the events that announce a change, re-read the value from `WebApp`, and
 * re-render only the components actually reading it.
 *
 * `events` and `read` must be stable across renders — define them at module
 * scope — or the subscription is torn down and rebuilt on every render.
 *
 * The snapshot is cached and handed back unchanged when nothing differs.
 * That isn't an optimisation: `useSyncExternalStore` compares snapshots by
 * identity, so returning a fresh object every call would re-render forever.
 */
export function useWebAppState<T>(
  hookName: string,
  events: readonly EventType[],
  read: (webApp: WebApp) => T,
): T | undefined {
  useTmaContext(hookName);

  const cached = useRef<{ value: T | undefined } | undefined>(undefined);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const unsubscribes = events.map((event) =>
        on(event, onStoreChange as EventHandler<EventType>),
      );

      return () => {
        for (const unsubscribe of unsubscribes) unsubscribe();
      };
    },
    [events],
  );

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
