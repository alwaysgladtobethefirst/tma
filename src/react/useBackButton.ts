import type { BackButtonOptions } from './useBackButton.types';
import { useSimpleButton } from './useSimpleButton';

/**
 * Drives the back arrow Telegram draws in its header. Mounting shows it;
 * unmounting puts it away. No-op outside Telegram.
 *
 * Telegram won't navigate for you — pressing it only calls `onClick`, and
 * what "back" means is entirely up to your app.
 */
export function useBackButton({ onClick }: BackButtonOptions): void {
  useSimpleButton('useBackButton', 'BackButton', onClick);
}
