import { useCallback } from 'react';
import { on } from '../web-app';
import type { EventHandler, EventType, WebApp } from '../web-app.types';
import { useWebAppSnapshot } from './useWebAppSnapshot';

/**
 * A piece of `WebApp` state that a set of events announces changes to.
 *
 * `events` and `read` must be stable across renders — define them at module
 * scope — or the subscription is torn down and rebuilt on every render.
 */
export function useWebAppState<T>(
  hookName: string,
  events: readonly EventType[],
  read: (webApp: WebApp) => T,
): T | undefined {
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

  return useWebAppSnapshot(hookName, subscribe, read);
}
