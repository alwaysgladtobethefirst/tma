import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` in a browser, `useEffect` on a server.
 *
 * Layout effects run before the browser paints, which is what you want for
 * keeping a ref in step with the latest render — a passive effect leaves a
 * gap where an event arriving between commit and effect would reach the
 * previous render's handler. React warns that layout effects do nothing
 * during a server render, though, and this layer is meant to survive one.
 */
export const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;
