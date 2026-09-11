import { afterEach, describe, expect, it, vi } from 'vitest';
import { expand, getWebApp, isMiniApp, on, ready, supportsVersion } from './web-app';
import type { WebApp } from './web-app.types';

function installWebApp(webApp: Partial<WebApp>) {
  vi.stubGlobal('window', { Telegram: { WebApp: webApp } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getWebApp', () => {
  it('is undefined outside Telegram', () => {
    expect(getWebApp()).toBeUndefined();
  });

  it('returns the exact object installed on window.Telegram.WebApp', () => {
    const webApp: Partial<WebApp> = { version: '8.0' };
    installWebApp(webApp);
    expect(getWebApp()).toBe(webApp);
  });

  it('reads fresh rather than caching the first read', () => {
    installWebApp({ version: '8.0' });
    getWebApp();

    const replacement: Partial<WebApp> = { version: '9.0' };
    installWebApp(replacement);
    expect(getWebApp()).toBe(replacement);
  });
});

describe('isMiniApp', () => {
  it('is false outside Telegram', () => {
    expect(isMiniApp()).toBe(false);
  });

  it('is true once WebApp is present on window', () => {
    installWebApp({});
    expect(isMiniApp()).toBe(true);
  });
});

describe('ready', () => {
  it('does nothing outside Telegram', () => {
    expect(() => ready()).not.toThrow();
  });

  it('calls WebApp.ready()', () => {
    const readyMock = vi.fn();
    installWebApp({ ready: readyMock });
    ready();
    expect(readyMock).toHaveBeenCalledOnce();
  });
});

describe('on', () => {
  it('returns a no-op unsubscribe outside Telegram', () => {
    const unsubscribe = on('mainButtonClicked', () => {});
    expect(() => unsubscribe()).not.toThrow();
  });

  it('subscribes the handler to WebApp.onEvent under the given event name', () => {
    const onEvent = vi.fn();
    vi.stubGlobal('window', { Telegram: { WebApp: { onEvent, offEvent: vi.fn() } } });
    const handler = () => {};

    on('mainButtonClicked', handler);

    expect(onEvent).toHaveBeenCalledWith('mainButtonClicked', handler);
  });

  it('passes the event payload straight through to the handler', () => {
    let onEventHandler: ((payload: unknown) => void) | undefined;
    const onEvent = vi.fn((_event: string, handler: (payload: unknown) => void) => {
      onEventHandler = handler;
    });
    vi.stubGlobal('window', { Telegram: { WebApp: { onEvent, offEvent: vi.fn() } } });
    const handler = vi.fn();

    on('viewportChanged', handler);
    onEventHandler?.({ isStateStable: true });

    expect(handler).toHaveBeenCalledWith({ isStateStable: true });
  });

  it('unsubscribing calls WebApp.offEvent with the same event and handler', () => {
    const offEvent = vi.fn();
    vi.stubGlobal('window', { Telegram: { WebApp: { onEvent: vi.fn(), offEvent } } });
    const handler = () => {};

    const unsubscribe = on('mainButtonClicked', handler);
    unsubscribe();

    expect(offEvent).toHaveBeenCalledWith('mainButtonClicked', handler);
  });
});

describe('supportsVersion', () => {
  it('is false outside Telegram', () => {
    expect(supportsVersion('8.0')).toBe(false);
  });

  it('is true when the client version is at least the target', () => {
    installWebApp({ version: '8.1' });
    expect(supportsVersion('8.0')).toBe(true);
  });

  it('is false when the client version is below the target', () => {
    installWebApp({ version: '7.9' });
    expect(supportsVersion('8.0')).toBe(false);
  });
});

describe('expand', () => {
  it('does nothing outside Telegram', () => {
    expect(() => expand()).not.toThrow();
  });

  it('calls WebApp.expand()', () => {
    const expandMock = vi.fn();
    installWebApp({ expand: expandMock });
    expand();
    expect(expandMock).toHaveBeenCalledOnce();
  });
});
