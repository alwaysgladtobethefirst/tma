/** What `useMainButton` and `<MainButton>` accept. Mounting shows the button; unmounting puts it away. */
export interface BottomButtonOptions {
  text: string;
  onClick: () => void;
  /** `#RRGGBB`. Defaults to whatever the user's theme says. */
  color?: string;
  /** `#RRGGBB`. Defaults to whatever the user's theme says. */
  textColor?: string;
  /** A disabled button is still visible, just not pressable. Defaults to `true`. */
  isActive?: boolean;
  hasShineEffect?: boolean;
  /** Swaps the label for a spinner while something is in flight. Defaults to `false`. */
  isProgressVisible?: boolean;
}
