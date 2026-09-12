// @vitest-environment jsdom
import { cleanup, render, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createButtonStub, installWebApp } from '../../test/web-app-stub';
import { TmaProvider } from './TmaProvider';
import { useMainButton } from './useMainButton';

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

describe('useMainButton', () => {
  it('shows the button with the params it was given', () => {
    const main = installMainButton();

    renderHook(() => useMainButton({ text: 'Save', onClick: vi.fn() }), { wrapper: TmaProvider });

    expect(main.button.setParams).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Save', is_visible: true }),
    );
  });

  it('calls the latest onClick without resubscribing', () => {
    const main = installMainButton();
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = renderHook(({ onClick }) => useMainButton({ text: 'Save', onClick }), {
      wrapper: TmaProvider,
      initialProps: { onClick: first },
    });
    rerender({ onClick: second });
    main.click();

    expect(main.listenerCount()).toBe(1);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it('re-applies params when they change, still on one subscription', () => {
    const main = installMainButton();

    const { rerender } = renderHook(({ text }) => useMainButton({ text, onClick: vi.fn() }), {
      wrapper: TmaProvider,
      initialProps: { text: 'Save' },
    });
    rerender({ text: 'Send' });

    expect(main.button.setParams).toHaveBeenLastCalledWith(
      expect.objectContaining({ text: 'Send' }),
    );
    expect(main.listenerCount()).toBe(1);
  });

  it('hides the button and lets go of the click when it goes away', () => {
    const main = installMainButton();
    const { unmount } = renderHook(() => useMainButton({ text: 'Save', onClick: vi.fn() }), {
      wrapper: TmaProvider,
    });

    unmount();

    expect(main.button.hide).toHaveBeenCalled();
    expect(main.listenerCount()).toBe(0);
  });

  it('keeps the button while a second owner is still mounted, and warns once', () => {
    const main = installMainButton();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    function Owner({ text }: { text: string }) {
      useMainButton({ text, onClick: vi.fn() });
      return null;
    }

    const { rerender } = render(
      <TmaProvider>
        <Owner text="Old screen" />
        <Owner text="New screen" />
      </TmaProvider>,
    );

    expect(warn).toHaveBeenCalledOnce();
    expect(main.button.setParams).toHaveBeenLastCalledWith(
      expect.objectContaining({ text: 'New screen' }),
    );

    rerender(
      <TmaProvider>
        <Owner text="New screen" />
      </TmaProvider>,
    );

    expect(main.button.hide).not.toHaveBeenCalled();
  });

  it('does nothing outside Telegram instead of throwing', () => {
    expect(() =>
      renderHook(() => useMainButton({ text: 'Save', onClick: vi.fn() }), { wrapper: TmaProvider }),
    ).not.toThrow();
  });
});
