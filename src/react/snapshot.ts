/**
 * Compares two snapshots by structure rather than identity.
 *
 * Reading `WebApp` builds a fresh object every time, so identity always
 * differs; and Telegram is free to mutate something like `themeParams` in
 * place rather than replace it, so comparing nested objects by reference
 * would miss real changes. Both failure modes are invisible until they
 * either re-render forever or never re-render at all.
 */
export function isSameSnapshot(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;

  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;

  return keys.every((key) =>
    isSameSnapshot((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
  );
}
