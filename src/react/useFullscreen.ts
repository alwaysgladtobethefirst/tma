import type { WebApp } from '../web-app.types';
import { useWebAppState } from './useWebAppState';

const EVENTS = ['fullscreenChanged'] as const;

function readFullscreen(webApp: WebApp): boolean {
  return webApp.isFullscreen;
}

/**
 * Whether the Mini App is currently drawn fullscreen, or `undefined` outside
 * Telegram. Read-only: asking to enter or leave fullscreen is an action, and
 * actions live in the core rather than in a hook.
 */
export function useFullscreen(): boolean | undefined {
  return useWebAppState('useFullscreen', EVENTS, readFullscreen);
}
