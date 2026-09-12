import type { ReactNode } from 'react';
import type { ParsedInitData } from '../init-data.types';
import type { OwnershipRegistry } from './createOwnershipRegistry';
import type { StoreRegistry } from './createWebAppStore.types';

/** Props for `<TmaProvider>`. */
export interface TmaProviderProps {
  children?: ReactNode;
}

/**
 * What the provider owns on behalf of the whole tree: the launch data it
 * parsed once, one store per piece of changing state, and who currently owns
 * each button.
 *
 * The store registry is why a second component reading the theme joins the
 * first rather than opening its own subscription to Telegram. Its identity
 * never changes, so the context itself never re-renders anyone — each store
 * wakes only the components actually reading it.
 *
 * The ownership registry is scoped here rather than kept at module level for
 * the same reason: two providers (two tests, two independent roots) must not
 * see each other's button conflicts.
 */
export interface TmaContextValue {
  launch: ParsedInitData | undefined;
  stores: StoreRegistry;
  ownership: OwnershipRegistry;
}
