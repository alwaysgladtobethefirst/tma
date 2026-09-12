import { getWebApp } from '../web-app';
import type { WebApp } from '../web-app.types';
import { useRequireTmaProvider } from './TmaProvider';

/**
 * The raw `WebApp` object, or `undefined` outside Telegram — the escape
 * hatch for anything this layer doesn't wrap yet. Not reactive: Telegram
 * injects `WebApp` before your code runs and never swaps the object, so
 * there's nothing to subscribe to. Reach for the state hooks instead when
 * you want to re-render on a change.
 */
export function useWebApp(): WebApp | undefined {
  useRequireTmaProvider('useWebApp');
  return getWebApp();
}
