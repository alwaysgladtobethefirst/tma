// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installEventfulWebApp } from '../../test/web-app-stub';
import { TmaProvider } from './TmaProvider';
import { useContentSafeArea } from './useContentSafeArea';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useContentSafeArea', () => {
  it("reads the inset Telegram's own chrome imposes", () => {
    installEventfulWebApp({ contentSafeAreaInset: { top: 56, bottom: 0, left: 0, right: 0 } });

    const { result } = renderHook(() => useContentSafeArea(), { wrapper: TmaProvider });

    expect(result.current).toEqual({ top: 56, bottom: 0, left: 0, right: 0 });
  });

  it('is undefined outside Telegram', () => {
    const { result } = renderHook(() => useContentSafeArea(), { wrapper: TmaProvider });

    expect(result.current).toBeUndefined();
  });

  it('re-reads on its own event, not the device one', () => {
    const { stub, emit } = installEventfulWebApp({
      contentSafeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    const { result } = renderHook(() => useContentSafeArea(), { wrapper: TmaProvider });

    act(() => {
      Object.assign(stub, { contentSafeAreaInset: { top: 56, bottom: 0, left: 0, right: 0 } });
      emit('safeAreaChanged');
    });
    expect(result.current?.top).toBe(0);

    act(() => {
      emit('contentSafeAreaChanged');
    });
    expect(result.current?.top).toBe(56);
  });

  it('unsubscribes when the component goes away', () => {
    const { listenerCount } = installEventfulWebApp({
      contentSafeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    const { unmount } = renderHook(() => useContentSafeArea(), { wrapper: TmaProvider });

    unmount();

    expect(listenerCount('contentSafeAreaChanged')).toBe(0);
  });
});
