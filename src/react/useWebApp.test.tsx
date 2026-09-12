// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { WebApp } from '../web-app.types';
import { TmaProvider } from './TmaProvider';
import { useWebApp } from './useWebApp';

function installWebApp(webApp: Partial<WebApp>) {
  vi.stubGlobal('Telegram', { WebApp: webApp });
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('useWebApp', () => {
  it('returns the WebApp object when running inside Telegram', () => {
    const webApp: Partial<WebApp> = { version: '8.0', ready: vi.fn() };
    installWebApp(webApp);

    const { result } = renderHook(() => useWebApp(), { wrapper: TmaProvider });

    expect(result.current).toBe(webApp);
  });
});
