// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installEventfulWebApp } from '../../test/web-app-stub';
import { TmaProvider } from './TmaProvider';
import { useSafeArea } from './useSafeArea';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useSafeArea', () => {
  it('reads the inset the device itself imposes', () => {
    installEventfulWebApp({ safeAreaInset: { top: 44, bottom: 34, left: 0, right: 0 } });

    const { result } = renderHook(() => useSafeArea(), { wrapper: TmaProvider });

    expect(result.current).toEqual({ top: 44, bottom: 34, left: 0, right: 0 });
  });

  it('is undefined outside Telegram', () => {
    const { result } = renderHook(() => useSafeArea(), { wrapper: TmaProvider });

    expect(result.current).toBeUndefined();
  });

  it('re-reads when the inset changes', () => {
    const { stub, emit } = installEventfulWebApp({
      safeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    const { result } = renderHook(() => useSafeArea(), { wrapper: TmaProvider });

    act(() => {
      Object.assign(stub, { safeAreaInset: { top: 59, bottom: 34, left: 0, right: 0 } });
      emit('safeAreaChanged');
    });

    expect(result.current?.top).toBe(59);
  });
});
