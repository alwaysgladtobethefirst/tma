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

// a finger is imprecise — this much wobble past the edge still counts as on it
const SLOP_PX = 10;

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

// judged against where the element was when the finger landed, not where it
// is now: if the layout shifts under a still finger (a keyboard closing, a
// line of text appearing above) the finger hasn't gone anywhere, and a live
// rect would wrongly read that as a drag-away and swallow the tap
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
  // true whenever the pressed pointer's last known position was outside the
  // element — releasing capture makes the browser retarget the click to
  // wherever the pointer actually is, which usually isn't back on this
  // element, but that's browser behavior we're relying on rather than
  // something this component controls, and a flick with no reported move
  // between "inside" and "released outside" skips it entirely. this flag is
  // the part actually enforced: handleClick swallows the click itself
  // whenever it's set, so the suppression doesn't depend on retargeting
  // happening to work out.
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
    // jsdom and older browsers have no pointer capture; without it a finger that leaves simply stops reporting
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
    // sliding back on re-arms the tap, same as the press-state itself does
    suppressClick.current = !inside;

    // release capture so a drag-away doesn't still fire this element's click
    if (!inside) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>): void {
    childProps.onPointerUp?.(event);
    // a flick straight from inside to released-outside can skip pointermove
    // entirely — this is the last chance to catch it before the click does
    if (activePointer.current === event.pointerId && !isInside(event, pressRect.current)) {
      suppressClick.current = true;
    }
    release();
  }

  function handlePointerCancel(event: PointerEvent<HTMLElement>): void {
    childProps.onPointerCancel?.(event);
    // a cancelled gesture (a scroll taking over) never completes as a tap
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
    onClick: handleClick,
  } as TappableChildProps);
}
