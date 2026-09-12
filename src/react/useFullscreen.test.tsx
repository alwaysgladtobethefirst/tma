// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installEventfulWebApp } from '../../test/web-app-stub';
import { TmaProvider } from './TmaProvider';
import { useFullscreen } from './useFullscreen';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useFullscreen', () => {
  it('reports whether the Mini App is currently fullscreen', () => {
    installEventfulWebApp({ isFullscreen: true });

    const { result } = renderHook(() => useFullscreen(), { wrapper: TmaProvider });

    expect(result.current).toBe(true);
  });

  it('is undefined outside Telegram', () => {
    const { result } = renderHook(() => useFullscreen(), { wrapper: TmaProvider });

    expect(result.current).toBeUndefined();
  });

  it('follows the change', () => {
    const { stub, emit } = installEventfulWebApp({ isFullscreen: false });
    const { result } = renderHook(() => useFullscreen(), { wrapper: TmaProvider });

    act(() => {
      Object.assign(stub, { isFullscreen: true });
      emit('fullscreenChanged');
    });

    expect(result.current).toBe(true);
  });
});
