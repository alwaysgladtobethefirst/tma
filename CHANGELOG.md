# @skrynnyk/tma

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
