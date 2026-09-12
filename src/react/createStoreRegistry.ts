import type { StoreRegistry, WebAppStore } from './createWebAppStore.types';

/**
 * The thing that makes `<TmaProvider>` worth mounting: one store per concern
 * for the whole tree, so ten components reading the theme share a single
 * subscription to Telegram and a single snapshot rather than ten of each.
 *
 * Scoped to the provider rather than kept at module level, so tests and
 * separate roots don't inherit each other's subscriptions.
 */
export function createStoreRegistry(): StoreRegistry {
  const stores = new Map<string, WebAppStore<unknown>>();

  return {
    get<T>(key: string, create: () => WebAppStore<T>): WebAppStore<T> {
      const existing = stores.get(key);
      if (existing !== undefined) return existing as WebAppStore<T>;

      const created = create();
      stores.set(key, created as WebAppStore<unknown>);

      return created;
    },
  };
}
