import { useEffect, useRef } from 'react';
import type { OwnershipRegistry } from './createOwnershipRegistry';

/**
 * Keeps track of how many components are driving one of Telegram's buttons
 * at the same time.
 *
 * Two owners at once is almost always a screen that forgot to let go before
 * the next one took over, so `registry.claim` warns about it — but it isn't
 * fatal: the last one mounted simply wins, because its effect runs last.
 *
 * The button is only put away when the *last* owner leaves. Hiding on every
 * unmount would blank the button during a screen transition, where the
 * incoming screen mounts before the outgoing one is gone.
 */
export function useButtonOwnership(
  registry: OwnershipRegistry,
  buttonName: string,
  onLastOwnerLeft: () => void,
): void {
  const release = useRef(onLastOwnerLeft);
  useEffect(() => {
    release.current = onLastOwnerLeft;
  });

  useEffect(() => {
    registry.claim(buttonName);

    return () => {
      if (registry.release(buttonName) === 0) release.current();
    };
  }, [registry, buttonName]);
}
