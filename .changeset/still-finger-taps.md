---
"@skrynnyk/tma": patch
---

Fix `<Tappable>` swallowing a tap when the layout shifts under a finger that never moved. Whether a release counts as a drag-away is now judged against where the element was when the finger landed, not where it sits at release — a keyboard closing mid-press, say, used to push the button out from under a still finger and read as the finger leaving. A little wobble past the edge (10px) is forgiven too.
