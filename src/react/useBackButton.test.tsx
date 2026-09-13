// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createButtonStub, installWebApp } from '../../test/web-app-stub';
import { TmaProvider } from './TmaProvider';
import { useBackButton } from './useBackButton';

function installBackButton() {
  const back = createButtonStub();
  installWebApp({ BackButton: back.button as never });

  return back;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useBackButton', () => {
  it('shows the button while it is mounted', () => {
    const back = installBackButton();

    renderHook(() => useBackButton({ onClick: vi.fn() }), { wrapper: TmaProvider });

    expect(back.button.show).toHaveBeenCalled();
  });

  it('calls the latest handler without resubscribing', () => {
    const back = installBackButton();
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = renderHook(({ onClick }) => useBackButton({ onClick }), {
      wrapper: TmaProvider,
      initialProps: { onClick: first },
    });
    rerender({ onClick: second });
    back.click();

    expect(back.listenerCount()).toBe(1);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it('hides the button and lets go of the click when it goes away', () => {
    const back = installBackButton();
    const { unmount } = renderHook(() => useBackButton({ onClick: vi.fn() }), {
      wrapper: TmaProvider,
    });

    unmount();

    expect(back.button.hide).toHaveBeenCalled();
    expect(back.listenerCount()).toBe(0);
  });

  it('does nothing outside Telegram instead of throwing', () => {
    expect(() =>
      renderHook(() => useBackButton({ onClick: vi.fn() }), { wrapper: TmaProvider }),
    ).not.toThrow();
  });
});
