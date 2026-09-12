import type { BottomButtonOptions } from './useBottomButton.types';
import { useMainButton } from './useMainButton';

/**
 * Telegram's main button, declared where the screen that owns it lives.
 * Renders nothing: the Telegram client draws the button itself, so this only
 * says what it should read and what a press means.
 */
export function MainButton(props: BottomButtonOptions) {
  useMainButton(props);

  return null;
}
