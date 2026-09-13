import { useEffect, useMemo, useState } from 'react';
import { getInitData } from '../init-data';
import type { ParsedInitData } from '../init-data.types';
import { isMiniApp, ready } from '../web-app';
import { createOwnershipRegistry } from './createOwnershipRegistry';
import { createStoreRegistry } from './createStoreRegistry';
import type { TmaContextValue, TmaProviderProps } from './TmaProvider.types';
import { TmaContext } from './useTmaContext';
import { warnOnce } from './warnOnce';

function warnAboutBrokenLaunchDataFields(launch: ParsedInitData): void {
  if (launch.warnings.length === 0) return;

  const summary = launch.warnings.map(({ field, reason }) => `${field} (${reason})`).join(', ');
  warnOnce(
    'launch-data',
    `Some launch data fields could not be read and were left out: ${summary}.`,
  );
}

/**
 * The root every hook in this layer needs above it. Mount it once, near the
 * top of the tree.
 *
 * It owns four things for the whole tree: one store per piece of changing
 * state, so however many components read the theme there is still only one
 * subscription to Telegram; who currently owns each button; the launch data,
 * parsed once; and the moment the Mini App is ready to be shown.
 *
 * It deliberately doesn't `expand()`: how much of the screen to take is a
 * choice that belongs to the app, not to this package.
 */
export function TmaProvider({ children }: TmaProviderProps) {
  // lazy initial state, not useMemo: react may discard useMemo and re-parse mid-session
  const [launch] = useState(getInitData);
  const [stores] = useState(createStoreRegistry);
  const [ownership] = useState(createOwnershipRegistry);
  const value = useMemo<TmaContextValue>(
    () => ({ launch, stores, ownership }),
    [launch, stores, ownership],
  );

  useEffect(() => {
    if (!isMiniApp()) {
      warnOnce(
        'outside-telegram',
        '<TmaProvider> is mounted outside Telegram: there is no window.Telegram.WebApp, so every hook reports `undefined` and every core call does nothing. This is expected in a plain browser tab.',
      );
      return;
    }

    ready();
    if (launch !== undefined) warnAboutBrokenLaunchDataFields(launch);
  }, [launch]);

  return <TmaContext value={value}>{children}</TmaContext>;
}
