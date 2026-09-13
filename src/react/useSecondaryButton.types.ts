import type { BottomButtonPosition } from '../web-app.types';
import type { BottomButtonOptions } from './useBottomButton.types';

/** What `useSecondaryButton` and `<SecondaryButton>` accept: everything the main button takes, plus where it sits. */
export interface SecondaryButtonOptions extends BottomButtonOptions {
  /** Where it sits relative to the main button. Defaults to `'left'`. */
  position?: BottomButtonPosition;
}
