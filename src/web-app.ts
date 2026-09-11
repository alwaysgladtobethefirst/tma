import { isAtLeast } from './version';
import type { EventHandler, EventType, WebApp } from './web-app.types';

declare global {
  interface Window {
    Telegram?: { WebApp?: WebApp };
  }
}

/**
 * The raw `window.Telegram.WebApp` object, or `undefined` outside Telegram
 * (a plain browser tab, a server, a worker). Read fresh on every call — no
 * caching, no staleness.
 */
export function getWebApp(): WebApp | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.Telegram?.WebApp;
}

/** Whether this code is currently running inside a Telegram Mini App. */
export function isMiniApp(): boolean {
  return getWebApp() !== undefined;
}

/** Tells Telegram the Mini App is ready to display. No-op outside Telegram. */
export function ready(): void {
  getWebApp()?.ready();
}

/** Expands the Mini App to its maximum height. No-op outside Telegram. */
export function expand(): void {
  getWebApp()?.expand();
}

/**
 * Whether the current client's Bot API version is at least `target`.
 * `false` outside Telegram. Pure version gate — a feature-presence check
 * (does this client actually expose a given method) is a separate concern,
 * added alongside whichever wrapper needs it.
 */
export function supportsVersion(target: string): boolean {
  const webApp = getWebApp();
  return webApp !== undefined && isAtLeast(webApp.version, target);
}

/**
 * Subscribes to a `WebApp` event. Returns an unsubscribe function — call it
 * instead of holding onto `handler` yourself to pair with `offEvent`.
 * No-op (returns a no-op unsubscribe) outside Telegram.
 */
export function on<E extends EventType>(event: E, handler: EventHandler<E>): () => void {
  const webApp = getWebApp();
  if (!webApp) return () => {};

  webApp.onEvent(event, handler);
  return () => webApp.offEvent(event, handler);
}
