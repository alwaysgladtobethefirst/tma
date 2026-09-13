import type { SettingsButtonOptions } from './useSettingsButton.types';
import { useSimpleButton } from './useSimpleButton';

/**
 * Drives the settings entry Telegram offers in the menu it draws around the
 * Mini App. Mounting shows it; unmounting puts it away. No-op outside
 * Telegram.
 */
export function useSettingsButton({ onClick }: SettingsButtonOptions): void {
  useSimpleButton('useSettingsButton', 'SettingsButton', onClick);
}
