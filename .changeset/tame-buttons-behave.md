---
"@skrynnyk/tma": patch
---

Fix two press-state bugs in the React layer:

- `<Tappable>` kept pointer capture on its child while a drag left its bounds, so the browser still fired a click when the finger lifted somewhere else entirely — capture is now released the moment the pointer leaves.
- `useMainButton`/`useSecondaryButton` only ever pushed `is_active` through `setParams`, which some clients treat as cosmetic only; `enable()`/`disable()` are now called explicitly so an inactive button actually stops taking taps.
