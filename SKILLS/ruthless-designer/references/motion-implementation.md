# Motion Implementation Traps

Load only while implementing motion. Skip for static critique or deciding whether motion belongs.

## Tooltips And Repeated Disclosure

Delay first tooltip enough to avoid accidental hover noise, then skip or sharply reduce delay between neighboring triggers. Reset grace period after leaving group. Keyboard focus immediate; content dismissible; never force fade replay while scanning toolbar.

## Geometry And Identity

SVG transforms: wrap moving shape in a `<g>` when transform origins or mixed primitives fight the browser. Set and check `transform-box: fill-box` plus intended `transform-origin`; inspect actual bounding box, not the `viewBox`. Every shared-layout transition needs unique, stable identity in rendered scope; duplicate layout IDs make unrelated objects teleport. Coordinate exit/entry with `AnimatePresence` or framework equivalent; mount both endpoints only when transition contract expects it.

Animate interpolable values. Resolve classes, CSS variables, `auto`, percentages, filters, and compound transforms to compatible start/end representations before blaming library. Do not hide discrete layout jumps behind easing curve. Use `initial={false}` when mounted state already is the user's saved or interactive reality and entrance would falsely replay change; keep true first-run entrances explicit; do not disable them globally.

## Measure The Shipped Path

Complex, continuous, gesture-driven, canvas/WebGL, or suspected performance-sensitive motion: profile before and after on production build, representative lower-end hardware, and normal target. Falsifying metrics only: frame time, long tasks, layout/paint cost, memory, input latency. Bounded microtransition: inspect interruption, repetition, reduced motion in shipped build; profile when evidence suggests cost. Dev-mode stutter and flagship-laptop smoothness are unreliable witnesses. Preserve route, device, state, capture or metrics, and reduced-motion result with verdict.

## Synchronize To Rendered Milestones

Do not coordinate state change with timeout copied from nominal CSS duration. Delays, reduced mode, background tabs, interrupted transitions, and later token changes make it drift.

Prefer:

- transitionend or animationend filtered to intended element and property;
- framework completion callback;
- timeline label or finished promise;
- observable cover or layout milestone;
- immediate reduced-motion branch.

Always include cancellation and cleanup; ignore stale completion from superseded transitions. If interaction is locked during rare scene cover, expose state and unlock on completion, cancellation, error, route change, and reduced motion.

## Static First, Enhancement Second

Render primary content in readable destination state by default. Add enhancement class or data attribute only after motion is ready. Failed script, hydration mismatch, blocked module, or unsupported API must leave interface usable.

First-run:

- keep critical heading, action, navigation visible;
- no-JavaScript fallback when initial CSS is hidden;
- avoid long chain whose later items never reveal after one error;
- do not replay after hydration, tab restoration, saved state, or routine navigation unless event genuinely happened again.

## Choose The Primitive

- CSS transitions: reversible hover, focus, pressed, disclosure, bounded state.
- CSS keyframes: finite authored sequences, known phases.
- Web Animations API: imperative cancellation, retargeting, playback inspection, coordinated native effects.
- FLIP/shared layout: same object changes geometry.
- View transitions: route or document continuity when identity and browser support justify it.
- Animation library/timeline: gestures, springs, orchestration, or project grammar CSS cannot express.
- Canvas/WebGL: genuinely spatial, simulated, or too numerous for DOM — not because gradient needed a shader.

Smallest primitive for cancellation, reduced mode, and proof — no extra dependency for one fade; do not force complex direct manipulation through CSS classes because dependencies are unfashionable.

## Preserve Composable Transforms

Several systems writing one transform property overwrite one another. Put independent responsibilities on nested elements or compose in one owner:

- outer: layout or shared-position motion;
- middle: gesture translation/scale;
- inner: hover, press, or authored deformation;
- SVG group: shape-local pivot.

Keep transform order explicit — translate-then-rotate differs from rotate-then-translate. Inspect real pivot and bounding box at final size.

Register and animate CSS custom properties only when syntax is declared and interpolated values are compatible; otherwise they change discretely while code appears animated.

## Stable State And Focus

Do not restart animation by changing component key unless remounting is intended product state — remounting can erase focus, selection, scroll position, media playback, local edits, and assistive-technology context.

Overlays and route transitions:

- move focus only after destination is ready; escape and back behavior deterministic; return focus to surviving logical origin;
- prevent invisible outgoing layers from intercepting pointer events; remove inert, aria-hidden, and temporary stacking state after completion;
- preserve scroll intentionally or reset explicitly.

## Production Diagnostics

When transition feels wrong, record separate causes:

- response latency before first visible frame; wrong origin or object identity; phase timing and overlap;
- main-thread or compositor pressure; layout shift or unstable destination; queued/stale completion;
- focus or pointer interception; reduced-mode mismatch.

Do not fix response latency by shortening visually correct settle. Do not fix wrong origin with a spring. Do not fix layout shift with longer fade.
