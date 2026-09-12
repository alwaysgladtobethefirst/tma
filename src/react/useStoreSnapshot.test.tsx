// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installEventfulWebApp } from '../../test/web-app-stub';
import { TmaProvider } from './TmaProvider';
import { useTheme } from './useTheme';
import { useViewport } from './useViewport';

function ThemeReader() {
  useTheme();
  return null;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useStoreSnapshot', () => {
  it('wakes only the components reading what actually changed', () => {
    const { stub, emit } = installEventfulWebApp({
      colorScheme: 'light',
      themeParams: { bg_color: '#ffffff' },
      viewportHeight: 600,
      viewportStableHeight: 600,
      isExpanded: true,
    });

    let themeRenders = 0;
    let viewportRenders = 0;

    function CountedThemeReader() {
      themeRenders += 1;
      useTheme();
      return null;
    }

    function CountedViewportReader() {
      viewportRenders += 1;
      useViewport();
      return null;
    }

    render(
      <TmaProvider>
        <CountedThemeReader />
        <CountedViewportReader />
      </TmaProvider>,
    );
    const themeBefore = themeRenders;
    const viewportBefore = viewportRenders;

    act(() => {
      Object.assign(stub, { colorScheme: 'dark' });
      emit('themeChanged');
    });

    expect(themeRenders).toBeGreaterThan(themeBefore);
    expect(viewportRenders).toBe(viewportBefore);
  });

  it('puts every reader of the same state on one subscription, dropped when the last leaves', () => {
    const { listenerCount } = installEventfulWebApp({
      colorScheme: 'light',
      themeParams: { bg_color: '#ffffff' },
    });

    const { rerender, unmount } = render(
      <TmaProvider>
        <ThemeReader />
        <ThemeReader />
        <ThemeReader />
      </TmaProvider>,
    );
    expect(listenerCount('themeChanged')).toBe(1);

    rerender(
      <TmaProvider>
        <ThemeReader />
      </TmaProvider>,
    );
    expect(listenerCount('themeChanged')).toBe(1);

    unmount();
    expect(listenerCount('themeChanged')).toBe(0);
  });

  it('hands every reader the very same object, not just an equal one', () => {
    installEventfulWebApp({ colorScheme: 'dark', themeParams: { bg_color: '#000000' } });

    const seen: unknown[] = [];

    function Collector() {
      seen.push(useTheme());
      return null;
    }

    render(
      <TmaProvider>
        <Collector />
        <Collector />
      </TmaProvider>,
    );

    expect(seen).toHaveLength(2);
    expect(seen[0]).toBe(seen[1]);
  });

  it('subscribes again when every reader leaves and one comes back', () => {
    const { listenerCount } = installEventfulWebApp({
      colorScheme: 'light',
      themeParams: { bg_color: '#ffffff' },
    });

    const { rerender } = render(
      <TmaProvider>
        <ThemeReader />
      </TmaProvider>,
    );
    rerender(<TmaProvider>{null}</TmaProvider>);
    expect(listenerCount('themeChanged')).toBe(0);

    rerender(
      <TmaProvider>
        <ThemeReader />
      </TmaProvider>,
    );

    expect(listenerCount('themeChanged')).toBe(1);
  });
});
