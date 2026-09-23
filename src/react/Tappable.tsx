import {
  Children,
  type CSSProperties,
  cloneElement,
  type MouseEvent,
  type PointerEvent,
  useRef,
  useState,
} from 'react';
import { impactOccurred, selectionChanged } from '../haptics';
import type { TappableChildProps, TappableProps } from './Tappable.types';

const SLOP_PX = 10;

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function isInside(event: PointerEvent<HTMLElement>, rect: Rect): boolean {
  return (
    event.clientX >= rect.left - SLOP_PX &&
    event.clientX <= rect.right + SLOP_PX &&
    event.clientY >= rect.top - SLOP_PX &&
    event.clientY <= rect.bottom + SLOP_PX
  );
}

type Haptic = NonNullable<TappableProps['haptic']>;

function triggerHaptic(haptic: Haptic): void {
  if (haptic === 'selection') {
    selectionChanged();
  } else if (haptic !== false) {
    impactOccurred(haptic);
  }
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
  const pressRect = useRef<Rect>({ left: 0, right: 0, top: 0, bottom: 0 });
  const suppressClick = useRef(false);

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

    suppressClick.current = false;
    const { left, right, top, bottom } = event.currentTarget.getBoundingClientRect();
    pressRect.current = { left, right, top, bottom };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    activePointer.current = event.pointerId;
    setIsPressed(true);
    triggerHaptic(haptic);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>): void {
    childProps.onPointerMove?.(event);
    if (activePointer.current !== event.pointerId) return;

    const inside = isInside(event, pressRect.current);
    setIsPressed(inside);
    suppressClick.current = !inside;

    if (!inside) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>): void {
    childProps.onPointerUp?.(event);
    if (activePointer.current === event.pointerId && !isInside(event, pressRect.current)) {
      suppressClick.current = true;
    }
    release();
  }

  function handlePointerCancel(event: PointerEvent<HTMLElement>): void {
    childProps.onPointerCancel?.(event);
    suppressClick.current = true;
    release();
  }

  function handleClick(event: MouseEvent<HTMLElement>): void {
    if (suppressClick.current) {
      suppressClick.current = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    childProps.onClick?.(event);
  }

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
    onClick: handleClick,
  } as TappableChildProps);
}
