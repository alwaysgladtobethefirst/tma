import {
  Children,
  type CSSProperties,
  cloneElement,
  type PointerEvent,
  useRef,
  useState,
} from 'react';
import { impactOccurred, selectionChanged } from '../haptics';
import type { TappableChildProps, TappableProps } from './Tappable.types';

function isInside(event: PointerEvent<HTMLElement>): boolean {
  const { left, right, top, bottom } = event.currentTarget.getBoundingClientRect();

  return (
    event.clientX >= left &&
    event.clientX <= right &&
    event.clientY >= top &&
    event.clientY <= bottom
  );
}

/**
 * Makes its child feel like something you can press: a haptic tick on touch,
 * a `data-pressed` attribute while the finger is down, and the press let go
 * of when the finger slides away or the gesture turns into a scroll.
 *
 * It renders nothing of its own and ships no styles — how "pressed" should
 * look is the app's business, and `[data-pressed]` is the hook to style it
 * with. This package draws nothing.
 *
 * No `<TmaProvider>` needed: unlike the hooks, it reads nothing the provider
 * holds, and its haptics are quietly ignored outside Telegram.
 */
export function Tappable({ children, haptic = 'selection' }: TappableProps) {
  const [isPressed, setIsPressed] = useState(false);
  const activePointer = useRef<number | null>(null);

  const child = Children.only(children);
  const childProps: TappableChildProps = child.props;
  const isDisabled =
    childProps.disabled === true ||
    childProps['aria-disabled'] === true ||
    childProps['aria-disabled'] === 'true';

  function release(): void {
    activePointer.current = null;
    setIsPressed(false);
  }

  function handlePointerDown(event: PointerEvent<HTMLElement>): void {
    childProps.onPointerDown?.(event);
    if (isDisabled) return;

    // jsdom and older browsers have no pointer capture; without it a finger that leaves simply stops reporting
    event.currentTarget.setPointerCapture?.(event.pointerId);
    activePointer.current = event.pointerId;
    setIsPressed(true);

    if (haptic === 'selection') {
      selectionChanged();
    } else if (haptic !== false) {
      impactOccurred(haptic);
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>): void {
    childProps.onPointerMove?.(event);
    if (activePointer.current !== event.pointerId) return;

    setIsPressed(isInside(event));
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>): void {
    childProps.onPointerUp?.(event);
    release();
  }

  function handlePointerCancel(event: PointerEvent<HTMLElement>): void {
    childProps.onPointerCancel?.(event);
    release();
  }

  // the child's own style wins: this only fills in what it didn't say
  const style: CSSProperties = {
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none',
    ...childProps.style,
  };

  return cloneElement(child, {
    style,
    'data-pressed': isPressed ? '' : undefined,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
  } as TappableChildProps);
}
