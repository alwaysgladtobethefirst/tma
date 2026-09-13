import { afterEach, describe, expect, it, vi } from 'vitest';
import { createOwnershipRegistry } from './createOwnershipRegistry';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('claim', () => {
  it('reports 1 for the first owner', () => {
    const registry = createOwnershipRegistry();

    expect(registry.claim('MainButton')).toBe(1);
  });

  it('reports 2 for a second owner of the same button', () => {
    const registry = createOwnershipRegistry();
    registry.claim('MainButton');

    expect(registry.claim('MainButton')).toBe(2);
  });

  it('tracks each button name separately', () => {
    const registry = createOwnershipRegistry();
    registry.claim('MainButton');

    expect(registry.claim('BackButton')).toBe(1);
  });

  it('warns when a second owner shows up', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const registry = createOwnershipRegistry();
    registry.claim('MainButton');

    registry.claim('MainButton');

    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toMatch(/MainButton/);
  });
});

describe('release', () => {
  it('reports 0 once the only owner lets go', () => {
    const registry = createOwnershipRegistry();
    registry.claim('MainButton');

    expect(registry.release('MainButton')).toBe(0);
  });

  it('reports the remaining count while another owner is still there', () => {
    const registry = createOwnershipRegistry();
    registry.claim('MainButton');
    registry.claim('MainButton');

    expect(registry.release('MainButton')).toBe(1);
  });
});

describe('two independent registries', () => {
  it('each warns about its own conflict, instead of one silencing the other', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const first = createOwnershipRegistry();
    const second = createOwnershipRegistry();

    first.claim('MainButton');
    first.claim('MainButton');
    second.claim('MainButton');
    second.claim('MainButton');

    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('do not share ownership counts', () => {
    const first = createOwnershipRegistry();
    const second = createOwnershipRegistry();
    first.claim('MainButton');

    expect(second.claim('MainButton')).toBe(1);
  });
});
