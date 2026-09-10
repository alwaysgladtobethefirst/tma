import { describe, expect, it } from 'vitest';
import { isAtLeast } from './version';

describe('isAtLeast', () => {
  it('treats an equal version as at least the target', () => {
    expect(isAtLeast('8.0', '8.0')).toBe(true);
  });

  it('accepts a version above the target', () => {
    expect(isAtLeast('8.1', '8.0')).toBe(true);
  });

  it('compares minor segments as integers, not decimals', () => {
    expect(isAtLeast('7.10', '7.9')).toBe(true);
  });

  it('rejects a version below the target', () => {
    expect(isAtLeast('7.9', '8.0')).toBe(false);
  });

  it('ignores an extra segment when the shared segments already satisfy', () => {
    expect(isAtLeast('8.0.1', '8.0')).toBe(true);
  });

  it('treats a missing segment as zero', () => {
    expect(isAtLeast('8', '8.1')).toBe(false);
  });

  it('treats empty or unparseable input as 0.0', () => {
    expect(isAtLeast('', '8.0')).toBe(false);
    expect(isAtLeast('nonsense', '8.0')).toBe(false);
    expect(isAtLeast('8.0', '')).toBe(true);
  });

  it('tolerates surrounding whitespace', () => {
    expect(isAtLeast('  8.0  ', '8.0')).toBe(true);
  });
});
