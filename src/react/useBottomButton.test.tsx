// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createButtonStub, installWebApp } from '../../test/web-app-stub';
import { TmaProvider } from './TmaProvider';
import { useBottomButton } from './useBottomButton';

function installMainButton() {
  const main = createButtonStub();
  installWebApp({ MainButton: main.button as never });

  return main;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useBottomButton', () => {
  it('maps position through only when given, since only the secondary button uses it', () => {
    const main = installMainButton();

    renderHook(() => useBottomButton('test', 'MainButton', { text: 'Save', onClick: vi.fn() }), {
      wrapper: TmaProvider,
    });

    expect(main.button.setParams).toHaveBeenCalledWith(
      expect.not.objectContaining({ position: expect.anything() }),
    );
  });

  it('shows progress instead of hiding it when asked', () => {
    const main = installMainButton();

    renderHook(
      () =>
        useBottomButton('test', 'MainButton', {
          text: 'Save',
          onClick: vi.fn(),
          isProgressVisible: true,
        }),
      { wrapper: TmaProvider },
    );

    expect(main.button.showProgress).toHaveBeenCalled();
    expect(main.button.hideProgress).not.toHaveBeenCalled();
  });

  it('defaults isActive to true and isProgressVisible to false', () => {
    const main = installMainButton();

    renderHook(() => useBottomButton('test', 'MainButton', { text: 'Save', onClick: vi.fn() }), {
      wrapper: TmaProvider,
    });

    expect(main.button.setParams).toHaveBeenCalledWith(
      expect.objectContaining({ is_active: true }),
    );
    expect(main.button.hideProgress).toHaveBeenCalled();
  });

  it('calls the imperative enable/disable pair, not just is_active in setParams', () => {
    const main = installMainButton();

    const { rerender } = renderHook(
      ({ isActive }) =>
        useBottomButton('test', 'MainButton', { text: 'Save', onClick: vi.fn(), isActive }),
      { wrapper: TmaProvider, initialProps: { isActive: false } },
    );

    expect(main.button.disable).toHaveBeenCalledOnce();
    expect(main.button.enable).not.toHaveBeenCalled();

    rerender({ isActive: true });

    expect(main.button.enable).toHaveBeenCalledOnce();
  });

  it('calls the latest onClick without resubscribing when it changes', () => {
    const main = installMainButton();
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = renderHook(
      ({ onClick }) => useBottomButton('test', 'MainButton', { text: 'Save', onClick }),
      { wrapper: TmaProvider, initialProps: { onClick: first } },
    );
    rerender({ onClick: second });
    main.click();

    expect(main.listenerCount()).toBe(1);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it('hides and lets go of the click when it goes away', () => {
    const main = installMainButton();
    const { unmount } = renderHook(
      () => useBottomButton('test', 'MainButton', { text: 'Save', onClick: vi.fn() }),
      { wrapper: TmaProvider },
    );

    unmount();

    expect(main.button.hide).toHaveBeenCalled();
    expect(main.listenerCount()).toBe(0);
  });
});
