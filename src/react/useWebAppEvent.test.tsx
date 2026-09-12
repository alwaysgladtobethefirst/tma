// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installEventfulWebApp } from '../../test/web-app-stub';
import { TmaProvider } from './TmaProvider';
import { useWebAppEvent } from './useWebAppEvent';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useWebAppEvent', () => {
  it('calls the handler when the event fires', () => {
    const { emit } = installEventfulWebApp();
    const handler = vi.fn();
    renderHook(() => useWebAppEvent('themeChanged', handler), { wrapper: TmaProvider });

    act(() => {
      emit('themeChanged');
    });

    expect(handler).toHaveBeenCalledOnce();
  });

  it('hands the payload to the handler', () => {
    const { emit } = installEventfulWebApp();
    const handler = vi.fn();
    renderHook(() => useWebAppEvent('viewportChanged', handler), { wrapper: TmaProvider });

    act(() => {
      emit('viewportChanged', { isStateStable: true });
    });

    expect(handler).toHaveBeenCalledWith({ isStateStable: true });
  });

  it('stays on one subscription when the handler identity changes, and calls the newest one', () => {
    const { emit, listenerCount } = installEventfulWebApp();
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = renderHook(({ handler }) => useWebAppEvent('themeChanged', handler), {
      wrapper: TmaProvider,
      initialProps: { handler: first },
    });
    rerender({ handler: second });
    act(() => {
      emit('themeChanged');
    });

    expect(listenerCount('themeChanged')).toBe(1);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it('unsubscribes when the component goes away', () => {
    const { listenerCount } = installEventfulWebApp();
    const { unmount } = renderHook(() => useWebAppEvent('themeChanged', vi.fn()), {
      wrapper: TmaProvider,
    });

    unmount();

    expect(listenerCount('themeChanged')).toBe(0);
  });

  it('does nothing outside Telegram instead of throwing', () => {
    expect(() =>
      renderHook(() => useWebAppEvent('themeChanged', vi.fn()), { wrapper: TmaProvider }),
    ).not.toThrow();
  });
});
