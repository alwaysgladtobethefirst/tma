// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createButtonStub, installWebApp } from '../../test/web-app-stub';
import { BackButton } from './BackButton';
import { MainButton } from './MainButton';
import { SecondaryButton } from './SecondaryButton';
import { SettingsButton } from './SettingsButton';
import { TmaProvider } from './TmaProvider';

const noop = () => {};

const CASES: Array<[name: string, mount: () => ReactElement]> = [
  ['MainButton', () => <MainButton text="Save" onClick={noop} />],
  ['SecondaryButton', () => <SecondaryButton text="Cancel" onClick={noop} />],
  ['BackButton', () => <BackButton onClick={noop} />],
  ['SettingsButton', () => <SettingsButton onClick={noop} />],
];

function installEveryButton() {
  const stubs = {
    MainButton: createButtonStub(),
    SecondaryButton: createButtonStub(),
    BackButton: createButtonStub(),
    SettingsButton: createButtonStub(),
  };

  installWebApp({
    MainButton: stubs.MainButton.button,
    SecondaryButton: stubs.SecondaryButton.button,
    BackButton: stubs.BackButton.button,
    SettingsButton: stubs.SettingsButton.button,
  } as never);

  return stubs;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('button components', () => {
  it.each(CASES)('%s drives its own button and touches no other', (name, mount) => {
    const stubs = installEveryButton();

    render(<TmaProvider>{mount()}</TmaProvider>);

    const own = stubs[name as keyof typeof stubs].button;
    expect(own.setParams.mock.calls.length + own.show.mock.calls.length).toBeGreaterThan(0);

    for (const [other, stub] of Object.entries(stubs)) {
      if (other === name) continue;
      expect(stub.button.setParams).not.toHaveBeenCalled();
      expect(stub.button.show).not.toHaveBeenCalled();
    }
  });

  it.each(CASES)('%s puts nothing in the DOM', (_name, mount) => {
    installEveryButton();

    const { container } = render(<TmaProvider>{mount()}</TmaProvider>);

    expect(container.innerHTML).toBe('');
  });
});
