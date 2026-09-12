import { useBottomButton } from './useBottomButton';
import type { SecondaryButtonOptions } from './useSecondaryButton.types';

/**
 * Drives Telegram's secondary button — the quieter one that sits beside the
 * main button. Mounting shows it; unmounting puts it away. No-op outside
 * Telegram.
 */
export function useSecondaryButton(options: SecondaryButtonOptions): void {
  useBottomButton('useSecondaryButton', 'SecondaryButton', options);
}
