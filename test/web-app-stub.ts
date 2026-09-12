import { vi } from 'vitest';
import type { EventType, WebApp } from '../src/web-app.types';

/**
 * Puts a stub where `getWebApp()` looks, for the React layer's jsdom tests.
 * Stubs `Telegram` rather than `window` the way the core's own tests do:
 * replacing `window` would take the DOM React renders into with it.
 *
 * `ready` is stubbed by default because `<TmaProvider>` calls it on mount,
 * so every test that renders the provider would otherwise have to supply it.
 */
export function installWebApp(webApp: Partial<WebApp> = {}): Partial<WebApp> {
  const stub: Partial<WebApp> = { ready: vi.fn(), ...webApp };
  vi.stubGlobal('Telegram', { WebApp: stub });
  return stub;
}

type AnyHandler = (payload?: unknown) => void;

/**
 * A stub that really keeps track of its subscriptions, so a test can fire an
 * event and count who is still listening. `listenerCount` is what proves a
 * hook subscribed once rather than on every render, and unsubscribed when it
 * went away — neither of which is visible from the handler alone.
 */
export function installEventfulWebApp(webApp: Partial<WebApp> = {}) {
  const handlers = new Map<EventType, Set<AnyHandler>>();

  const stub = installWebApp({
    ...webApp,
    onEvent: ((event: EventType, handler: AnyHandler) => {
      const listeners = handlers.get(event) ?? new Set<AnyHandler>();
      listeners.add(handler);
      handlers.set(event, listeners);
    }) as WebApp['onEvent'],
    offEvent: ((event: EventType, handler: AnyHandler) => {
      handlers.get(event)?.delete(handler);
    }) as WebApp['offEvent'],
  });

  return {
    stub,
    emit(event: EventType, payload?: unknown): void {
      for (const handler of handlers.get(event) ?? []) handler(payload);
    },
    listenerCount(event: EventType): number {
      return handlers.get(event)?.size ?? 0;
    },
  };
}
