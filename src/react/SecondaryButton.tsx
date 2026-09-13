import { useSecondaryButton } from './useSecondaryButton';
import type { SecondaryButtonOptions } from './useSecondaryButton.types';

/**
 * Telegram's secondary button, the quieter one beside the main button.
 * Renders nothing — the Telegram client draws it.
 */
export function SecondaryButton(props: SecondaryButtonOptions) {
  useSecondaryButton(props);

  return null;
}
