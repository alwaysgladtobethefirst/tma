// @vitest-environment jsdom
import { act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installEventfulWebApp } from '../../test/web-app-stub';
import { TmaProvider } from './TmaProvider';
import { useTheme } from './useTheme';
import { useViewport } from './useViewport';

function Probe() {
  const theme = useTheme();
  const viewport = useViewport();

  return (
    <span>
      theme:{theme?.colorScheme ?? 'none'} height:{viewport?.height ?? 'none'}
    </span>
  );
}

const TREE = (
  <TmaProvider>
    <Probe />
  </TmaProvider>
);

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('server render', () => {
  it('reports the same absence a plain browser tab would, even with Telegram present', () => {
    installEventfulWebApp({
      colorScheme: 'dark',
      themeParams: { bg_color: '#000000' },
      viewportHeight: 600,
      viewportStableHeight: 600,
      isExpanded: true,
    });

    // react separates adjacent text nodes with empty comments
    const html = renderToString(TREE).replaceAll('<!-- -->', '');

    expect(html).toContain('theme:none');
    expect(html).toContain('height:none');
  });

  it('hydrates without a mismatch, then picks the real values up', async () => {
    installEventfulWebApp({
      colorScheme: 'dark',
      themeParams: { bg_color: '#000000' },
      viewportHeight: 600,
      viewportStableHeight: 600,
      isExpanded: true,
    });
    const container = document.createElement('div');
    container.innerHTML = renderToString(TREE);
    document.body.appendChild(container);
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      hydrateRoot(container, TREE);
    });

    expect(error).not.toHaveBeenCalled();
    expect(container.textContent).toContain('theme:dark');
    expect(container.textContent).toContain('height:600');
  });
});
