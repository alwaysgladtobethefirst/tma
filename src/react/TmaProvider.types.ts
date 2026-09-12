import type { ReactNode } from 'react';
import type { ParsedInitData } from '../init-data.types';

/** Props for `<TmaProvider>`. */
export interface TmaProviderProps {
  children?: ReactNode;
}

/**
 * What the provider puts in context. Only what is parsed once at startup
 * goes here; state that changes while the Mini App runs lives in the stores
 * each hook subscribes to, so a change there re-renders only its own readers.
 */
export interface TmaContextValue {
  launch: ParsedInitData | undefined;
}
