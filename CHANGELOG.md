# @skrynnyk/tma

## 0.3.3

### Patch Changes

- 8462714: Fix `<Tappable>` swallowing a tap when the layout shifts under a finger that never moved. Whether a release counts as a drag-away is now judged against where the element was when the finger landed, not where it sits at release — a keyboard closing mid-press, say, used to push the button out from under a still finger and read as the finger leaving. A little wobble past the edge (10px) is forgiven too.

## 0.3.2

### Patch Changes

- 1be24ee: Fix `<Tappable>` still firing a click after a drag-away release. Releasing pointer capture (0.3.1) wasn't enough on its own — the click still landed depending on how the browser retargets it, and a fast flick straight from inside to released-outside can skip the pointermove that would have caught it. The suppression is now enforced directly: pointerup checks the release position itself, and the click is swallowed in `<Tappable>`'s own click handler rather than left to browser retargeting.

## 0.3.1

### Patch Changes

- 42564d3: Fix two press-state bugs in the React layer:
  
  - `<Tappable>` kept pointer capture on its child while a drag left its bounds, so the browser still fired a click when the finger lifted somewhere else entirely — capture is now released the moment the pointer leaves.
  - `useMainButton`/`useSecondaryButton` only ever pushed `is_active` through `setParams`, which some clients treat as cosmetic only; `enable()`/`disable()` are now called explicitly so an inactive button actually stops taking taps.

## 0.3.0

### Minor Changes

- fabcd0c: add the buttons telegram draws (`<MainButton>`, `<SecondaryButton>`, `<BackButton>`, `<SettingsButton>` and their hooks), a `<Tappable>` primitive that makes any child feel pressable, and haptics in the core

## 0.2.0

### Minor Changes

- f9fcd94: add the react layer: `<TmaProvider>` plus hooks for launch data, raw events, theme, viewport, safe areas, fullscreen and foreground state

## 0.1.1

### Patch Changes

- 31f2a80: document the node and browser version requirements for validateInitDataSignature
