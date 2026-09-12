import { getWebApp, on } from '../web-app';
import type { EventHandler, EventType, WebApp } from '../web-app.types';
import type { WebAppStore } from './createWebAppStore.types';
import { isSameSnapshot } from './isSameSnapshot';

/** How a store hears that its value may have moved. Hands back the teardown. */
type Listen = (onChange: () => void) => () => void;

/** Subscribes to Telegram once for the whole set, however many components are reading. */
export function fromEvents(events: readonly EventType[]): Listen {
  return (onChange) => {
    const unsubscribes = events.map((event) => on(event, onChange as EventHandler<EventType>));

    return () => {
      for (const unsubscribe of unsubscribes) unsubscribe();
    };
  };
}

/** Reads through `read`, or reports `undefined` when there is no Telegram to read from. */
export function readWebApp<T>(read: (webApp: WebApp) => T): () => T | undefined {
  return () => {
    const webApp = getWebApp();

    return webApp === undefined ? undefined : read(webApp);
  };
}

/**
 * One value, one subscription to Telegram, one cached snapshot — however
 * many components are reading it.
 *
 * The snapshot is kept and handed back unchanged while nothing differs.
 * That isn't an optimisation: `useSyncExternalStore` compares snapshots by
 * identity, so a freshly built object on every read would re-render forever.
 *
 * Readers are only woken when the value actually moved, so an event that
 * changes nothing costs nothing beyond the comparison.
 */
export function createWebAppStore<T>(listen: Listen, read: () => T | undefined): WebAppStore<T> {
  const listeners = new Set<() => void>();
  let cached: { value: T | undefined } | undefined;
  let stopListening: (() => void) | undefined;

  function refresh(): boolean {
    const next = read();
    if (cached !== undefined && isSameSnapshot(cached.value, next)) return false;

    cached = { value: next };
    return true;
  }

  return {
    subscribe(onStoreChange) {
      listeners.add(onStoreChange);

      stopListening ??= listen(() => {
        if (!refresh()) return;
        for (const listener of [...listeners]) listener();
      });

      return () => {
        listeners.delete(onStoreChange);
        if (listeners.size > 0) return;

        stopListening?.();
        stopListening = undefined;
      };
    },

    getSnapshot() {
      // with nobody listening there are no events to trust, so read again rather than serve a stale value
      if (cached === undefined || listeners.size === 0) refresh();

      return cached?.value;
    },
  };
}
