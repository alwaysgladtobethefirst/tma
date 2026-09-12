// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installEventfulWebApp } from '../../test/web-app-stub';
import type { WebApp } from '../web-app.types';
import { TmaProvider } from './TmaProvider';
import { useWebAppState } from './useWebAppState';

function readColorScheme(webApp: WebApp) {
  return webApp.colorScheme;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useWebAppState', () => {
  it('keeps one subscription even when the events array is rebuilt on every render', () => {
    const { listenerCount } = installEventfulWebApp({ colorScheme: 'light' });

    function Reader() {
      useWebAppState('useReader', ['themeChanged'], readColorScheme);
      return null;
    }

    const { rerender } = render(
      <TmaProvider>
        <Reader />
      </TmaProvider>,
    );
    expect(listenerCount('themeChanged')).toBe(1);

    rerender(
      <TmaProvider>
        <Reader />
      </TmaProvider>,
    );

    expect(listenerCount('themeChanged')).toBe(1);
  });

  it('moves the subscription when the events themselves change', () => {
    const { listenerCount } = installEventfulWebApp({ colorScheme: 'light' });

    function Reader({ events }: { events: Array<'themeChanged' | 'viewportChanged'> }) {
      useWebAppState('useReader', events, readColorScheme);
      return null;
    }

    const { rerender } = render(
      <TmaProvider>
        <Reader events={['themeChanged']} />
      </TmaProvider>,
    );
    rerender(
      <TmaProvider>
        <Reader events={['viewportChanged']} />
      </TmaProvider>,
    );

    expect(listenerCount('themeChanged')).toBe(0);
    expect(listenerCount('viewportChanged')).toBe(1);
  });
});
