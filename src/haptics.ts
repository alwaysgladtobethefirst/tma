import { getWebApp } from './web-app';
import type { ImpactStyle, NotificationType } from './web-app.types';

/**
 * Tells the user's device something collided or moved. `style` says how
 * heavy the collision should feel. No-op outside Telegram.
 *
 * These keep Telegram's own names rather than being rephrased, so what the
 * platform documents and what this package exports read the same.
 */
export function impactOccurred(style: ImpactStyle): void {
  getWebApp()?.HapticFeedback.impactOccurred(style);
}

/** Tells the user a task ended, and whether it went well. No-op outside Telegram. */
export function notificationOccurred(type: NotificationType): void {
  getWebApp()?.HapticFeedback.notificationOccurred(type);
}

/**
 * Tells the user a selection moved — the tick of a picker, a segment, a tab.
 * Deliberately quieter than `impactOccurred`: it's for changing a choice,
 * not for committing to one. No-op outside Telegram.
 */
export function selectionChanged(): void {
  getWebApp()?.HapticFeedback.selectionChanged();
}
