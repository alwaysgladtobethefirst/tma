// @vitest-environment jsdom
import { cleanup, render, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installWebApp } from '../../test/web-app-stub';
import { TmaProvider } from './TmaProvider';
import { useWebApp } from './useWebApp';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('TmaProvider', () => {
  // these two run first: the warned-once flag is module-scoped and spent after one mount outside telegram
  it('does not warn when it finds Telegram', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    installWebApp({ ready: vi.fn() });

    render(<TmaProvider>app</TmaProvider>);

    expect(warn).not.toHaveBeenCalled();
  });

  it('warns once per page load when there is no Telegram to talk to', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<TmaProvider>app</TmaProvider>);
    cleanup();
    render(<TmaProvider>app</TmaProvider>);

    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toMatch(/TmaProvider/);
  });

  it('makes a hook throw, naming itself, when it is not mounted above it', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useWebApp())).toThrow(/useWebApp\(\) needs a <TmaProvider>/);
  });

  it('tells Telegram the Mini App is ready once it mounts', () => {
    const ready = vi.fn();
    installWebApp({ ready });

    render(<TmaProvider>app</TmaProvider>);

    expect(ready).toHaveBeenCalledOnce();
  });

  it('says it is ready once, not again on every render', () => {
    const ready = vi.fn();
    installWebApp({ ready });
    const { rerender } = render(<TmaProvider>app</TmaProvider>);

    rerender(<TmaProvider>app again</TmaProvider>);

    expect(ready).toHaveBeenCalledOnce();
  });

  it('never expands on its own: how much screen to take belongs to the app', () => {
    const expand = vi.fn();
    installWebApp({ expand });

    render(<TmaProvider>app</TmaProvider>);

    expect(expand).not.toHaveBeenCalled();
  });

  it('renders outside Telegram without throwing', () => {
    expect(() => render(<TmaProvider>app</TmaProvider>)).not.toThrow();
  });
});
