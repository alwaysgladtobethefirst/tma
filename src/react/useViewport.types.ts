/** The visible area of the Mini App, as `useViewport` reports it. */
export interface Viewport {
  /** The height right now. It moves continuously while the user drags the Mini App open or shut. */
  height: number;
  /** The last settled height. It does not move mid-gesture, which makes it the one to lay out against. */
  stableHeight: number;
  isExpanded: boolean;
  /** `false` while a gesture is still in flight, meaning `height` is on its way somewhere. */
  isStateStable: boolean;
}
