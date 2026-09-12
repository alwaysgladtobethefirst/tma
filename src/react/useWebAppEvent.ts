import { useEffect, useRef } from 'react';
import { on } from '../web-app';
import type { EventHandler, EventPayload, EventType } from '../web-app.types';
import { useTmaContext } from './useTmaContext';

/**
 * Runs `handler` whenever Telegram fires `event`, for as long as the
 * component is mounted. No-op outside Telegram, like the core it wraps.
 *
 * The handler is read from a ref rather than subscribed to directly, so an
 * inline arrow function is fine: the subscription is made once and torn down
 * once, while the handler it calls is always the one from the latest render.
 * Passing a new function every render would otherwise churn the subscription.
 */
export function useWebAppEvent<E extends EventType>(event: E, handler: EventHandler<E>): void {
  useTmaContext('useWebAppEvent');

  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const forward = ((payload: EventPayload<E>) => {
      (handlerRef.current as (payload: EventPayload<E>) => void)(payload);
    }) as EventHandler<E>;

    return on(event, forward);
  }, [event]);
}
