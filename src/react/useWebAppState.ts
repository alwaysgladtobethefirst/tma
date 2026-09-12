import type { EventType, WebApp } from '../web-app.types';
import { createWebAppStore, fromEvents, readWebApp } from './createWebAppStore';
import { useStoreSnapshot } from './useStoreSnapshot';

/**
 * A piece of `WebApp` state that a set of events announces changes to.
 *
 * The store is keyed by the hook and the event names, so every component
 * calling the same hook joins one subscription — and rebuilding the events
 * array on each render changes nothing, since the names are what identify it.
 */
export function useWebAppState<T>(
  hookName: string,
  events: readonly EventType[],
  read: (webApp: WebApp) => T,
): T | undefined {
  return useStoreSnapshot(hookName, `${hookName}:${events.join(' ')}`, () =>
    createWebAppStore(fromEvents(events), readWebApp(read)),
  );
}
