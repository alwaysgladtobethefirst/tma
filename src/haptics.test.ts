import { afterEach, describe, expect, it, vi } from 'vitest';
import { impactOccurred, notificationOccurred, selectionChanged } from './haptics';
import type { WebApp } from './web-app.types';

function installHaptics() {
  const HapticFeedback = {
    impactOccurred: vi.fn(),
    notificationOccurred: vi.fn(),
    selectionChanged: vi.fn(),
  };
  const webApp: Partial<WebApp> = { HapticFeedback } as unknown as Partial<WebApp>;
  vi.stubGlobal('window', { Telegram: { WebApp: webApp } });

  return HapticFeedback;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('impactOccurred', () => {
  it('does nothing outside Telegram', () => {
    expect(() => impactOccurred('medium')).not.toThrow();
  });

  it('passes the style straight through', () => {
    const haptics = installHaptics();

    impactOccurred('rigid');

    expect(haptics.impactOccurred).toHaveBeenCalledWith('rigid');
  });
});

describe('notificationOccurred', () => {
  it('does nothing outside Telegram', () => {
    expect(() => notificationOccurred('success')).not.toThrow();
  });

  it('passes the type straight through', () => {
    const haptics = installHaptics();

    notificationOccurred('error');

    expect(haptics.notificationOccurred).toHaveBeenCalledWith('error');
  });
});

describe('selectionChanged', () => {
  it('does nothing outside Telegram', () => {
    expect(() => selectionChanged()).not.toThrow();
  });

  it('tells Telegram the selection changed', () => {
    const haptics = installHaptics();

    selectionChanged();

    expect(haptics.selectionChanged).toHaveBeenCalledOnce();
  });
});
