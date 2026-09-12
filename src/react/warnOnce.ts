/** Declared rather than imported: this package pulls in no Node types, and `process` is absent in a plain browser. */
declare const process: { env?: { NODE_ENV?: string } } | undefined;

const alreadyWarned = new Set<string>();

/** Absent `process` counts as development: the case it can't tell apart is an unbundled browser build, where a developer wondering why nothing works is the likelier reader. */
function isProductionBuild(): boolean {
  return typeof process !== 'undefined' && process?.env?.NODE_ENV === 'production';
}

/**
 * Says something to the console once per page load, in development only.
 *
 * Once per page load rather than once per mount: React mounts components
 * twice under StrictMode, and a doubled warning reads like a bug in this
 * package rather than a note about the environment.
 */
export function warnOnce(key: string, message: string): void {
  if (alreadyWarned.has(key) || isProductionBuild()) return;

  alreadyWarned.add(key);
  console.warn(message);
}
