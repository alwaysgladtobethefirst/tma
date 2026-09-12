import { useCallback, useRef } from 'react';
import { on } from '../web-app';
import type { WebApp } from '../web-app.types';
import type { Viewport } from './useViewport.types';
import { useWebAppSnapshot } from './useWebAppSnapshot';

/**
 * The visible area of the Mini App, or `undefined` outside Telegram.
 *
 * This is the one hook that subscribes by hand instead of through
 * `useWebAppState`: `isStateStable` isn't a property of `WebApp` at all. It
 * only ever arrives in the `viewportChanged` payload, so it has to be
 * remembered between events rather than read back on demand.
 *
 * Expect this to re-render continuously while the user drags — that is the
 * point of `height`. Lay out against `stableHeight`, or check `isStateStable`,
 * when you'd rather not follow every frame of the gesture.
 */
export function useViewport(): Viewport | undefined {
  const isStateStable = useRef(true);

  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      on('viewportChanged', (payload) => {
        isStateStable.current = payload.isStateStable;
        onStoreChange();
      }),
    [],
  );

  const read = useCallback(
    (webApp: WebApp): Viewport => ({
      height: webApp.viewportHeight,
      stableHeight: webApp.viewportStableHeight,
      isExpanded: webApp.isExpanded,
      isStateStable: isStateStable.current,
    }),
    [],
  );

  return useWebAppSnapshot('useViewport', subscribe, read);
}
