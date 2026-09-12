// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installEventfulWebApp, installWebApp } from '../../test/web-app-stub';
import { TmaProvider } from './TmaProvider';
import { useWebApp } from './useWebApp';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('useWebApp', () => {
  it('returns the WebApp object when running inside Telegram', () => {
    const webApp = installWebApp({ version: '8.0' });

    const { result } = renderHook(() => useWebApp(), { wrapper: TmaProvider });

    expect(result.current).toBe(webApp);
  });

  it('is undefined outside Telegram', () => {
    const { result } = renderHook(() => useWebApp(), { wrapper: TmaProvider });

    expect(result.current).toBeUndefined();
  });

  it('subscribes to nothing, because the object itself never changes', () => {
    const { listenerCount } = installEventfulWebApp({ version: '8.0' });

    renderHook(() => useWebApp(), { wrapper: TmaProvider });

    expect(listenerCount('themeChanged')).toBe(0);
    expect(listenerCount('viewportChanged')).toBe(0);
  });
});
