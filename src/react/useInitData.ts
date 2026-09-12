import type { WebAppInitData } from '../web-app.types';
import { useTmaContext } from './TmaProvider';

/**
 * How this Mini App was opened, and by whom — or `undefined` outside
 * Telegram. Parsed once by the provider, so every consumer reads the same
 * object and it never changes while the Mini App runs.
 *
 * Fields that were present but unreadable are left out rather than guessed
 * at; the provider reports them to the console in development. Treat all of
 * this as untrusted until a backend has checked the launch data's `hash`.
 */
export function useInitData(): WebAppInitData | undefined {
  return useTmaContext('useInitData').launch?.data;
}
