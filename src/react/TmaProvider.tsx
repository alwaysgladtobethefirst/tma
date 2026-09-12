import { createContext, useContext, useEffect } from 'react';
import { isMiniApp, ready } from '../web-app';
import type { TmaProviderProps } from './TmaProvider.types';

/** Declared rather than imported: this package pulls in no Node types, and `process` is absent in a plain browser. */
declare const process: { env?: { NODE_ENV?: string } } | undefined;

/** Carries no state of its own — that lives in the stores hooks subscribe to. `false` means "no provider above". */
const TmaContext = createContext(false);

let hasWarnedOutsideTelegram = false;

/**
 * Says once, in development only, that there is no Telegram to talk to.
 * Once per page load rather than once per mount: React mounts the provider
 * twice under StrictMode, and a doubled warning reads like a bug in this
 * package rather than a note about the environment.
 */
function warnOutsideTelegram(): void {
  if (hasWarnedOutsideTelegram) return;
  if (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'production') return;

  hasWarnedOutsideTelegram = true;
  console.warn(
    '<TmaProvider> is mounted outside Telegram: there is no window.Telegram.WebApp, so every hook reports `undefined` and every core call does nothing. This is expected in a plain browser tab.',
  );
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
  useEffect(() => {
    if (isMiniApp()) {
      ready();
    } else {
      warnOutsideTelegram();
    }
  }, []);

  return <TmaContext value={true}>{children}</TmaContext>;
}

/**
 * Fails loudly when a hook is called without a `<TmaProvider>` above it.
 * Takes the caller's name so the error points at the hook the developer
 * actually wrote, not at this shared guard.
 */
export function useRequireTmaProvider(hookName: string): void {
  const hasProvider = useContext(TmaContext);
  if (!hasProvider) {
    throw new Error(`${hookName}() needs a <TmaProvider> above it in the tree.`);
  }
}
