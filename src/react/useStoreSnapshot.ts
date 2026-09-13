import { useSyncExternalStore } from 'react';
import type { WebAppStore } from './createWebAppStore.types';
import { useTmaContext } from './useTmaContext';

function getServerSnapshot(): undefined {
  return undefined;
}

/**
 * Reads one of the provider's shared stores, creating it the first time
 * anybody asks for that key.
 *
 * `getServerSnapshot` reports the same `undefined` as running outside
 * Telegram, so a server render and the first client paint agree and
 * hydration can't mismatch.
 */
export function useStoreSnapshot<T>(
  hookName: string,
  key: string,
  create: () => WebAppStore<T>,
): T | undefined {
  const { stores } = useTmaContext(hookName);
  const store = stores.get(key, create);

  return useSyncExternalStore(store.subscribe, store.getSnapshot, getServerSnapshot);
}
