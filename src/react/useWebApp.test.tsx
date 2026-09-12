// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installWebApp } from '../../test/web-app-stub';
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
});
