import type { Listen, WebAppStore } from './createWebAppStore.types';
import { isSameSnapshot } from './isSameSnapshot';

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
