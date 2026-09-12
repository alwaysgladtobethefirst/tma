// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installEventfulWebApp } from '../../test/web-app-stub';
import { TmaProvider } from './TmaProvider';
import { useViewport } from './useViewport';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useViewport', () => {
  it('reads the visible area and how much of the screen it takes', () => {
    installEventfulWebApp({
      viewportHeight: 600,
      viewportStableHeight: 600,
      isExpanded: true,
    });

    const { result } = renderHook(() => useViewport(), { wrapper: TmaProvider });

    expect(result.current).toEqual({
      height: 600,
      stableHeight: 600,
      isExpanded: true,
      isStateStable: true,
    });
  });

  it('is undefined outside Telegram', () => {
    const { result } = renderHook(() => useViewport(), { wrapper: TmaProvider });

    expect(result.current).toBeUndefined();
  });

  it('follows the height mid-gesture and says the value has not settled', () => {
    const { stub, emit } = installEventfulWebApp({
      viewportHeight: 300,
      viewportStableHeight: 300,
      isExpanded: false,
    });
    const { result } = renderHook(() => useViewport(), { wrapper: TmaProvider });

    act(() => {
      Object.assign(stub, { viewportHeight: 450 });
      emit('viewportChanged', { isStateStable: false });
    });

    expect(result.current?.height).toBe(450);
    expect(result.current?.stableHeight).toBe(300);
    expect(result.current?.isStateStable).toBe(false);
  });

  it('says the value has settled once the gesture ends', () => {
    const { stub, emit } = installEventfulWebApp({
      viewportHeight: 300,
      viewportStableHeight: 300,
      isExpanded: false,
    });
    const { result } = renderHook(() => useViewport(), { wrapper: TmaProvider });

    act(() => {
      Object.assign(stub, { viewportHeight: 450 });
      emit('viewportChanged', { isStateStable: false });
    });
    act(() => {
      Object.assign(stub, { viewportStableHeight: 450, isExpanded: true });
      emit('viewportChanged', { isStateStable: true });
    });

    expect(result.current).toEqual({
      height: 450,
      stableHeight: 450,
      isExpanded: true,
      isStateStable: true,
    });
  });

  it('hands back the very same snapshot when nothing actually moved', () => {
    const { emit } = installEventfulWebApp({
      viewportHeight: 600,
      viewportStableHeight: 600,
      isExpanded: true,
    });
    const { result } = renderHook(() => useViewport(), { wrapper: TmaProvider });
    const before = result.current;

    act(() => {
      emit('viewportChanged', { isStateStable: true });
    });

    expect(result.current).toBe(before);
  });
});
