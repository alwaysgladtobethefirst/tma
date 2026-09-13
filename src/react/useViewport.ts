import { getWebApp, on } from '../web-app';
import { createWebAppStore } from './createWebAppStore';
import type { Listen, WebAppStore } from './createWebAppStore.types';
import { useStoreSnapshot } from './useStoreSnapshot';
import type { Viewport } from './useViewport.types';

/**
 * `isStateStable` isn't a property of `WebApp` at all — it only ever arrives
 * in the `viewportChanged` payload — so it has to be remembered between
 * events. It lives in the store's own closure, where it is shared by every
 * reader, rather than in each component.
 */
function createViewportStore(): WebAppStore<Viewport> {
  let isStateStable = true;

  const listen: Listen = (onChange) =>
    on('viewportChanged', (payload) => {
      isStateStable = payload.isStateStable;
      onChange();
    });

  function read(): Viewport | undefined {
    const webApp = getWebApp();
    if (webApp === undefined) return undefined;

    return {
      height: webApp.viewportHeight,
      stableHeight: webApp.viewportStableHeight,
      isExpanded: webApp.isExpanded,
      isStateStable,
    };
  }

  return createWebAppStore(listen, read);
}

/**
 * The visible area of the Mini App, or `undefined` outside Telegram.
 *
 * Expect this to re-render continuously while the user drags — that is the
 * point of `height`. Lay out against `stableHeight`, or check `isStateStable`,
 * when you'd rather not follow every frame of the gesture.
 */
export function useViewport(): Viewport | undefined {
  return useStoreSnapshot('useViewport', 'useViewport', createViewportStore);
}
