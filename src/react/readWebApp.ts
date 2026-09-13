import { getWebApp } from '../web-app';
import type { WebApp } from '../web-app.types';

/** Reads through `read`, or reports `undefined` when there is no Telegram to read from. */
export function readWebApp<T>(read: (webApp: WebApp) => T): () => T | undefined {
  return () => {
    const webApp = getWebApp();

    return webApp === undefined ? undefined : read(webApp);
  };
}
