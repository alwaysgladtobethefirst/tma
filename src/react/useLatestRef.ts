import { useRef } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

/**
 * A ref that always holds the latest render's `value`, updated before the
 * browser paints. The one seam every "call the newest callback without
 * resubscribing" hook in this layer should go through, rather than each
 * reimplementing `useRef` plus an effect at its own fidelity: a plain
 * `useEffect` here leaves a gap where a Telegram event arriving between
 * commit and the effect would read the previous render's value.
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });

  return ref;
}
