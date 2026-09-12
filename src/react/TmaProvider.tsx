import { useEffect, useMemo, useState } from 'react';
import { getInitData } from '../init-data';
import { isMiniApp, ready } from '../web-app';
import type { TmaContextValue, TmaProviderProps } from './TmaProvider.types';
import { TmaContext } from './useTmaContext';
import { warnOnce } from './warnOnce';

/**
 * The root every hook in this layer needs above it. Mount it once, near the
 * top of the tree.
 *
 * Mounting tells Telegram the Mini App is ready to be shown. It deliberately
 * doesn't `expand()` as well: that's a choice about how much of the screen
 * to take, which belongs to the app, not to this package.
 */
export function TmaProvider({ children }: TmaProviderProps) {
  // Lazy initial state rather than useMemo: useMemo may be thrown away and
  // recomputed, which would re-parse the launch data mid-session.
  const [launch] = useState(getInitData);
  const value = useMemo<TmaContextValue>(() => ({ launch }), [launch]);

  useEffect(() => {
    if (!isMiniApp()) {
      warnOnce(
        'outside-telegram',
        '<TmaProvider> is mounted outside Telegram: there is no window.Telegram.WebApp, so every hook reports `undefined` and every core call does nothing. This is expected in a plain browser tab.',
      );
      return;
    }

    ready();

    if (launch !== undefined && launch.warnings.length > 0) {
      const summary = launch.warnings.map(({ field, reason }) => `${field} (${reason})`).join(', ');
      warnOnce(
        'launch-data',
        `Some launch data fields could not be read and were left out: ${summary}.`,
      );
    }
  }, [launch]);

  return <TmaContext value={value}>{children}</TmaContext>;
}
