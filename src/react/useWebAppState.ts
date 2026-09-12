import { useCallback } from 'react';
import { on } from '../web-app';
import type { EventHandler, EventType, WebApp } from '../web-app.types';
import { useWebAppSnapshot } from './useWebAppSnapshot';

/**
 * A piece of `WebApp` state that a set of events announces changes to.
 *
 * The subscription is keyed by the event names themselves rather than by the
 * identity of the array holding them, so passing a fresh `['themeChanged']`
 * on every render is harmless. Keying on identity would have torn the
 * subscription down and rebuilt it each time, silently, for anyone who
 * didn't happen to hoist the array to module scope.
 */
export function useWebAppState<T>(
  hookName: string,
  events: readonly EventType[],
  read: (webApp: WebApp) => T,
): T | undefined {
  const eventKey = events.join(' ');

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      // the key is the source of truth here: same names, same subscription, whoever built the array
      const unsubscribes = eventKey
        .split(' ')
        .map((event) => on(event as EventType, onStoreChange as EventHandler<EventType>));

      return () => {
        for (const unsubscribe of unsubscribes) unsubscribe();
      };
    },
    [eventKey],
  );

  return useWebAppSnapshot(hookName, subscribe, read);
}
