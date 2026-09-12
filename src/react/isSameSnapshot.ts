/** Deeper than any snapshot this layer builds, so reaching it means something unexpected arrived from Telegram. */
const MAX_DEPTH = 4;

/**
 * Compares two snapshots by structure rather than identity.
 *
 * Reading `WebApp` builds a fresh object every time, so identity always
 * differs; and Telegram is free to mutate something like `themeParams` in
 * place rather than replace it, so comparing nested objects by reference
 * would miss real changes. Both failure modes are invisible until they
 * either re-render forever or never re-render at all.
 *
 * Past `MAX_DEPTH` it reports "different" rather than recursing further: the
 * values come from outside this package, and a cycle or some pathological
 * shape should cost one extra re-render, not a blown stack.
 */
export function isSameSnapshot(a: unknown, b: unknown, depth = 0): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (depth >= MAX_DEPTH) return false;

  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;

  return keys.every((key) =>
    isSameSnapshot(
      (a as Record<string, unknown>)[key],
      (b as Record<string, unknown>)[key],
      depth + 1,
    ),
  );
}
