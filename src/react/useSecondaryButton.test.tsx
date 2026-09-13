// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createButtonStub, installWebApp } from '../../test/web-app-stub';
import { TmaProvider } from './TmaProvider';
import { useSecondaryButton } from './useSecondaryButton';

function installSecondaryButton() {
  const secondary = createButtonStub();
  const main = createButtonStub();
  installWebApp({ SecondaryButton: secondary.button as never, MainButton: main.button as never });

  return { secondary, main };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useSecondaryButton', () => {
  it('drives the secondary button, leaving the main one alone', () => {
    const { secondary, main } = installSecondaryButton();

    renderHook(() => useSecondaryButton({ text: 'Cancel', onClick: vi.fn() }), {
      wrapper: TmaProvider,
    });

    expect(secondary.button.setParams).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Cancel', is_visible: true }),
    );
    expect(main.button.setParams).not.toHaveBeenCalled();
  });

  it('passes position through, which only this button has', () => {
    const { secondary } = installSecondaryButton();

    renderHook(() => useSecondaryButton({ text: 'Cancel', onClick: vi.fn(), position: 'right' }), {
      wrapper: TmaProvider,
    });

    expect(secondary.button.setParams).toHaveBeenCalledWith(
      expect.objectContaining({ position: 'right' }),
    );
  });

  it('calls the handler when Telegram reports a press', () => {
    const { secondary } = installSecondaryButton();
    const onClick = vi.fn();

    renderHook(() => useSecondaryButton({ text: 'Cancel', onClick }), { wrapper: TmaProvider });
    secondary.click();

    expect(onClick).toHaveBeenCalledOnce();
  });
});
