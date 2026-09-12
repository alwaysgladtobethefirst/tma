import type { CSSProperties, PointerEventHandler, ReactElement } from 'react';
import type { ImpactStyle } from '../web-app.types';

/** The bits of its child `<Tappable>` reads, so it can put them back alongside its own. */
export interface TappableChildProps {
  style?: CSSProperties;
  disabled?: boolean;
  'aria-disabled'?: boolean | 'true' | 'false';
  onPointerDown?: PointerEventHandler<HTMLElement>;
  onPointerMove?: PointerEventHandler<HTMLElement>;
  onPointerUp?: PointerEventHandler<HTMLElement>;
  onPointerCancel?: PointerEventHandler<HTMLElement>;
}

export interface TappableProps {
  /** Exactly one element. It is handed back with the behaviour attached, not wrapped in anything. */
  children: ReactElement<TappableChildProps>;
  /** Which haptic a press gives. `false` to stay silent. Defaults to `'selection'`. */
  haptic?: 'selection' | ImpactStyle | false;
}
