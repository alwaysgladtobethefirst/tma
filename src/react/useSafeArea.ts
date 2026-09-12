import type { SafeAreaInset, WebApp } from '../web-app.types';
import { useWebAppState } from './useWebAppState';

const EVENTS = ['safeAreaChanged'] as const;

function readSafeArea(webApp: WebApp): SafeAreaInset {
  return webApp.safeAreaInset;
}

/**
 * How much of each edge the *device* takes for itself — a notch, a rounded
 * corner, a home indicator. `undefined` outside Telegram.
 *
 * This is not the same as `useContentSafeArea`, which is about Telegram's
 * own chrome. A layout that must clear both has to account for each.
 */
export function useSafeArea(): SafeAreaInset | undefined {
  return useWebAppState('useSafeArea', EVENTS, readSafeArea);
}
