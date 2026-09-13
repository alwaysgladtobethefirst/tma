import { useBackButton } from './useBackButton';
import type { BackButtonOptions } from './useBackButton.types';

/**
 * The back arrow in Telegram's header, shown for as long as this is mounted.
 * Renders nothing — the Telegram client draws it.
 */
export function BackButton(props: BackButtonOptions) {
  useBackButton(props);

  return null;
}
