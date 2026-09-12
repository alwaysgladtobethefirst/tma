import type { ReactNode } from 'react';
import type { ParsedInitData } from '../init-data.types';
import type { StoreRegistry } from './createWebAppStore.types';

/** Props for `<TmaProvider>`. */
export interface TmaProviderProps {
  children?: ReactNode;
}

/**
 * What the provider owns on behalf of the whole tree: the launch data it
 * parsed once, and one store per piece of changing state.
 *
 * The registry is why a second component reading the theme joins the first
 * rather than opening its own subscription to Telegram. Its identity never
 * changes, so the context itself never re-renders anyone — each store wakes
 * only the components actually reading it.
 */
export interface TmaContextValue {
  launch: ParsedInitData | undefined;
  stores: StoreRegistry;
}
