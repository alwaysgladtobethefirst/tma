import { on } from '../web-app';
import type { EventHandler, EventType } from '../web-app.types';
import type { Listen } from './createWebAppStore.types';

/** Subscribes to Telegram once for the whole set, however many components are reading. */
export function fromEvents(events: readonly EventType[]): Listen {
  return (onChange) => {
    const unsubscribes = events.map((event) => on(event, onChange as EventHandler<EventType>));

    return () => {
      for (const unsubscribe of unsubscribes) unsubscribe();
    };
  };
}
