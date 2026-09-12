import type { ContentSafeAreaInset, WebApp } from '../web-app.types';
import { useWebAppState } from './useWebAppState';

const EVENTS = ['contentSafeAreaChanged'] as const;

function readContentSafeArea(webApp: WebApp): ContentSafeAreaInset {
  return webApp.contentSafeAreaInset;
}

/**
 * How much of each edge *Telegram's own interface* covers — its header, and
 * whatever else the client draws over the Mini App. `undefined` outside
 * Telegram.
 *
 * Separate from `useSafeArea`, which is about the device's own notches and
 * indicators, and announced by its own event.
 */
export function useContentSafeArea(): ContentSafeAreaInset | undefined {
  return useWebAppState('useContentSafeArea', EVENTS, readContentSafeArea);
}
