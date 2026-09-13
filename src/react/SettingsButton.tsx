import { useSettingsButton } from './useSettingsButton';
import type { SettingsButtonOptions } from './useSettingsButton.types';

/**
 * The settings entry in the menu Telegram draws around the Mini App, shown
 * for as long as this is mounted. Renders nothing — the Telegram client
 * draws it.
 */
export function SettingsButton(props: SettingsButtonOptions) {
  useSettingsButton(props);

  return null;
}
