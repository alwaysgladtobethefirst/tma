// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useLatestRef } from './useLatestRef';

afterEach(() => {
  cleanup();
});

describe('useLatestRef', () => {
  it('starts out holding the value it was given', () => {
    const { result } = renderHook(() => useLatestRef('first'));

    expect(result.current.current).toBe('first');
  });

  it('holds the newest value after a rerender, not the one it was created with', () => {
    const { result, rerender } = renderHook(({ value }) => useLatestRef(value), {
      initialProps: { value: 'first' },
    });

    rerender({ value: 'second' });

    expect(result.current.current).toBe('second');
  });

  it('returns the same ref object across renders', () => {
    const { result, rerender } = renderHook(({ value }) => useLatestRef(value), {
      initialProps: { value: 'first' },
    });
    const first = result.current;

    rerender({ value: 'second' });

    expect(result.current).toBe(first);
  });
});
