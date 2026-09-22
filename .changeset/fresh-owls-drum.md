---
"@skrynnyk/tma": patch
---

Fix `<Tappable>` still firing a click after a drag-away release. Releasing pointer capture (0.3.1) wasn't enough on its own — the click still landed depending on how the browser retargets it, and a fast flick straight from inside to released-outside can skip the pointermove that would have caught it. The suppression is now enforced directly: pointerup checks the release position itself, and the click is swallowed in `<Tappable>`'s own click handler rather than left to browser retargeting.
