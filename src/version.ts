/**
 * Compares two Bot API version strings the way the Telegram client does:
 * split on `.`, walk each segment as an integer (missing or unparseable → 0),
 * first differing segment decides.
 *
 * @returns `true` if `current` is the same as or newer than `target`.
 *
 * @example
 * isAtLeast('7.10', '7.9') // true — minor 10 is newer than minor 9
 * isAtLeast(getWebApp()?.version ?? '0', '8.0')
 */
export function isAtLeast(current: string, target: string): boolean {
  const a = current.trim().split('.');
  const b = target.trim().split('.');

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = Number.parseInt(a[i] ?? '', 10) || 0;
    const y = Number.parseInt(b[i] ?? '', 10) || 0;
    if (x !== y) return x > y;
  }

  return true;
}
