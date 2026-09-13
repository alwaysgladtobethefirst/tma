// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createButtonStub, installWebApp } from '../../test/web-app-stub';
import { TmaProvider } from './TmaProvider';
import { useSettingsButton } from './useSettingsButton';

function installSettingsButton() {
  const settings = createButtonStub();
  const back = createButtonStub();
  installWebApp({ SettingsButton: settings.button as never, BackButton: back.button as never });

  return { settings, back };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useSettingsButton', () => {
  it('shows its own button, leaving the back button alone', () => {
    const { settings, back } = installSettingsButton();

    renderHook(() => useSettingsButton({ onClick: vi.fn() }), { wrapper: TmaProvider });

    expect(settings.button.show).toHaveBeenCalled();
    expect(back.button.show).not.toHaveBeenCalled();
  });

  it('calls the handler when Telegram reports a press', () => {
    const { settings } = installSettingsButton();
    const onClick = vi.fn();

    renderHook(() => useSettingsButton({ onClick }), { wrapper: TmaProvider });
    settings.click();

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('hides the button when it goes away', () => {
    const { settings } = installSettingsButton();
    const { unmount } = renderHook(() => useSettingsButton({ onClick: vi.fn() }), {
      wrapper: TmaProvider,
    });

    unmount();

    expect(settings.button.hide).toHaveBeenCalled();
  });
});
