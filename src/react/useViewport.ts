import { useCallback, useRef, useSyncExternalStore } from 'react';
import { getWebApp, on } from '../web-app';
import type { WebApp } from '../web-app.types';
import { isSameSnapshot } from './snapshot';
import { useTmaContext } from './TmaProvider';
import type { Viewport } from './useViewport.types';

function getServerSnapshot(): undefined {
  return undefined;
}

function readViewport(webApp: WebApp, isStateStable: boolean): Viewport {
  return {
    height: webApp.viewportHeight,
    stableHeight: webApp.viewportStableHeight,
    isExpanded: webApp.isExpanded,
    isStateStable,
  };
}

/**
 * The visible area of the Mini App, or `undefined` outside Telegram.
 *
 * This one doesn't go through the shared state machinery the other hooks
 * use, because `isStateStable` isn't a property of `WebApp` at all: it only
 * ever arrives in the `viewportChanged` payload, so it has to be remembered
 * between events rather than read back on demand.
 *
 * Expect this to re-render continuously while the user drags — that is the
 * point of `height`. Lay out against `stableHeight`, or check `isStateStable`,
 * when you'd rather not follow every frame of the gesture.
 */
export function useViewport(): Viewport | undefined {
  useTmaContext('useViewport');

  const isStateStable = useRef(true);
  const cached = useRef<{ value: Viewport | undefined } | undefined>(undefined);

  const subscribe = useCallback((onStoreChange: () => void) => {
    return on('viewportChanged', (payload) => {
      isStateStable.current = payload.isStateStable;
      onStoreChange();
    });
  }, []);

  const getSnapshot = useCallback((): Viewport | undefined => {
    const webApp = getWebApp();
    const next = webApp === undefined ? undefined : readViewport(webApp, isStateStable.current);

    if (cached.current !== undefined && isSameSnapshot(cached.current.value, next)) {
      return cached.current.value;
    }

    cached.current = { value: next };
    return next;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
