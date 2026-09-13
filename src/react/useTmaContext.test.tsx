// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useBackButton } from './useBackButton';
import { useContentSafeArea } from './useContentSafeArea';
import { useFullscreen } from './useFullscreen';
import { useInitData } from './useInitData';
import { useIsActive } from './useIsActive';
import { useMainButton } from './useMainButton';
import { useSafeArea } from './useSafeArea';
import { useSecondaryButton } from './useSecondaryButton';
import { useSettingsButton } from './useSettingsButton';
import { useTheme } from './useTheme';
import { useViewport } from './useViewport';
import { useWebApp } from './useWebApp';
import { useWebAppEvent } from './useWebAppEvent';

const noop = () => {};

// every hook passes its own name as a string, so a copied line would report the wrong hook
const HOOKS: Array<[name: string, use: () => unknown]> = [
  ['useBackButton', () => useBackButton({ onClick: noop })],
  ['useContentSafeArea', () => useContentSafeArea()],
  ['useFullscreen', () => useFullscreen()],
  ['useInitData', () => useInitData()],
  ['useIsActive', () => useIsActive()],
  ['useMainButton', () => useMainButton({ text: 'Save', onClick: noop })],
  ['useSafeArea', () => useSafeArea()],
  ['useSecondaryButton', () => useSecondaryButton({ text: 'Cancel', onClick: noop })],
  ['useSettingsButton', () => useSettingsButton({ onClick: noop })],
  ['useTheme', () => useTheme()],
  ['useViewport', () => useViewport()],
  ['useWebApp', () => useWebApp()],
  ['useWebAppEvent', () => useWebAppEvent('themeChanged', () => {})],
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('useTmaContext', () => {
  it.each(HOOKS)('%s names itself when no provider is above it', (name, use) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(use)).toThrow(`${name}() needs a <TmaProvider> above it in the tree.`);
  });
});
