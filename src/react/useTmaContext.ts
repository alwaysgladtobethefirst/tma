import { createContext, useContext } from 'react';
import type { TmaContextValue } from './TmaProvider.types';

/** `null` is "no provider above" — the one thing every hook checks before doing anything. */
export const TmaContext = createContext<TmaContextValue | null>(null);

/**
 * Everything the provider shares, or a thrown error naming the hook that
 * asked. Takes the caller's name so the message points at the hook the
 * developer actually wrote, not at this shared guard.
 */
export function useTmaContext(hookName: string): TmaContextValue {
  const value = useContext(TmaContext);
  if (value === null) {
    throw new Error(`${hookName}() needs a <TmaProvider> above it in the tree.`);
  }

  return value;
}
