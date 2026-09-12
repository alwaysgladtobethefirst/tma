import { useEffect, useRef } from 'react';
import { warnOnce } from './warnOnce';

const owners = new Map<string, number>();

/**
 * Keeps track of how many components are driving one of Telegram's buttons
 * at the same time.
 *
 * Two owners at once is almost always a screen that forgot to let go before
 * the next one took over, so it's worth saying out loud — but it isn't
 * fatal: the last one mounted simply wins, because its effect runs last.
 *
 * The button is only put away when the *last* owner leaves. Hiding on every
 * unmount would blank the button during a screen transition, where the
 * incoming screen mounts before the outgoing one is gone.
 */
export function useButtonOwnership(buttonName: string, onLastOwnerLeft: () => void): void {
  const release = useRef(onLastOwnerLeft);
  useEffect(() => {
    release.current = onLastOwnerLeft;
  });

  useEffect(() => {
    const owned = (owners.get(buttonName) ?? 0) + 1;
    owners.set(buttonName, owned);

    if (owned > 1) {
      warnOnce(
        `button-owners:${buttonName}`,
        `Two components are driving ${buttonName} at once, so the last one mounted wins. This is usually a screen that hasn't let go before the next one takes over.`,
      );
    }

    return () => {
      const left = (owners.get(buttonName) ?? 1) - 1;
      owners.set(buttonName, left);
      if (left === 0) release.current();
    };
  }, [buttonName]);
}
