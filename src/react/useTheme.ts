import type { WebApp } from '../web-app.types';
import type { Theme } from './useTheme.types';
import { useWebAppState } from './useWebAppState';

const EVENTS = ['themeChanged'] as const;

function readTheme(webApp: WebApp): Theme {
  return { colorScheme: webApp.colorScheme, themeParams: webApp.themeParams };
}

/**
 * The user's current Telegram theme, or `undefined` outside Telegram.
 * Re-renders only when the theme actually changes.
 *
 * Telegram already exposes these same colours as `--tg-theme-*` CSS
 * variables and keeps them up to date on its own, so plain CSS is usually
 * the better tool. Reach for this hook when the values have to reach
 * JavaScript: a canvas, an inline SVG, a charting library.
 */
export function useTheme(): Theme | undefined {
  return useWebAppState('useTheme', EVENTS, readTheme);
}
