import type { WebApp } from '../web-app.types';
import { useWebAppState } from './useWebAppState';

const EVENTS = ['activated', 'deactivated'] as const;

function readIsActive(webApp: WebApp): boolean {
  return webApp.isActive;
}

/**
 * Whether the Mini App is the thing the user is looking at right now, or
 * `undefined` outside Telegram. It goes `false` when the Mini App is
 * minimised or pushed into the background, and back to `true` on return —
 * the moment to pause a timer, a poll, or an animation.
 *
 * An inactive Mini App is still a Mini App: this is unrelated to running
 * outside Telegram entirely.
 */
export function useIsActive(): boolean | undefined {
  return useWebAppState('useIsActive', EVENTS, readIsActive);
}
