import { useBottomButton } from './useBottomButton';
import type { BottomButtonOptions } from './useBottomButton.types';

/**
 * Drives Telegram's main button — the big one at the bottom of the Mini App.
 * Mounting shows it; unmounting puts it away.
 *
 * Telegram draws the button itself, so nothing renders here: this only says
 * what the button should read and what happens when it's pressed. No-op
 * outside Telegram.
 */
export function useMainButton(options: BottomButtonOptions): void {
  useBottomButton('useMainButton', 'MainButton', options);
}
