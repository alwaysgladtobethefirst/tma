// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installWebApp } from '../../test/web-app-stub';
import { TmaProvider } from './TmaProvider';
import { useInitData } from './useInitData';

const RAW = new URLSearchParams({
  auth_date: '1700000000',
  user: '{"id":1,"first_name":"Ada"}',
  hash: 'e6d2f0c1',
}).toString();

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useInitData', () => {
  it('returns the launch data of the current launch', () => {
    installWebApp({ initData: RAW });

    const { result } = renderHook(() => useInitData(), { wrapper: TmaProvider });

    expect(result.current?.user).toEqual({ id: 1, first_name: 'Ada' });
    expect(result.current?.auth_date).toBe(1700000000);
  });

  it('is undefined outside Telegram', () => {
    const { result } = renderHook(() => useInitData(), { wrapper: TmaProvider });

    expect(result.current).toBeUndefined();
  });

  it('parses once, handing back the same object on every render', () => {
    installWebApp({ initData: RAW });

    const { result, rerender } = renderHook(() => useInitData(), { wrapper: TmaProvider });
    const first = result.current;
    rerender();

    expect(result.current).toBe(first);
  });

  it('leaves a broken field out and reports it once per page load, not once per mount', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    installWebApp({
      initData: new URLSearchParams({
        auth_date: '1700000000',
        user: 'not json at all',
        hash: 'e6d2f0c1',
      }).toString(),
    });

    const first = renderHook(() => useInitData(), { wrapper: TmaProvider });
    expect(first.result.current?.auth_date).toBe(1700000000);
    expect(first.result.current?.user).toBeUndefined();

    cleanup();
    renderHook(() => useInitData(), { wrapper: TmaProvider });

    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toMatch(/user/);
  });
});
