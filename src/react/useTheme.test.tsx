// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installEventfulWebApp } from '../../test/web-app-stub';
import { TmaProvider } from './TmaProvider';
import { useTheme } from './useTheme';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useTheme', () => {
  it('reads the theme Telegram is currently using', () => {
    installEventfulWebApp({ colorScheme: 'dark', themeParams: { bg_color: '#000000' } });

    const { result } = renderHook(() => useTheme(), { wrapper: TmaProvider });

    expect(result.current).toEqual({
      colorScheme: 'dark',
      themeParams: { bg_color: '#000000' },
    });
  });

  it('is undefined outside Telegram', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: TmaProvider });

    expect(result.current).toBeUndefined();
  });

  it('re-reads when Telegram says the theme changed', () => {
    const { stub, emit } = installEventfulWebApp({
      colorScheme: 'light',
      themeParams: { bg_color: '#ffffff' },
    });
    const { result } = renderHook(() => useTheme(), { wrapper: TmaProvider });

    act(() => {
      Object.assign(stub, { colorScheme: 'dark', themeParams: { bg_color: '#000000' } });
      emit('themeChanged');
    });

    expect(result.current?.colorScheme).toBe('dark');
    expect(result.current?.themeParams.bg_color).toBe('#000000');
  });

  it('hands back the very same snapshot when the event fires but nothing changed', () => {
    const { emit } = installEventfulWebApp({
      colorScheme: 'light',
      themeParams: { bg_color: '#ffffff' },
    });
    const { result } = renderHook(() => useTheme(), { wrapper: TmaProvider });
    const before = result.current;

    act(() => {
      emit('themeChanged');
    });

    expect(result.current).toBe(before);
  });

  it('unsubscribes when the component goes away', () => {
    const { listenerCount } = installEventfulWebApp({
      colorScheme: 'light',
      themeParams: { bg_color: '#ffffff' },
    });
    const { unmount } = renderHook(() => useTheme(), { wrapper: TmaProvider });

    unmount();

    expect(listenerCount('themeChanged')).toBe(0);
  });
});
