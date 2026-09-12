import { type Mock, vi } from 'vitest';
import type { EventType, WebApp } from '../src/web-app.types';

/** Spelled out rather than inferred: the inferred shape names vitest internals, which the .d.ts build can't reference. */
interface ButtonStub {
  setParams: Mock;
  setText: Mock;
  show: Mock;
  hide: Mock;
  enable: Mock;
  disable: Mock;
  showProgress: Mock;
  hideProgress: Mock;
  onClick: Mock;
  offClick: Mock;
}

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

/**
 * A stub for one of the buttons Telegram draws. It records click
 * subscriptions so a test can fire the button and, more importantly, count
 * who is still listening — that's what shows a hook subscribed once and let
 * go on unmount.
 */
export function createButtonStub(): {
  button: ButtonStub;
  click: () => void;
  listenerCount: () => number;
} {
  const clicks = new Set<() => void>();

  const button: ButtonStub = {
    setParams: vi.fn(),
    setText: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    showProgress: vi.fn(),
    hideProgress: vi.fn(),
    onClick: vi.fn((cb: () => void) => {
      clicks.add(cb);
    }),
    offClick: vi.fn((cb: () => void) => {
      clicks.delete(cb);
    }),
  };

  return {
    button,
    click: () => {
      for (const cb of [...clicks]) cb();
    },
    listenerCount: () => clicks.size,
  };
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
