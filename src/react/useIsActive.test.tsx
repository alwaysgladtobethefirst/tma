// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installEventfulWebApp } from '../../test/web-app-stub';
import { TmaProvider } from './TmaProvider';
import { useIsActive } from './useIsActive';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useIsActive', () => {
  it('reports whether the user is looking at the Mini App right now', () => {
    installEventfulWebApp({ isActive: true });

    const { result } = renderHook(() => useIsActive(), { wrapper: TmaProvider });

    expect(result.current).toBe(true);
  });

  it('is undefined outside Telegram', () => {
    const { result } = renderHook(() => useIsActive(), { wrapper: TmaProvider });

    expect(result.current).toBeUndefined();
  });

  it('follows both the going-away and the coming-back', () => {
    const { stub, emit } = installEventfulWebApp({ isActive: true });
    const { result } = renderHook(() => useIsActive(), { wrapper: TmaProvider });

    act(() => {
      Object.assign(stub, { isActive: false });
      emit('deactivated');
    });
    expect(result.current).toBe(false);

    act(() => {
      Object.assign(stub, { isActive: true });
      emit('activated');
    });
    expect(result.current).toBe(true);
  });

  it('unsubscribes from both events when the component goes away', () => {
    const { listenerCount } = installEventfulWebApp({ isActive: true });
    const { unmount } = renderHook(() => useIsActive(), { wrapper: TmaProvider });

    unmount();

    expect(listenerCount('activated')).toBe(0);
    expect(listenerCount('deactivated')).toBe(0);
  });
});
