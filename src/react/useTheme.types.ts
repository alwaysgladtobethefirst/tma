import type { ColorScheme, ThemeParams } from '../web-app.types';

/** The theme Telegram is drawing the Mini App in, as `useTheme` reports it. */
export interface Theme {
  colorScheme: ColorScheme;
  themeParams: ThemeParams;
}
