// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installEventfulWebApp } from '../../test/web-app-stub';
import { TmaProvider } from './TmaProvider';
import { useTheme } from './useTheme';
import { useViewport } from './useViewport';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useWebAppSnapshot', () => {
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

    function ThemeReader() {
      themeRenders += 1;
      useTheme();
      return null;
    }

    function ViewportReader() {
      viewportRenders += 1;
      useViewport();
      return null;
    }

    render(
      <TmaProvider>
        <ThemeReader />
        <ViewportReader />
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

  it('gives each reader of the same state its own subscription, and drops them one by one', () => {
    const { listenerCount } = installEventfulWebApp({
      colorScheme: 'light',
      themeParams: { bg_color: '#ffffff' },
    });

    function ThemeReader() {
      useTheme();
      return null;
    }

    const { rerender, unmount } = render(
      <TmaProvider>
        <ThemeReader />
        <ThemeReader />
      </TmaProvider>,
    );
    expect(listenerCount('themeChanged')).toBe(2);

    rerender(
      <TmaProvider>
        <ThemeReader />
      </TmaProvider>,
    );
    expect(listenerCount('themeChanged')).toBe(1);

    unmount();
    expect(listenerCount('themeChanged')).toBe(0);
  });
});
