// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createOwnershipRegistry } from './createOwnershipRegistry';
import { useButtonOwnership } from './useButtonOwnership';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('useButtonOwnership', () => {
  it('does not release while a second owner is still mounted', () => {
    const registry = createOwnershipRegistry();
    const release = vi.fn();
    renderHook(() => useButtonOwnership(registry, 'MainButton', release));
    const { unmount } = renderHook(() => useButtonOwnership(registry, 'MainButton', release));

    unmount();

    expect(release).not.toHaveBeenCalled();
  });

  it('releases once the last owner leaves', () => {
    const registry = createOwnershipRegistry();
    const release = vi.fn();
    const { unmount } = renderHook(() => useButtonOwnership(registry, 'MainButton', release));

    unmount();

    expect(release).toHaveBeenCalledOnce();
  });

  it('calls the latest release callback, not the one from mount', () => {
    const registry = createOwnershipRegistry();
    const first = vi.fn();
    const second = vi.fn();

    const { rerender, unmount } = renderHook(
      ({ release }) => useButtonOwnership(registry, 'MainButton', release),
      { initialProps: { release: first } },
    );
    rerender({ release: second });
    unmount();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it('tracks separate button names independently', () => {
    const registry = createOwnershipRegistry();
    const mainRelease = vi.fn();
    const backRelease = vi.fn();
    renderHook(() => useButtonOwnership(registry, 'MainButton', mainRelease));
    const { unmount } = renderHook(() => useButtonOwnership(registry, 'BackButton', backRelease));

    unmount();

    expect(backRelease).toHaveBeenCalledOnce();
    expect(mainRelease).not.toHaveBeenCalled();
  });
});
