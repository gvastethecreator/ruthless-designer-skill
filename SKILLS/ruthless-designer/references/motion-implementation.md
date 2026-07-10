# Motion Implementation Traps

Load this route only while implementing motion. It is not required for a static critique or for deciding whether motion belongs.

## Tooltips And Repeated Disclosure

Delay the first tooltip enough to avoid accidental hover noise, then skip or sharply reduce that delay while the pointer moves between neighboring tooltip triggers. Reset the grace period after leaving the group. Keep keyboard focus immediate, make content dismissible, and never force users to replay a fade while scanning a toolbar.

## Geometry And Identity

For SVG transforms, wrap the moving shape in a `<g>` when transform origins or mixed primitives fight the browser. Set and verify `transform-box: fill-box` plus the intended `transform-origin`; inspect the actual bounding box instead of guessing from the `viewBox`.

Give every shared-layout transition a unique, stable identity within its rendered scope. Duplicate layout IDs make unrelated objects teleport. Coordinate exit and entry order with `AnimatePresence` or the framework equivalent, and keep both endpoints mounted only when the transition contract expects it.

Animate between genuinely interpolable values. Resolve classes, CSS variables, `auto`, percentages, filters, and compound transforms to compatible start/end representations before blaming the library. Do not hide a discrete layout jump behind an easing curve.

Use `initial={false}` when the mounted state already represents the user's saved or interactive reality and an entrance animation would falsely replay a change. Keep true first-run entrances explicit rather than disabling them globally.

## Measure The Shipped Path

For complex, continuous, gesture-driven, canvas/WebGL, or suspected performance-sensitive motion, profile before and after in a production build on representative lower-end hardware and a normal target. Record only the metrics that could falsify the claim: frame time, long tasks, layout/paint cost, memory, or input latency. For a bounded microtransition, inspect interruption, repetition, and reduced motion in the shipped build; escalate to profiling when evidence suggests cost. Development-mode stutter and a flagship laptop's smoothness are both unreliable witnesses. Preserve the route, device, state, relevant capture or metrics, and reduced-motion result with the verdict.
