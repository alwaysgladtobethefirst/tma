import { createContext, useContext, useEffect, useMemo } from 'react';
import { getInitData } from '../init-data';
import type { InitDataFieldWarning } from '../init-data.types';
import { isMiniApp, ready } from '../web-app';
import type { TmaContextValue, TmaProviderProps } from './TmaProvider.types';

/** Declared rather than imported: this package pulls in no Node types, and `process` is absent in a plain browser. */
declare const process: { env?: { NODE_ENV?: string } } | undefined;

/** `null` is "no provider above" — the one thing every hook checks before doing anything. */
const TmaContext = createContext<TmaContextValue | null>(null);

let hasWarnedOutsideTelegram = false;
let hasWarnedAboutLaunchData = false;

/** Absent `process` counts as development: the case it can't tell apart is an unbundled browser build, where a developer wondering why nothing works is the likelier reader. */
function isProductionBuild(): boolean {
  return typeof process !== 'undefined' && process?.env?.NODE_ENV === 'production';
}

/**
 * Says once, in development only, that there is no Telegram to talk to.
 * Once per page load rather than once per mount: React mounts the provider
 * twice under StrictMode, and a doubled warning reads like a bug in this
 * package rather than a note about the environment.
 */
function warnOutsideTelegram(): void {
  if (hasWarnedOutsideTelegram || isProductionBuild()) return;

  hasWarnedOutsideTelegram = true;
  console.warn(
    '<TmaProvider> is mounted outside Telegram: there is no window.Telegram.WebApp, so every hook reports `undefined` and every core call does nothing. This is expected in a plain browser tab.',
  );
}

/**
 * Reports launch-data fields that were present but unreadable. These never
 * reach `useInitData`, which would otherwise make a broken field and an
 * absent one look identical.
 */
function warnAboutLaunchData(warnings: InitDataFieldWarning[]): void {
  if (hasWarnedAboutLaunchData || warnings.length === 0 || isProductionBuild()) return;

  hasWarnedAboutLaunchData = true;
  const summary = warnings.map(({ field, reason }) => `${field} (${reason})`).join(', ');
  console.warn(`Some launch data fields could not be read and were left out: ${summary}.`);
}

/**
 * The root every hook in this layer needs above it. Mount it once, near the
 * top of the tree.
 *
 * Mounting tells Telegram the Mini App is ready to be shown. It deliberately
 * doesn't `expand()` as well: that's a choice about how much of the screen
 * to take, which belongs to the app, not to this package.
 */
export function TmaProvider({ children }: TmaProviderProps) {
  const launch = useMemo(() => getInitData(), []);
  const value = useMemo<TmaContextValue>(() => ({ launch }), [launch]);

  useEffect(() => {
    if (!isMiniApp()) {
      warnOutsideTelegram();
      return;
    }

    ready();
    if (launch) warnAboutLaunchData(launch.warnings);
  }, [launch]);

  return <TmaContext value={value}>{children}</TmaContext>;
}

/**
 * Everything the provider shares, or a thrown error naming the hook that
 * asked. Takes the caller's name so the message points at the hook the
 * developer actually wrote, not at this shared guard.
 */
export function useTmaContext(hookName: string): TmaContextValue {
  const value = useContext(TmaContext);
  if (value === null) {
    throw new Error(`${hookName}() needs a <TmaProvider> above it in the tree.`);
  }

  return value;
}
